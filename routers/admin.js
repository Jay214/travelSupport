const router = require('koa-router')()
const userModel = require('../lib/mysql')

router.post('/admin/login', async(ctx,next) => {
    ctx.body = 1
})
module.exports = router