
const adminLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }else{
            next()
        }
    } catch (error) {
     console.log(error);   
    }
}

const logOutSession = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next()
        }else{
            res.redirect('/admin')
        } 
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    adminLogin,
    logOutSession
}
