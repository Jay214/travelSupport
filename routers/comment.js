const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.post('/comment', async(ctx,next) => {
    const { uid, content, qid, moment, to_uid } = ctx.request.body;
    try {
        let id = await userModel.insertAnswer([uid,content,qid,moment,to_uid])
        .then(res => {
           // console.log(res)
           return res['insertId']
        })
        await userModel.updateQusAnswer(qid)
            .then(res => {
                ctx.body = {
                    data: 1,
                    msg: '发表成功'
                }
            })
    } catch (error) {
        console.log('err: ',error)
        ctx.body = {
            data: 0,
            msg: '发表失败'
        }
    }
    })

router.get('/getComments', async(ctx,next) => { 
   try{
       let answers =  await userModel.findAllComments(ctx.request.query.qid)
       for(let i = 0,len = answers.length;i<len;i++){
          await userModel.finDataById(answers[i]['uid'])
            .then(res => {
                answers[i]['username'] = res[0]['name']
                answers[i]['avator'] = res[0]['avator']
               return userModel.findSupportUid(ctx.request.query.ownid,answers[i]['id'],2)
            })
            .then(res => {
                answers[i].is_support = res.length>0 ? true : false
            })
            /* await userModel.findSupportUid(ctx.request.query.ownid,id[0]['id'])
                .then(res => {
                    console.log(res)
                    answers[i].is_support = res.length>0 ? true : false
                }) */
       }
       ctx.body = {
           data: answers,
           msg: 'success'
       }
   }catch(e){
       console.error('err: ',e)
       ctx.body = {
           data: 0,
           msg: 'error'
       }
   }
       

})
module.exports = router