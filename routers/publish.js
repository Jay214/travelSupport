const router = require('koa-router')();
const userModel = require('../lib/mysql.js');
const md5 = require('md5');
const checkUser = require('../midllewares/checkUser');
const userContent = require('../midllewares/userContent');
const fs = require('fs');
const formidable = require('koa-formidable');
const path = require('path');
const moment = require('moment');

//发表文章
router.post('/publish', async(ctx, next) => {
   // console.log(ctx.request.body)
    let { title, content, moment, address, type, tag, name } = ctx.request.body;
 //   console.log( title, content, moment, address, type, tag, name)
    let uid;
    try {
        await userModel.findDataByName(name).then(res => {
            uid = res[0]['id'] 
                 })
             
         if(uid){
             insertData = type==2 ? userModel.insertQuestion : userModel.insertPost;
             await insertData([title, content, uid, moment, address, tag, type])
             .then(res => {
                ctx.body = {
                    res: res[0]['insertId']
                }
             })
         }else{
             ctx.body = {
                 err: '未登录',
                 res:''
             }
         }
    } catch (error) {
        console.log('err: ',error)
        ctx.body = {
            err: '服务器出错',
            res: ''
        }
    }
   
   
})

module.exports = router