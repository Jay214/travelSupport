const router = require('koa-router')();
const userModel = require('../lib/mysql');
const checkUser = require('../midllewares/checkUser');
const moment = require('moment');
const multer = require('multer');  
const fs = require('fs')
let path = require("path");  

router.post('/upload', async (ctx,next) => {
        const file = ctx.request.files.img; // 获取上传文件
        console.log('file')
    const reader = fs.createReadStream(file.path); // 创建可读流
   
    const ext = file.name.split('.').pop(); // 获取上传文件扩展名
    const name = Math.random().toString();
    const upStream = fs.createWriteStream(`public/images/${name}.${ext}`); // 创建可写流
   
    reader.pipe(upStream); // 可读流通过管道写入可写流
    const url = `http://10.200.116.44/images/${name}.${ext}`
    await userModel.insertImg([url,ctx.request.body.postId])
        .then(res => {
            return ctx.body = url;
        }).catch(err => {
            console.error(err)
            ctx.body = '上传失败'
        })
    
    
    
})
module.exports = router;