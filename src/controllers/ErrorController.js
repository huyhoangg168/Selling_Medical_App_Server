const CustomError = require('../Utils/CustomError');

const devErrors = (err, res) => {
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message,
        stackTrace: err.stack,
        error: err,
    });
};

const prodErrors = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Somethings went wrong! Please try again later.',
        });
    }

}

const uniqueErrorHandler = (err) =>{
    const field = err.errors[0].path;
    const value = err.errors[0].value;
    const msg = `There is already a record with ${field} '${value}'. Please use another ${field}!`;
    return new CustomError(msg, 400);
}

const validateErrorHandler = (err) =>{
    const errors = Object.values(err.errors).map(val => val.message);
    const errorMessages = errors.join('. ');
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400);
}

const jsonWebTokenErrorHandler = (err) =>{
    return new CustomError('Invalid token. Please login agian!', 401);
}

const tokenJWTExpiredErrorHandler = (err) =>{
    return new CustomError('JWT token has expired. Please login agian!', 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        if (err.name === 'JsonWebTokenError') err = jsonWebTokenErrorHandler(err);
        if (err.name === 'TokenExpiredError') err = tokenJWTExpiredErrorHandler(err);
        devErrors(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        console.log(err.name)
        if (err.name === 'SequelizeUniqueConstraintError') err = uniqueErrorHandler(err);
        if (err.name === 'SequelizeValidationError') err = validateErrorHandler(err);
        if (err.name === 'JsonWebTokenError') err = jsonWebTokenErrorHandler(err);
        if (err.name === 'TokenExpiredError') err = tokenJWTExpiredErrorHandler(err);
        prodErrors(err, res);
    }
}