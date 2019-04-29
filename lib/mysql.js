

//import { create } from 'domain';

var mysql = require('mysql');
var config = require('../config/default.js')
//建立数据库连接池
var pool = mysql.createPool({
    host: config.database.HOST,
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE
});

let query = function(sql, values) {
    return new Promise((resolve, reject)=>{
        pool.getConnection(function (err,connection) {
            if(err){
                reject(err);
            }else{
                connection.query(sql,values,(err,rows)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(rows);
                    }
                    connection.release(); //为每一个请求都建立一个connection使用完后调用connection.release(); 直接释放资源。
                                          //query用来操作数据库表
                })
            }
         
    })
    })
}
 

//用户表
var users = `create table if not exists users(
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    avator VARCHAR(255) NOT NULL, 
    PRIMARY KEY (id)
);`

//游记/攻略表
//评论不确定  图片
var posts = `create table if not exists posts(
        id INT(11) NOT NULL AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        uid INT(11) NOT NULL,
        moment VARCHAR(30) NOT NULL,
        comments INT(11) NOT NULL DEFAULT '0',
        pv VARCHAR(40) NOT NULL DEFAULT '0',
        type INT(11) NOT NULL DEFAULT '0',
        collection INT(11) NOT NULL DEFAULT '0',
        support INT(11) NOT NULL DEFAULT '0',
        address VARCHAR(100) NOT NULL, 
        tag VARCHAR(30) NOT NULL,
        PRIMARY KEY (id) ,
        FOREIGN KEY (uid) REFERENCES users(id)
        ON DELETE CASCADE

);`

//问题表
var question = `create table if not exists question(
    id INT(11) NOT NULL AUTO_INCREMENT,
    uid INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    moment VARCHAR(30) NOT NULL,
    pv INT(11) NOT NULL DEFAULT '0',
    collection INT(11) NOT NULL DEFAULT '0',
    address VARCHAR(100) NOT NULL,
    answer INT(11) NOT NULL DEFAULT '0',
    tag VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
)`

//回答表
var answer =`create table if not exists answer(
    id INT(11) NOT NULL AUTO_INCREMENT,
    uid INT(11) NOT NULL,
    content VARCHAR(255) NOT NULL,
    qid INT(11) NOT NULL,
    moment VARCHAR(30) NOT NULL,
    support INT(11) NOT NULL DEFAULT '0',
    to_uid INT(11) DEFAULT '0', 
    PRIMARY KEY (id),
    FOREIGN KEY (qid) REFERENCES question(id)
    ON DELETE CASCADE
)`

var comments =`create table if not exists comments(
    id INT(11) NOT NULL AUTO_INCREMENT,
    uid INT(11) NOT NULL,
    content VARCHAR(255) NOT NULL,
    qid INT(11) NOT NULL,
    moment VARCHAR(30) NOT NULL,
    support INT(11) NOT NULL DEFAULT '0',
    to_uid INT(11) DEFAULT '0', 
    PRIMARY KEY (id)
)`


//收藏表
 var collection = `create table if not exists collection(
     id INT(11) NOT NULL AUTO_INCREMENT,
     uid INT(11) NOT NULL,
     post_id INT(11) NOT NULL,
     type INT NOT NULL,
     PRIMARY KEY (id),
     FOREIGN KEY (uid) REFERENCES users(id)  
     ON DELETE CASCADE
 );`

 //图片表
 var imgs = `create table if not exists imgs(
     id INT(11) NOT NULL AUTO_INCREMENT,
     url VARCHAR(100) NOT NULL,
     postid INT(11) NOT NULL,
     PRIMARY KEY (id),
     FOREIGN KEY (postid) REFERENCES posts(id)
     ON DELETE CASCADE
 )`

 //点赞表
 //
var supports = `create table if not exists supports(
    id INT(11) NOT NULL AUTO_INCREMENT,
    post_id INT(20) NOT NULL,
    uid INT(11) NOT NULL,
    type INT NOT NULL,
    status INT(11) NOT NULL DEFAULT '0',
    PRIMARY KEY (id)
)`


let createTable = function(sql){
    return query(sql, []);
}

//建表
createTable(users);
createTable(posts);
createTable(question)
createTable(answer)
createTable(collection)
createTable(imgs)
createTable(supports)
createTable(comments)

/* let findCollectPostByUid = function(uid){
    let _sql = `select c.*,p.* from (select * from collection where uid=${uid}) c,posts p where c.postid=p.id`
    return query(_sql);
} */

//通过文章的名字查找用户
let findPostByUser = function(name){
    let _sql = `SELECT * from posts where name="${name}"`
    return query(_sql);
}
//通过用户id查找文章
let findPostByUserId = function(uid){
    let _sql = `SELECT * from posts where uid="${uid}"`
    return query(_sql);
}

//通过评论id查找
let findCommentById = function(id){
    let _sql =  `SELECT * from comment where postid="${id}"`
    return query(_sql);
}

//通过用户名查询点赞记录
let findLikeByName = function(name){
    let _sql = `select * from likes where name="${name}"`
    return query(_sql);
}

// 查询分页文章
let findPostByPage = function(page){
    let _sql = ` select * FROM posts limit ${(page-1)*10},10;`
    return query( _sql)
  }

//更新修改文章
let updatePost = function(values){
    let _sql = `update posts set title=?,content=? where id=?`
    return query(_sql,values);
}

//删除评论
let deleteComment = function(id){
    let _sql = `delete from comment where id = "${id}"`
    return query(_sql);
}

//删除所有评论
let deleteAllPostComment = function(id){
    let _sql = `delete from comment where postid = ${id}`
    return query(_sql);
}

//查找
let findCommentLength = function(id){
    let _sql = `select content from comment where postid in (select id from posts where id=${id})`
    return query(_sql);
}
// 评论分页
let findCommentByPage = (page,articleId) => {
    let _sql = `select * from comment where postid=${articleId} order by id desc limit ${(page-1)*10},10;`
    return query(_sql);
  }

//根据id查询用户
let finDataById = (id) => {
    let _sql = `select * from users where id = ${id}`
    return query(_sql)
}
//新增用户
let insertUser = (value) => {
    let _sql = `insert into users(name, avator) values(?,?);`;
    return query(_sql,value)
}
//查询用户
let findDataByName = (value) => {
    let _sql =  `select * from users where name = ?`;
    return query(_sql,value)
}
//查询城市
let findCityId = (value) => {
    let _sql = `select num from city where name = ?`;
    return query(_sql,value) 
}
//插入文章
let insertPost = (value) => {
    let _sql = `insert into posts(title, content, uid, moment, address, tag, type) 
    value(?,?,?,?,?,?,?)`;
    return query(_sql,value)
}
//上传图片
let insertImg = (value) => {
    let _sql = `insert into imgs(url, postid) value(?,?)`
    return query(_sql,value)
}
//查询文章
let findAllPost = (name,type) => {
    let _sql = `select * from posts where address like'%${name}%' and type=${type}`
    return query(_sql)
}
//根据类型和标签查询文章
let findPostWithTag = (name,type,tag) => {
    let _sql = `select * from posts where address like'%${name}%' and type like'%${type}%' and tag like'%${tag}%'`
    return query(_sql)
}
let findPostsByCity = (address) => {
    let _sql = `select * from posts where address like'%${address}%'`
    return query(_sql)
}
let findQuestionByCity = (address) => {
    let _sql = `select * from question where address like'%${address}%'`
    return query(_sql)
}
let findPostByCityAndTag = (address,tag) => {
    let _sql = `select * from question where address like'%${address}%' and tag like'%${tag}%'`
    return query(_sql)
}

//查询文章图片
let findImgByPostId = (postId) => {
    let _sql = `select url from imgs where postid = ${postId}`
    return query(_sql)
}
//查询单篇文章
let findPostById = (id) => {
    let _sql = `select * from posts where id = ${id}`
    return query(_sql)
}
//根据文章uid查询作者
let findAuthorByUid = (uid) => {
    let _sql = `select * from users where id =${uid}`
    return query(_sql)
}
//增加文章pv
let updatePostPv = (id) => {
    let _sql = `update posts set pv = pv + 1 where id = ${id}`
    return query(_sql)
}
//新增问题
let insertQuestion = (value) => {
    let _sql = `insert into question(title, content, uid, moment, address, tag) value(?,?,?,?,?,?)`
    return query(_sql,value)
}

//查询问题列表
const findQuestionWithTag = (name,tag) => {
    let _sql = `select * from question where address like'%${name}%' and tag like'%${tag}%'`
    return query(_sql)
}
//根据地区查询问题
const findAllQuestion = (name) => {
    let _sql = `select * from question where address like'%${name}%'`
    return query(_sql)
}
//增加问题pv
let updateQuestionPv = (id) => {
    let _sql = `update question set pv = pv + 1 where id = ${id}`
    return query(_sql)
}
//查询问题详情
let findQuestionById = (id) => {
    let _sql = `select * from question where id = ${id}`
    return query(_sql)
}
//查询是否收藏
let findCollectUid = (uid,postId,type) => {
    let _sql = `select id from collection where uid = ${uid} and post_id = ${postId} and type = ${type}`
    return query(_sql)
}
//查询是否点赞
let findSupportUid = (uid,postId,type) => {
    let _sql = `select id from supports where uid = ${uid} and post_id = ${postId} and type = ${type}`
    return query(_sql)
}
//收藏/取消文章
let insertCollection = function(value){
    let _sql = "insert into collection(uid,post_id,type) values(?,?,?);"
    return query(_sql,value);
}
//删除收藏
let deleteCollection = function (value) { 
    let _sql = `delete from collection where uid = ? and post_id = ? and type = ?;`
    return query(_sql,value);
 }
 //新增点赞
 let insertSupport = function(value){
    let _sql = "insert into supports(uid,post_id,type) values(?,?,?);"
    return query(_sql,value);
}
//取消点赞
let deleteSupport = function (value) { 
    let _sql = `delete from supports where uid = ? and post_id = ? and type = ?;`
    return query(_sql, value);
 }
 //更新文章收藏数
 let updatePostCollection = (val,id) => {
     let _sql = `update posts set collection = collection ${val} 1 where id = ${id}`
     return query(_sql)
 }
 //更新文章点赞数
 let updatePostSupport = (val,id) => {
     let _sql = `update posts set support = support ${val} 1 where id=${id}`
     return query(_sql)
 }
 //更新问题收藏数
 let updateQuestionCollection  = (val,id) => {
     let _sql = `update question set collection = collection ${val} 1 where id = ${id}`
     return query(_sql)
 }
 //新增问题
 let insertAnswer = (value) => {
     let _sql = `insert into answer(uid,content,qid,moment,to_uid) values(?,?,?,?,?)`
     return query(_sql,value)
 }
 //更新问题点赞数
 let updateAnswerSupport = (val,id) => {
     let _sql = `update answer set support = support ${val} 1 where id=${id}`
     return query(_sql)
 }
 //查询回答
 let findAllAnswers = (qid) => {
     let _sql = `select * from answer where qid = ${qid}`
     return query(_sql)
 }
 //查询评论
 let findAllComments = (qid) => {
    let _sql = `select * from comments where qid = ${qid}`
    return query(_sql)
}
 //查询个人发表文章
 let findAllSelfPost = (uid) => {
     let _sql = `select * from posts where uid = ${uid}`
     return query(_sql)
 }
 //查询个人发表问题
 let findAllSelfQuestion = (uid) => {
     let _sql = `select * from question where uid = ${uid}`
     return query(_sql)
 }
 //查询收藏的文章
 let findCollectPostByUid = (uid,type) => {
    let _sql = `select p.* from (select * from collection where uid=${uid} and type = ${type}) c,posts p where c.post_id=p.id`
    return query(_sql)
}
//查询收藏的问题
 let findCollectQusByUid = (uid) => {
    let _sql = `select q.* from (select * from collection where uid=${uid}) c,question q where c.post_id=q.id`
    return query(_sql)
}
//删除文章
let deletePost = (id) => {
    let _sql = `delete from posts where id = ${id}`
    return query(_sql)
}
//删除问题
let deleteQuestion = (id) => {
    let _sql = `delete from question where id = ${id}`
    return query(_sql)
}
//更新回答数
let updateQusAnswer = (id) => {
    let _sql = `update question set answer = answer + 1 where id = ${id}`
    return query(_sql)
}
//更新评论数
let updatePostComment = (id) => {
    let _sql = `update posts set comments = comments + 1 where id = ${id}`
    return query(_sql)
}
//新增评论
let insertComment = (value) => {
    let _sql = `insert into comments(uid,content,qid,moment,to_uid) values(?,?,?,?,?)`
    return query(_sql,value)
}
let findQuestionByTag = (address,tag) => {
    let _sql = `select * from question where address like '%${address}%' and tag like '%${tag}%'`
    return query(_sql)
}
let findPostsByName = (address,name) => {
    let _sql = `select * from posts where address like '%${address}%' and title like '%${name}'`
    return query(_sql)
}
let findQuestionByName = (address,name) => {
    let _sql = `select * from question where address like '%${address}%' and title like '%${name}%'`
    return query(_sql)
}
//暴露所有函数接口
module.exports = {
   query,
   findCityId,
   findDataByName,
   insertUser,
   insertPost,
   insertImg,
   findAllPost,
   findPostWithTag,
   findImgByPostId,
   findPostById,
   findAuthorByUid,
   updatePostPv,
   insertQuestion,
   findQuestionWithTag,
   findAllQuestion,
   updateQuestionPv,
   findQuestionById,
   findCollectUid,
   findSupportUid,
   insertCollection,
   deleteCollection,
   insertSupport,
   deleteSupport,
   updatePostCollection,
   updatePostSupport,
   updateQuestionCollection,
   insertAnswer, 
   updateAnswerSupport,
   findAllComments,
   finDataById,
   findAllSelfPost,
   findAllSelfQuestion,
   findCollectPostByUid,
   findCollectQusByUid,
   deletePost,
   deleteQuestion,
   updateQusAnswer,
   updatePostComment,
   insertComment,
   findAllAnswers,
   findPostsByCity,
   findQuestionByCity,
   findPostByCityAndTag,
   findQuestionByTag,
   findPostsByName,
   findQuestionByName
}
