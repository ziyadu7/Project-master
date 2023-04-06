const multer = require('multer')
const path = require('path')

function createMulter(){
    const storage = multer.diskStorage({
        destination:(req,file,callback)=>{
        callback(null,path.join(__dirname,'../public/proImage/temp'))
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
    createMulter
}
