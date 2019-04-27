const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.post('/comment', async(ctx,next) => {
    const { uid, content, qid, moment, to_uid, flag } = ctx.request.body;
    try {
        const inserteQuery = flag==1 ? userModel.insertComment : userModel.insertAnswer
        await inserteQuery([uid,content,qid,moment,to_uid])
        .then(res => {
           // console.log(res)
           return res['insertId']
        })
        const updateQuery = flag==1 ? userModel.updatePostComment : userModel.updateQusAnswer
        await updateQuery(qid)
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
       const flag = ctx.request.query.flag;
       const findQuery = flag==1 ? userModel.findAllComments : userModel.findAllAnswers
       let answers =  await findQuery(ctx.request.query.qid)
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
       console.log(answers)
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