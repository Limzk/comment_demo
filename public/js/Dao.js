const sql = require('mssql')
//连接数据库
const connect = sql.connect("mssql://sa:12345@localhost:1433/comment_login")

//封装数据库
function operateDao(Sql,callback){
    connect.then(function () {
        new sql.Request().query(Sql,function(err,res){
            if(err) callback(err)
            callback(null,res)
        })
    }).catch(function (err) {
        callback(err)
    })
}

//注册用户名，查询该用户名是否已被注册
exports.que = function(name,callback) {
    //查询语句
    const queSql = "select * from loginTable where username = '"+name+"'"
    operateDao(queSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//登陆，查询所有用户，是否有匹配
exports.queAll = function(name,psw,callback) {
    const queSql = "select * from loginTable where username = '"+name+"' and password = '"+psw+"'"
    operateDao(queSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}


//注册，添加用户
exports.add = function(name,password,callback) {
    //添加语句
    const addSql = "insert into loginTable (username,password) values ('" + name + "','" + password + "')"
    operateDao(addSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//添加发表的标题和内容
exports.addPublish = function(topic,content,name,callback) {
    //添加语句
    const addSql = "insert into contentTable (topic,content,name) values ('" + topic + "','" + content + "','"+name+"')"
    operateDao(addSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//查询发表的表，渲染首页
exports.quePublish = function(callback){
    const queSql = "select * from contentTable"
    operateDao(queSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//根据id，查到发表的内容
exports.quePublishById = function(id,callback){
    const queSql = "select * from contentTable where id = '"+id+"'"
    operateDao(queSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//添加评论数据
exports.addComment= function(id,date,username,comment,callback) {
    //添加语句
    const addSql = "insert into commentTable (id,date,username,comment) values ('" + id + "','" + date + "','"+username+"','"+comment+"')"
    operateDao(addSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}

//根据id查询到该发言下的评论
exports.queCommentById = function(id,callback){
    const queSql = "select * from commentTable where id = '"+id+"'"
    operateDao(queSql,function(err,res){
        if(err) callback(err)
        callback(null,res)
    })
}
connect.end