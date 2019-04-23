var router = require('koa-router')();
var userModel = require('../lib/mysql.js')
//var md5 = require('md5')
router.post('/signin', async(ctx, next) => {
    
    var name = ctx.request.body.nickName;
    await userModel.findDataByName(name)
        .then(result => {

            var res = JSON.parse(JSON.stringify(result))
          //  console.log(res)
            if (res.length&&name === res[0]['name']) {
                //    console.log('登录成功')
                    ctx.body = {
                        id: res[0]['id'],
                    }

            }else{
               
                 userModel.insertUser([name,ctx.request.body.avatarUrl])
                 .then(res => {
                    console.log(res)
                    ctx.body = {
                        id: res['insertId'],
                    }
                })
            }
        })
        .catch(err => {
            ctx.body = {
                code: 3,
                errorMsg: '服务器查询出错'
            }
            console.log('err: ',err)
        })

})

module.exports = router


