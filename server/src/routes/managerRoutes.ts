import express from "express";

const router=express.Router();

router.get('/dashboard',(req,res)=>{
    res.send("This is manager dashboard route")
})

export default router;