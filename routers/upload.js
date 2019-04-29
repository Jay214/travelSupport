const router = require('koa-router')();
const userModel = require('../lib/mysql');
const checkUser = require('../midllewares/checkUser');
const moment = require('moment');
const multer = require('multer');  
const fs = require('fs')
let path = require("path");  
const gm = require('gm').subClass({imageMagick: true});

router.post('/upload', async (ctx,next) => {
   // console.log(ctx.request.files)
        const file = ctx.request.files.img; // 获取上传文件
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
    

   /*  var file = ctx.request.files.file; // 获取上传文件
    var reader =await fs.createReadStream(file.path); // 创建可读流
  await gm(reader)
   .resize(null, 200)
    .stream(function(err,stdout,stderr){
       if(!err&&stdout){
        const ext = file.name.split('.').pop(); // 获取上传文件扩展名
         name = Math.random().toString();
        const upStream = fs.createWriteStream(`public/images/${name}.${ext}`); // 创建可写流
        stdout.pipe(upStream); // 可读流通过管道写入可写流
         url = `http://10.200.116.44/images/${name}.${ext}` 
       }else{
           console.error('err: ',err)
       }
    }) */
   


   /*  ctx.body = {
        "code": 0 //0表示成功，其它失败
  ,"msg": "" //提示信息 //一般上传失败后返回
  ,"data": {
    "src":url
    ,"title": name //可选
  } 
         image:{ url: url } 
    }*/
    
    
})
module.exports = router;
