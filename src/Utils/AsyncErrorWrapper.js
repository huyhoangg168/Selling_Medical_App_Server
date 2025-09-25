module.exports = (func) => {
    return async (...args) => {
        return func(...args).catch(error => {
            //console.error(error);
            throw error;  
        });
    };
};