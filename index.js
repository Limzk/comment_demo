const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const router = require('./router/router')


const app = express()

//配置express-art-template
app.engine('html',require('express-art-template'))

//开放静态资源
app.use('/public',express.static('./public/'))
app.use('/node_modules',express.static('./node_modules/'))

//配置body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//配置express-session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))
//挂载路由
app.use(router)

app.listen(3000,function(){
    console.log("running........")
})