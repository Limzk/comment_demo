const express = require('express')
const fs = require('fs')
const Sql = require('../public/js/Dao')

const router = express.Router()

// const user = req.session.login
//定义session存储保存状态以及渲染首页标题列表
router.get('/',function(req, res) {
    getPublishData(function (err, dataArr) {
        if (err) throw err
        else {
            res.render('index.html', {
                user: req.session.login,
                //拿到数组对象，渲染首页
                list: dataArr
            })
        }
    })
})

//发表路由
router.get('/publish',function(req, res){
    // fs.readFile('./publish.html',function(err,data){
    //     if(err) throw err
    //     res.send(data)
    // })
    res.render('publish.html')
})

//登录路由，跳转登录页面
router.get('/login',function(req,res){
    // fs.readFile('./login.html',function(err,data){
    //     if(err) throw err
    //     res.send(data)
    // })
    res.render('login.html')
})
//注册路由，跳转注册页面
router.get('/register',function(req,res){
    // fs.readFile('./register.html',function(err,data){
    //     if(err) throw err
    //     res.send(data)
    // })
    res.render('register.html')
})

//注册路由，处理注册表单信息
router.post('/register',function(req,res){
    const body = req.body
   //查询是否存在该用户
    Sql.que(body.username,function(err,data) {
        if (err) {
            return res.status(500).json({
                code_State: 500,
                msg: "服务器发生错误"
            })
        } else if (!(data.rowsAffected[0] === 0)) {
            // res.send("该用户名已存在！！")
            return res.status(200).json({
                code_State: 1,
                msg: "用户名已存在"
            })
        }
        //往数据库插入数据
        else {
            Sql.add(body.username, body.password, function (err) {
                if (err) {
                    //返回前端
                    return res.status(500).json({
                        code_State: 500,
                        msg: "服务器发生错误"
                    })
                } else {
                    return res.status(200).json({
                        code_State:0,
                        msg: "注册成功！！！"
                    })
                }
                // res.send("注册成功!!")
            })
        }
    })
    // console.log(req.body.username)
})

//登录路由，处理登录表单信息
router.post('/login',function(req,res){
    const body = req.body
    //查询是否存在该用户
    Sql.queAll(body.username,body.password,function(err,data) {
        // console.log(data)
        if (err) {
            return res.status(500).json({
                code_State: 500,
                msg: "服务器发生错误"
            })
        } else if (data.rowsAffected[0] === 1) {
            //使用session记录用户的登陆信息
             req.session.login = data
            return res.status(200).json({
                code_State: 1,
                msg: "登陆成功"
            })
        }

        else {
            return res.status(200).json({
                code_State: 0,
                msg: "用户名或密码错误"
            })
        }
        // res.send("注册成功!!")
    })

    // console.log(req.body.username)
})

//发表路由
router.post('/publish',function(req,res){
    const body = req.body
    //获得用户信息
    // { recordsets: [ [ [Object] ] ],
    //   recordset: [ { username: '123', password: '123' } ],
    //   output: {},
    //   rowsAffected: [ 1 ] }
    const user = req.session.login
    //获得用户名
    // console.log(user.recordset[0].username);
    //拿到用户输入的标题以及发表的内容，添加到数据库
    Sql.addPublish(body.topic,body.content,user.recordset[0].username,function(err){
        if(err) throw err
        else{
            //调用函数，拿到数据库存储的数组对象，渲染首页
            getPublishData(function(err,dataArr){
                if(err) throw err
                else{
                    res.render('index.html',{
                        user : user,
                        list : dataArr
                    })
                }
            })
        }
    })
})
//定义全局变量id，存储页面id
var id

//进入详情路由，即点击进入评论页面
router.get('/detail',function(req,res) {
    id = req.query.id
    Sql.quePublishById(req.query.id, function (err, pdata) {
        if (err) throw err
        else {
            Sql.queCommentById(id, function (err, cdata) {
                if (err) throw err
                else {
                    res.render('detail.html', {
                        user : req.session.login,
                        commentList : cdata.recordset,
                        msg : pdata.recordset
                    })
                }
            })
        }
    })
})

//评论路由，未用promise函数，嵌套回调
// router.post('/comment',function(req,res){
//     user = req.session.login
//     Sql.addComment(id,getTime(),user.recordset[0].username,req.body.text_comment,function(err){
//         if(err) throw err
//         else{
//             Sql.quePublishById(id, function (err, pdata) {
//                 if (err) throw err
//                 else {
//                     Sql.queCommentById(id, function (err, cdata) {
//                         if (err) throw err
//                         else {
//                             res.render('detail.html', {
//                                 user : req.session.login,
//                                 commentList : cdata.recordset,
//                                 msg : pdata.recordset
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })
// })

 function addComment(id,time,username,comment){
    //返回一个promise对象
    return new Promise(function(resolve, reject){
        Sql.addComment(id,time,username,comment,function(err){
            if(err) return reject(err)
            resolve()
        })
    })
}
function quePublishById(){
    return new Promise(function(resolve, reject){
        Sql.quePublishById(id, function (err, pdata) {
            if(err) return reject(err)
            resolve(pdata)
        })
    })
}
function queCommentById(){
    return new Promise(function(resolve, reject){
        Sql.queCommentById(id, function (err, cdata) {
            if(err) return reject(err)
            resolve(cdata)

        })
    })
}
//定义全局data对象，用来保存quePublishById中的pdata
var data = []
router.post('/comment',function(req,res) {
    user = req.session.login
    // 添加一条评论，传入参数：id，时间，用户名，用户提交的内容
    addComment(id,getTime(),user.recordset[0].username,req.body.text_comment)
        .then(function () {
            //调用
            return quePublishById()
        })
        .then(function (pdata) {
            //保存pdata
            data.publish = pdata
            //调用
            return queCommentById()
        })
        .then(function(cdata){
            res.render('detail.html', {
                user : user,
                commentList : cdata.recordset,
                msg : data.publish.recordset
            })
        })
        .catch(function(err){
            throw err
        })
})

//退出路由，重新渲染首页
router.get('/logout',function(req,res){
    //用户退出，销毁session保存的登陆状态
    req.session.login = null
    getPublishData(function(err,dataArr){
        if(err) throw err
        else{
            res.render('index.html',{
                list:dataArr
            })
        }
    })
})

// //定义查询发表的表函数
function getPublishData(callback){
    Sql.quePublish(function(err,data) {
        if (err) callback(err)
        else {
            //查询成功
            //定义一个新数组
            var dataArr = []
            //循环输出，其中data.rowsAffected[0]为该数据库存储的内容长度
            for (var i = 0; i < data.rowsAffected[0]; i++) {
                //data.recordset[i]为数据内容(标题和发表内容)对象
                var dataObj = data.recordset[i]
                //将对象存放在数组中，成为数组对象
                dataArr.unshift(dataObj)
            }
            //返回数组对象
            callback(null,dataArr)
            // callback(null,dataARr)
        }
    })
}
//定义获得当前时间的函数
function getTime(){
    var time = new Date()
    var year = time.getFullYear()
    var month = time.getMonth()+1
    var data = time.getDate()
    var hours = time.getHours()
    var minutes = time.getMinutes()
    var seconds = time.getSeconds()
    var timeArr = [ year+"-"+month+"-"+data+" "+hours+":"+minutes+":"+seconds]
    return timeArr.toString()
}

module.exports = router
