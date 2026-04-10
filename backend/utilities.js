const jwt=require('jsonwebtoken');

const authenticateToken=(req,res,next)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({error:true,message:"Access token is missing"});
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.status(403).json({error:true,message:"Invalid access token"});
        }
        req.user=user;
        next();
    });
}   

module.exports={authenticateToken};