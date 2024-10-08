const multer = require("multer");


const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" ) {
      // console.log('hi file')
      cb(null, true);
    } else {
      // console.log('hi file error')
      cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
    }
  };

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    },
  });

  const upload=multer({
    storage:storage,
    fileFilter
  })

  module.exports=upload

 