
const loginSession = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
             next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logOutSession = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }else{
            res.redirect('/login')
        } 
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loginSession,
    logOutSession
}