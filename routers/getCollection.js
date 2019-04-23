const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.get('/getCollection',async(ctx,next) => {
    const { uid, type } = ctx.request.query
    let result;
   try {
    if(type==1||type==2){
        await userModel.findCollectPostByUid(uid,Number(type)-1)
            .then(res => {
                res.forEach(i => { i.tag = i.tag.split(',') })
                result = res
            })

        for(let i = 0,len = result.length;i<len;i++){
            await userModel.findImgByPostId(result[i].id)
                .then(res => {
                    result[i].img = res[0]['url']
                })
        }
        
    }else{
        await userModel.findCollectQusByUid(uid)
            .then(res => {
                res.forEach(i => { i.tag = i.tag.split(',') })
                result = res
            })
    }

    ctx.body = {
        data: result,
        msg: 'success'
    }
   } catch (error) {
       console.error('err: ',error)
       ctx.response.status = 500
       ctx.body = {
           data: 0,
           msg: '服务器出错'
       }
   }
})

module.exports = router