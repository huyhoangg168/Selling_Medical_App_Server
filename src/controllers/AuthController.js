const asyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const jwt = require('jsonwebtoken');
const util = require('util');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const authService = require('../services/AuthService');
const tokenService = require('../services/TokenService');
const { User } = require('../models');


const signAccessToken = id =>{
    return jwt.sign({ id: id }, process.env.ACCESS_SECRECT_STR, {
        expiresIn: process.env.ACCESS_EXPIRES
      });
}


const signRefreshToken = id =>{
    return jwt.sign({ id: id }, process.env.REFRESH_SECRECT_STR, {
        expiresIn: process.env.REFRESH_EXPIRES
      });
}


const createSendRespone = async (user, statusCode, res) =>{

    const refreshToken = signRefreshToken(user.id);
    const accessToken = signAccessToken(user.id);
    await tokenService.saveToken(user.id, refreshToken);  //save refresh token to DB

    //user.password = undefined;
    
    res.status(statusCode).json({token: accessToken, refreshToken: refreshToken});
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await authService.signup(req.body);
    res.status(201).json({status: 201, message: "Register successfully !"})
    
});

exports.login = asyncErrorHandler(async (req, res, next) => {

    const {phone, password} = req.body;

    const user = await authService.login(phone, password, next);
    
    createSendRespone(user, 200, res);  
    
});


exports.loginWithGoogle = asyncErrorHandler(async (req, res, next) => {

    const { idToken } = req.body;
    const user = await authService.loginWithGoogle(idToken);
    createSendRespone(user, 200, res);  
    
});

exports.sendOTP = asyncErrorHandler(async (req, res, next) => {

    const phoneNumber = req.body.phoneNumber;
    const otp = await authService.sendOTP(phoneNumber);
    res.status(200).json({otp: otp});
    
});

exports.verifyOTP = asyncErrorHandler(async (req, res, next) => {

    const {phoneNumber, otpCode} = req.body;
    const result = await authService.verifyOTP(phoneNumber, otpCode);
    res.status(204).end();
    
});



exports.logout = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;
    await tokenService.destroyToken(userId);
    res.status(204).end();
});

exports.refreshAccessToken = asyncErrorHandler(async (req, res, next) => {
    // 1. Lấy chuỗi refresh token từ Android gửi lên (qua body)
    const { refreshToken } = req.body; 

    // Kiểm tra nếu client không gửi gì lên
    if (!refreshToken) {
        const error = new CustomError('Please provide refresh token', 400);
        return next(error);
    }

    // 2. Giải mã và verify token
    let decoded;
    try {
        // Dùng promisify để verify token với Secret Key
        decoded = await util.promisify(jwt.verify)(refreshToken, process.env.REFRESH_SECRECT_STR);
    } catch (err) {
        // Nếu verify lỗi (ví dụ: token hết hạn, sai chữ ký, hoặc token rác)
        const error = new CustomError('Invalid Refresh Token or Token expired', 401);
        return next(error);
    }

    // 3. Lấy User ID từ payload đã giải mã
    const userId = decoded.id; 

    // 4. Kiểm tra đối chiếu với Database (TokenService)
    // Lấy token đang lưu trong DB của user này ra
    const storedTokenData = await tokenService.getRefreshTokenByUserId(userId);

    // Logic kiểm tra:
    // - storedTokenData: Phải tồn tại (User chưa bị logout/hủy token)
    // - storedTokenData.refresh_token: Phải khớp hoàn toàn với token client gửi lên
    if (!storedTokenData || storedTokenData.refresh_token !== refreshToken) {
        const error = new CustomError('Invalid refresh token or user logged out', 401);
        return next(error);
    }

    // 5. Nếu mọi thứ hợp lệ -> Cấp Access Token mới
    const newAccessToken = signAccessToken(userId);

    // Trả về cho client
    res.status(200).json({
        accessToken: newAccessToken
    });    
});

//Authentication
exports.protect = asyncErrorHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const user = await authService.protect(authHeader);
    req.user = user; //allow user
    next(); 
})


//Authorization
exports.restrict = (...role) => {
    return (req, res, next) => {
        if(!role.includes(req.user.role)){
            const error = new CustomError('You do not have permission to perform this action', 403);
            next(error);
        }
        next();
    }
};