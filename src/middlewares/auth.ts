import { NextFunction, Request, Response } from "express"
import { secret } from "../modules/Auth/auth.service";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export enum UserRole{
    ADMIN="ADMIN",
    PROVIDER="PROVIDER",
    CUSTOMER="CUSTOMER"
}


const auth =(...roles:UserRole[])=>{
    // console.log(roles)
  return async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.headers.authorization
        if(!token){
        throw new Error("No token provided")
    }
    const decoded =jwt.verify(token, secret)
    console.log(decoded)
    const isUserEXists= await prisma.user.findUnique({
        where:{email:(decoded as any).email}
    })
    if(!isUserEXists){
        throw new Error("User not found")
    }
    if(isUserEXists.status!=="ACTIVE"){
        throw new Error("User is not active")
    }

    if(roles.length && !roles.includes((decoded as any).role)){
        throw new Error("Unauthorized")
    }
    req.user=decoded as any
    next()

}catch (error) {
   next(error)


}  }



    
}

export default auth;