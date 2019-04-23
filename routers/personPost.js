const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.get('/personPost', async(ctx, next) => {
    const uid = ctx.request.query.uid
    try {
        let result =  await Promise.all([userModel.findAllSelfPost(uid),userModel.findAllSelfQuestion(uid)])
        for(let i = 0,len = result[0].length;i<len;i++){
            await userModel.findImgByPostId(result[0][i].id)
                .then(res => {
                    result[0][i].img = res[0]['url']
                })
        }
        let res =  result[0].concat(result[1]).sort((a,b) => {
            return a.moment - b.moment
            }) 
            res.forEach(i => { i.tag = i.tag.split(',') })
            ctx.body = {
                data: res,
                msg: 'success'
            }
    } catch (error) {
        console.error('err: ',error)
        ctx.response.status = 500;
        ctx.body = {
            data: 0,
            msg: '服务器错误'
        }
    }
})

router.get('/deletePost', async(ctx,next) => {
    const deleteQuery = ctx.request.query.flag == 1 ? userModel.deletePost : userModel.deleteQuestion
    await deleteQuery(ctx.request.query.id)
        .then(res => {
            ctx.body = {
                data: 1,
                msg: 'success'
            }
        }).catch(e => {
            console.log('err: ', e)
            ctx.response.status = 500
            ctx.body = {
                data: 0,
                msg: '删除失败'
            }
        }) 
})



module.exports = router