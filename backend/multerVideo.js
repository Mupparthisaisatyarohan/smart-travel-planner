const multer=require('multer');
const path=require('path');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname));
    },
});

// File filter to allow only video files
const fileFilter=(req,file,cb)=>{
    const allowedMimes=['video/mp4','video/mpeg','video/quicktime','video/x-msvideo','video/webm','video/3gpp'];
    if(allowedMimes.includes(file.mimetype)){
        cb(null,true);
    } else{
        cb(new Error('Only video files are allowed! Supported formats: MP4, MPEG, MOV, AVI, WebM, 3GP'),false);
    }
};

// Initialize multer for videos
const uploadVideo=multer({
    storage,
    fileFilter,
    limits:{fileSize:500*1024*1024} // 500MB limit for videos
});

module.exports=uploadVideo;
