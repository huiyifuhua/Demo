var express = require('express');//【这个是node创建服务器的主要模块】
var path = require('path');//【处理node服务器中路径地址的模块】
var cookieParser = require('cookie-parser');//【解析cookie数据的模块】
var logger = require('morgan');//【日志模块】
var session = require('express-session');//【session模块】

var app = express();//【生成node服务器对象】
//下面就是对node服务器的配置

//【session模块配置】
app.use(session({
    //对session 存cookie数据进行加密 保证session数据的安全
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

app.use(logger('dev'));//【可以向命令提示符窗口中打印 服务器接收请求的日志信息】
app.use(express.json());//【解析客户端发送的 json数据】
app.use(express.urlencoded({ extended: false }));//【解析客户端发送的 post数据】
app.use(cookieParser());//【解析客户端 发送的cookie数据】



//【拦截操作,没有登录 不允许进入后台页面】
/*app.use("/admin/",function (req,res,next) {
    if(req.session.loginStatus){
        //如果登录了就 可以进入admin
        next();
    }else if(req.path=="/login.html"||req.path=="/reg.html"){
        /!*不管有没有登录 只要检测进入的地址为login.html 或 reg.html
        都可以让用户进入*!/
        next();
    }else{
        res.send("没有登录不允许进入后台！");
    }
})*/

//【配置放html页面的文件夹、放网页图片的文件】
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));




//【配置 ueditor】
var bodyParser = require('body-parser')
var ueditor = require("ueditor")
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'uploads'), function(req, res, next) {
    var imgDir = '/img/ueditor/' //默认上传地址为图片 /uploads/img/ueditor
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认上传地址为图片
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件保存地址  /uploads/file/ueditor/
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频保存地址  uploads/video/ueditor/
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //客户端发起图片列表请求
    else if (ActionType === 'listimage'){
        res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/ueditor.config.json')
}}));


//【配置自己写的路由文件】
app.use("/",require("./routes/index.js"));
app.use("/api",require("./routes/api.js"));


app.use(function(req, res, next) {
    //判断是主动导向404页面，还是传来的前端路由。
　　//如果是前端路由则如下处理
	var fs=require("fs");
    fs.readFile(__dirname + '/public/index.html', function(err, data){
        if(err){
            console.log(err);
            res.send('后台错误');
        } else {
            res.writeHead(200, {
                'Content-type': 'text/html',
                'Connection':'keep-alive'
            });
            res.end(data);//输出index.html文件
        }
    })
});


module.exports = app;
