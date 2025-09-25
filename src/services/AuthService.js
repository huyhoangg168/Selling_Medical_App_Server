const { User, Token, OTP } = require('../models/index');
const util = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncErrorWrapper = require('../Utils/AsyncErrorWrapper');
const CustomError = require('../Utils/CustomError');
const userService = require('../services/UserService');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// const twilio = require('twilio');
// const twilio_client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// const otpGenerator = require('otp-generator');


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

exports.login = asyncErrorWrapper(async (phoneNumber, password, next) => {
    if (!phoneNumber || !password) {
        const error = new CustomError('Please provide phone number and password for login!', 400);
        throw error;
    }
    const user = await User.scope('withPassword').findOne({ where: { phone: phoneNumber } });

    if (!user) {
        const error = new CustomError(`The user login with phone number: ${phoneNumber} does not exits`, 401)
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new CustomError('Incorrect password!', 400);
        throw error;
    }

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

