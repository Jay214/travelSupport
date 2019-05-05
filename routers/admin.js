const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.post('/admin/login', async(ctx,next) => {
    ctx.body = 1
})

router.post('/admin/posts', async(ctx, next) => {
    const {address,type} = ctx.request.body;
    let query;
    let data = {}
    try {
        if(type==3){
            query = userModel.findPostsByCity;
            query2 = userModel.findQuestionByCity;
            await Promise.all([query(address),query2(address)])
                .then(res => {
                    data = res[0].concat(res[1]);
                })
    
        }else{
            query = type!=2 ? userModel.findAllPost : userModel.findQuestionByCity;
            await query(address,type)
                .then(res => {
                    data = res;
                })
        }
        ctx.body = {
            data: data
        }
    } catch (error) {
        console.error('err: ',error)
        ctx.response.status = 500;
        ctx.body = {
            data:[]
        }
    }
    
})

router.get('/admin/deletePosts', async(ctx,next) => {
    console.log(ctx.request.query)
    const {id,type} = ctx.request.query;
    const query = type !== undefined ? userModel.deletePost:userModel.deleteQuestion;
    await query(id)
        .then(res => {
            ctx.body = 1;
        }).catch(e => {
            console.error('err: ',e)
            ctx.response.status = 500;
            ctx.body = 0;
        })
})
module.exports = router