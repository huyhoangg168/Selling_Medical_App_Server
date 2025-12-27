const { User, Token, OTP } = require('../models/index');
const util = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const CustomError = require('../Utils/CustomError');
const userService = require('../services/UserService');
const axios = require('axios');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const redisClient = require('../config/redisClient');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const path = require('path');

// Đường dẫn đến file JSON bạn vừa tải về
const keyPath = path.join(__dirname, '../../android-key.json'); 

const client2 = new RecaptchaEnterpriseServiceClient({
    keyFilename: keyPath
});

// const twilio = require('twilio');
// const twilio_client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// const otpGenerator = require('otp-generator');

// CẤU HÌNH RATE LIMITER TRONG REDIS
// 1. Limiter đếm số lần sai (để yêu cầu Captcha)
const maxWrongAttemptsByIPperDay = 100;
const limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block 1 ngày nếu spam quá kinh khủng
});

// 2. Limiter đếm số lần sai của SĐT (để khóa tài khoản)
const maxConsecutiveFailsByPhone = 5;
const limiterConsecutiveFailsByPhone = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consecutive_phone',
    points: maxConsecutiveFailsByPhone,
    duration: 60 * 60 * 24, // Lưu lâu dài cho đến khi login đúng
    blockDuration: 60 * 30, // Khóa 30 phút nếu sai quá 5 lần
});

// Hàm phụ trợ: Xác thực Captcha với Google
async function verifyCaptcha(captchaToken) {
    if (!captchaToken) return false;
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Cấu hình trong .env
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
        const response = await axios.post(verifyUrl);
        return response.data.success;
    } catch (error) {
        console.error("Captcha verify error:", error);
        return false;
    }
}

async function verifyCaptchaEnterprise(token) {
    const projectID = "boxwood-valve-482512-u9"; // ID Project 
    const recaptchaKey = "6LeEYDgsAAAAANgtg14NwAM7LsnbYNdCIg1GMdMH"; // Site Key Enterprise
    const projectPath = client2.projectPath(projectID);

    const request = {
        parent: projectPath,
        assessment: {
            event: {
                token: token,
                siteKey: recaptchaKey,
            },
        },
    };

    try {
        const [response] = await client2.createAssessment(request);

        // Kiểm tra token có hợp lệ không
        if (!response.tokenProperties.valid) {
            console.log("Token invalid:", response.tokenProperties.invalidReason);
            return false;
        }

        // Kiểm tra Action có khớp không (Ở Android mình đặt là LOGIN)
        if (response.tokenProperties.action !== "LOGIN") {
            console.log("Sai Action");
            return false;
        }

        // Kiểm tra điểm số (Score) - Enterprise trả về điểm từ 0.0 đến 1.0
        // Bạn có thể chặn nếu điểm thấp (ví dụ < 0.5 là bot)
        console.log("Score:", response.riskAnalysis.score);
        return response.riskAnalysis.score > 0.5;

    } catch (e) {
        console.error("Lỗi verify Enterprise:", e);
        return false;
    }
}


async function verifyGoogleIdToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const username = payload.name;
    const image = payload.picture;
    return { email, username, image };

};

// Send SMS with TWILIO
// const generateOtp = () => {
//     return otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         specialChars: false,
//         digits: true,
//         lowerCaseAlphabets: false,
//     });
// };

// exports.sendOTP = asyncErrorWrapper(async (phoneNumber) => {
//     //Check user is exits
//     const user = await User.findOne({where: {phone : phoneNumber}})
//     if (user) {
//         const error = new CustomError(`The phone number: ${phoneNumber} is already exists !`, 400);
//         throw error;
//     }

//     const internationalPhoneNumber = "+84" + phoneNumber.substring(1);
//     const otp = generateOtp();

//     // //send otp to client
//     // const result = client.messages.create({
//     //     body: `Your OTP is: ${otp}`,
//     //     from: process.env.PHONE_NUMBER,
//     //     to: internationalPhoneNumber
//     // });

//     //save otp to DB
//     const salt = await bcrypt.genSalt(10);
//     const encryptCode = await bcrypt.hash(otp, salt);
//     const expiresAt = new Date(Date.now() + 90 * 1000); // expires in 90 seconds

//     await OTP.upsert({
//         phoneNumber: phoneNumber,
//         otpCode: encryptCode,
//         expiresAt: expiresAt
//     });
    
//     return otp;

// });


// exports.verifyOTP = asyncErrorWrapper(async (phoneNumber, otpCode) => {
//     //verify otp
//     const otp = await OTP.findByPk(phoneNumber);
//     if (!otp ) {
//         throw new CustomError(`No otp has been sent `, 400);
//     }
    
//     if ( new Date(Date.now()) > otp.expiresAt) {
//         throw new CustomError(`OTP has expired!`, 400);
//     }

//     const isMatch = await bcrypt.compare(otpCode, otp.otpCode);
//     if (!isMatch) {
//         throw new CustomError('OTP is invalid!', 400);
//     }

//     return true;
// });



exports.loginWithGoogle = asyncErrorWrapper(async (idToken) => {
    const { email, username, image } = await verifyGoogleIdToken(idToken);
    const [user, created] = await User.findOrCreate({
        where: {
            email: email
        },
        defaults: {
            email: email,
            username: username,
            image: image,
        }
    })

    return user;
});


exports.signup = asyncErrorWrapper(async (userData) => {
    const user = await User.create(userData, { fields: ['phone', 'password', 'confirmPassword', 'passwordChangedAt'] });
    return user;
});

exports.login = asyncErrorWrapper(async (phoneNumber, password, captchaToken, ipAddr) => {
    if (!phoneNumber || !password) {
        throw new CustomError('Vui lòng cung cấp số điện thoại và mật khẩu!', 400);
    }

    const phoneKey = phoneNumber; 

    const resIp = await limiterSlowBruteByIP.get(ipAddr);
    if (resIp !== null && resIp.consumedPoints > maxWrongAttemptsByIPperDay) {
        throw new CustomError('IP của bạn bị chặn 1 ngày do nghi ngờ spam!', 429);
    }
    
    // --- BƯỚC 1: KIỂM TRA CÓ BỊ KHÓA KHÔNG (Layer 3) ---
    const resPhone = await limiterConsecutiveFailsByPhone.get(phoneKey);
    
    // Nếu điểm sai > số lần cho phép và thời gian khóa chưa hết
    if (resPhone !== null && resPhone.consumedPoints >= maxConsecutiveFailsByPhone) {
        const retrySecs = Math.round(resPhone.msBeforeNext / 1000) || 1;
        throw new CustomError(`Tài khoản tạm khóa do nhập sai quá nhiều. Thử lại sau ${retrySecs} giây`, 429);
    }

    // --- BƯỚC 2: KIỂM TRA CÓ CẦN CAPTCHA KHÔNG (Layer 4) ---
    // Logic: Nếu đã sai > 3 lần thì bắt buộc phải có Captcha
    if (resPhone !== null && resPhone.consumedPoints >= 3) {
        if (!captchaToken) {
            throw new CustomError('Hệ thống phát hiện bất thường. Vui lòng xác thực CAPTCHA!', 403); // Mã lỗi riêng để Client hiện Captcha
        }
        const isCaptchaValid = await verifyCaptchaEnterprise(captchaToken);
        if (!isCaptchaValid) {
            throw new CustomError('Xác thực CAPTCHA thất bại!', 400);
        }
    }

    // --- BƯỚC 3: KIỂM TRA USER & PASS ---
    const user = await User.scope('withPassword').findOne({ where: { phone: phoneNumber } });

    // Hàm xử lý khi đăng nhập thất bại
    const handleLoginFail = async () => {
        try {
            // Tăng biến đếm sai cho SĐT
            await limiterConsecutiveFailsByPhone.consume(phoneKey); 

            // --- TĂNG BIẾN ĐẾM SAI CHO IP ---
            await limiterSlowBruteByIP.consume(ipAddr);
        } catch (rlRejected) {
            // Nếu nhảy vào đây nghĩa là đã vượt quá giới hạn (bị Block)
            throw new CustomError('Bạn đã nhập sai quá nhiều lần. Tài khoản bị khóa 30 phút!', 429);
        }
    };

    if (!user) {
        await handleLoginFail();
        throw new CustomError(`Thông tin đăng nhập không chính xác`, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await handleLoginFail();
        
        // Lấy số lần đã sai để báo cho user
        const currentFail = await limiterConsecutiveFailsByPhone.get(phoneKey);
        const failCount = currentFail ? currentFail.consumedPoints : 1;
        const left = maxConsecutiveFailsByPhone - failCount;
        
        if (left <= 0) {
             throw new CustomError('Bạn đã nhập sai quá nhiều lần. Tài khoản bị khóa 30 phút!', 429);
        }

        throw new CustomError(`Mật khẩu không đúng! Bạn còn ${left} lần thử.`, 401);
    }

    // --- BƯỚC 4: ĐĂNG NHẬP THÀNH CÔNG -> RESET COUNTER ---
    await limiterConsecutiveFailsByPhone.delete(phoneKey); // Xóa bộ đếm sai

    return user;
});


exports.protect = asyncErrorWrapper(async (authHeader) => {
    //1. Read the token & check if it exits
    const accessToken = authHeader && authHeader.startsWith('Bearer') && authHeader.split(' ')[1]; // Bearer <token>
    if (!accessToken) {
        const error = new CustomError('You are not logged in!', 401);
        throw error;
    }
    //2. validate token
    const decodedAccessToken = await util.promisify(jwt.verify)(accessToken, process.env.ACCESS_SECRECT_STR);
    const token = await Token.findOne({ where: { id_user: decodedAccessToken.id } });
    //if DB not have refresh token
    if (!token) {
        const error = new CustomError('Invalid session. Please login again!', 401);
        throw error;
    }
    const decodedRefreshToken = await util.promisify(jwt.verify)(token.refresh_token, process.env.REFRESH_SECRECT_STR);
    //if refresh token was changed
    if (decodedAccessToken.iat * 1000 < decodedRefreshToken.iat * 1000) {
        const error = new CustomError('Your session has expired. Please login again!', 401);
        throw error;
    }
    //3. If the user does not exits
    const user = await User.findByPk(decodedAccessToken.id);
    if (!user) {
        const error = new CustomError('The user with the given token does not exits', 401)
        throw error;
    }
    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChanged(decodedAccessToken.iat);
    if (isPasswordChanged) {
        const error = new CustomError('The password has been changed recently. Please login again!', 401)
        throw error;
    }
    //5. Allow user to access route
    return user;
});

