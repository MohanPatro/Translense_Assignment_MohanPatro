const sendResponse =async (res, statusCode, message, data = null, error = null) => {
    return new Promise((resolve,reject)=>{
        res.status(statusCode).json({
        message,
        data,
        error,
        success: statusCode >= 200 && statusCode < 300,
        });
    })
  };
  
  module.exports = sendResponse;