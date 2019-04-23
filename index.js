const koa = require("koa");   //node框架
const path = require("path");  
//const bodyParser = require("koa-bodyparser"); //表单解析中间件
const session = require("koa-session-minimal");   //处理数据库的中间件
const MysqlStore = require("koa-mysql-session");  //处理数据库的中间件
const router = require("koa-router");     //路由中间件
const config = require('./config/default.js');    //引入默认文件
const koaStatic = require("koa-static");  //静态资源加载中间件
const staticCache = require('koa-static-cache')
const koaBody = require('koa-body');
const app = new koa();
app.use(koaBody({

    multipart: true,
  
    formidable: {
  
      maxFileSize: 200*1024*1024 // 设置上传文件大小最大限制，默认2M
  
    }
  
  }));
//session存储配置，将session存储至数据库
/* const sessionMysqlConfig = {
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST,
}
 */
/* //配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
}))
 */
//配置静态资源加载中间件
app.use(koaStatic(
    path.join(__dirname , './public')
))

//使用表单解析中间件
/* app.use(bodyParser({
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb"
}));
 */
//使用新建的路由文件
//获取用户信息
app.use(require('./routers/signin.js').routes())
//注册
//app.use(require('./routers/signup.js').routes())

//查询城市景点
 app.use(require('./routers/getSightList.js').routes())
//查询景点详情
app.use(require('./routers/getSightDetail.js').routes())

app.use(require('./routers/getTravelList.js').routes())

app.use(require('./routers/publish').routes())
//文章页

app.use(require('./routers/upload').routes())
//文章详情
app.use(require('./routers/getPost').routes())
//问题列表
app.use(require('./routers/getQuestionList').routes())
//点赞与收藏
app.use(require('./routers/triggerInfo').routes())
//发表回答
app.use(require('./routers/comment').routes())
app.use(require('./routers/personPost').routes())
app.use(require('./routers/getCollection').routes())
/*
app.use(require('./routers/share').routes())
//个人日记
app.use(require('./routers/selfNote').routes()) */
//监听在8080端口
app.listen(80) 

console.log(`listening on port ${config.port}`)
