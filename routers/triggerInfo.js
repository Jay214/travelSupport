const router = require('koa-router')();
const userModel = require('../lib/mysql');

router.get('/triggerInfo', async(ctx,next) => {
    const { isGet, uid, post_id, type,flag,t } = ctx.request.query;
    console.log(ctx.request.query)
    const trigeer = isGet=='true' ? '-' : '+'
    try {
        if(flag==2){
            const query = isGet=='true' ? userModel.deleteCollection : userModel.insertCollection;
            await Promise.all([query([uid,post_id,t]), userModel.updateQuestionCollection(trigeer,post_id,t)])
                .then(res => {
                   // console.log(res)
                })
        }
        else{

        if(type==1){
            const query = isGet=='true' ? userModel.deleteSupport : userModel.insertSupport;
            await Promise.all([query([uid,post_id,t]), userModel.updatePostSupport(trigeer,post_id,t)])
        }else{
            const query = isGet=='true' ? userModel.deleteCollection : userModel.insertCollection;
            await Promise.all([query([uid,post_id,t]), userModel.updatePostCollection(trigeer,post_id,t)])
        }

    }
        ctx.body = {
            data: 1,
            msg: '更新成功'
        }        
    } catch (error) {
        console.error('err: ',error)
        ctx.response.status = 500
        ctx.body = { 
            data: 0,
            msg: '更新失败'
        }
    }
    
})

router.get('/triggerSupport', async(ctx,next) => {
    const { isGet, uid, post_id } = ctx.request.query;
    console.log(ctx.request.query)
    const trigeer = isGet=='true' ? '-' : '+'
    const query = isGet=='true' ? userModel.deleteSupport : userModel.insertSupport;
    await Promise.all([query([uid,post_id,2]), userModel.updateAnswerSupport(trigeer,post_id,2)])
        .then(res => {
            ctx.body = {
                data: 1,
                msg: '更新成功'
            }
        }).catch(e => {
            console.error('err: ',e)
            ctx.response.status = 500
            ctx.body = {
                data: 0,
                msg: '更新失败'
            }
        })
})


module.exports = router