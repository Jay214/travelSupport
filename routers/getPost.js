const router = require('koa-router')();
const userModel = require('../lib/mysql');

router.get('/getPost', async(ctx,next) => {
    const { id, uid, type, ownid } = ctx.request.query;
    let result;
    try{
        if(type!==''){
            await userModel.updatePostPv(id)
            await Promise.all([userModel.findPostById(id),userModel.findImgByPostId(id),userModel.findAuthorByUid(uid)])
                .then(res => {
                    result = res[0][0]
                    result.imgs = res[1]
                    result.tag = res[0][0].tag.split(',')
                    result.avator = res[2][0]['avator']
                    result.user = res[2][0]['name']
                  
                })
            await userModel.findSupportUid(ownid,id,type)
                .then(res => {
                 //   console.log(res)
                    result.is_support = res.length>0 ? true : false
                })
        }else{
            await userModel.updateQuestionPv(id)
            await Promise.all([userModel.findQuestionById(id), userModel.findAuthorByUid(uid)])
                .then(res => {
                    result = res[0][0]
                    result.tag = res[0][0].tag.split(',')
                    result.avator = res[1][0]['avator']
                    result.user = res[1][0]['name']
                   
                })
        }
       const t = type !=='' ? type : 2;
        await userModel.findCollectUid(ownid,id,t)
            .then(res => {
              //  console.log('res--------',res)
                result.is_collect = res.length>0 ? true : false;
                ctx.body = {
                    data: result
                }
            })
       
    }catch(e){
        console.error("err: ",e)
        ctx.body = {
            data:{},
            msg: '服务器出错' 
        }
    }
   
})

module.exports = router