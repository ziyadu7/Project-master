const path = require('path')
const multer = require('multer')

function userMulter(){
    
const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
    callback(null,path.join(__dirname,'../public/userProfileIMG'))
    },
    filename:(req,file,callback)=>{
        const name = Date.now()+'-'+file.originalname;
        callback(null,name)
    }
});

const upload = multer({storage:storage})
return upload
}

module.exports = {
    userMulter
}