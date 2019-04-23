const router = require('koa-router')();
const userModel = require('../lib/mysql');
const moment = require('moment');


  

router.get('/getQuestionList',async(ctx,next)=>{
    const { name, tag, type } = ctx.request.query;
    const findPosts = tag=='全部' ? userModel.findAllQuestion : userModel.findQuestionWithTag
        await findPosts(name,tag)
            .then(res => {
                 res.forEach(i => { i.tag = i.tag.split(',') })
                 ctx.body = {
                    data: res
                }
              
            }).catch(err => {
                console.error('err: ', err)
                ctx.body = {
                    statusCode: 0,
                    msg: '查询信息失败',
                    data: ''
                  }
            })
       
    
})

module.exports = router; 