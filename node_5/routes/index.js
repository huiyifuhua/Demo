var express=require("express");
var router=express.Router();

//【引入mysql配置文件】
var mysql=require("../mysqlConfig.js");
//【接收用户注册的路由】
router.post("/UserReg",function (req,res) {
    //在注册之前 先要查看这个用户名是否已经注册了
    mysql.query("select * from user where name=?",[req.body.UserName],function (e,r) {
        if(r.length==0){//r是一个数组里面包含查询的到数据 ，如果没有查到数据length就为0
            //res.send("用户名不存在可以进行注册！")
            /*-----用户注册数据插入开始代码------*/
            var sql="insert into user(name,email,pwd) value(?,?,?)";
            var data=[req.body.UserName,req.body.UserEmail,req.body.UserPwd]
            mysql.query(sql,data,function (e,r) {
                res.send("<h1>注册成功！</h1><script>setTimeout(function() { location.href='/admin/login.html' },2000)</script>");
            })
            /*-----用户注册数据插入结束代码------*/
        }else{
            res.send("用户名已经存在!")
        };
    })
})

//【接收用户登录的路由】
router.post("/UserLogin",function (req,res) {
   /*
    需求：查询用户名 是张三 并且 密码是123456  的这样一条数据 需要用
    sql语句： select * from user where name='张三' and  pwd='123456'
    说明：and表示并且的意思
   */
   var sql="select * from user where name=?  and  pwd=?";
   var data=[req.body.Xname,req.body.Xpwd];
   mysql.query(sql,data,function (e,r) {
       if(r.length==0){
           res.send("用户名或密码错误!")
       }else{
           //登录成功以后 就通过sesssion把登录成功的状态记录下来
           //给session设置数据：req.session.数据名=数据值;
           req.session.loginStatus=true;
           res.send("登录成功");
       }
   })
})
//写一个清除登录 状态的路由 相当于退出登录
router.get("/clearLogin",function (req,res) {
    //销毁session数据
    req.session.destroy(function () {
        res.send("退出成功！")
    })
})


//配置文件上传模块
var multer  = require('multer')//引用文件夹上传模块
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //配置文件上传 保存的文件夹名称
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        //配置文件上传 最后保存的文件夹名称是什么
        cb(null, Date.now()+file.originalname)
    }
});
var upload = multer({ storage: storage });
//upload.single('logo') 用来接收 <input type="file" name="logo">标签里面的文件
var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'img2', maxCount: 1 }])
router.post("/setInfo",cpUpload,function (req,res) {

 //更新sql语句
	var sql="update 基本信息 set 标题=?,关键字=?,描述=?,备案号=?,客服电话号码1=?,客服电话号码2=?,公司地址=?,公司名称=?,微信号码=?,QQ号码=?,公司介绍=?";
	 //对应的数据
    var data=[
            req.body.title, req.body.keywords, req.body.description, req.body.icp,
			req.body.d1,req.body.d2,req.body.d3,req.body.d4,req.body.d5,req.body.d6,
			req.body.d7
			]
	if(req.files['logo']){
		sql=sql+",Logo=?"
		data.push(req.files["logo"][0].path)
	}
	if(req.files['img2']){
		sql=sql+",Img=?"
		data.push(req.files["img2"][0].path)
	}   
    //执行sql语句
    mysql.query(sql,data,function (e,r) {
        res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>修改成功！<span>3</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=3;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/info.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
                </script>`)
    })
});

router.get("/getInfo",function (req,res) {
    mysql.query("select * from 基本信息",function (e,r) {
        res.send(r[0]);//r是一个数组，[0] 表示从数组中取第一条数据
    })
})

//upload.array('Img') 表示可以接多个图片上传
router.post("/setNav",upload.array('Img'),function (req,res) {
    //console.log(req.files);//是一个数组,files里面包含多个文件信息
    //首先 检查接收Path数据是不是顶级栏目
    if(req.body.Path=="top"){
        /*如果为top就说明选的是 顶级栏目,这个时候先要找
        表中有没有顶级栏目,如果没有顶级栏目 那么你添加的这个
        顶级栏目的path就为0001，如果有顶级栏目，就在之前最大的那个
        顶级栏目的path值上进行累加
        */
        var sql="select * from nav where Path like '____' order by Path desc"
        mysql.query(sql,function (e,r) {
            if(r.length==0){//如果没有查到顶级栏目  就把当前添加的栏目Path设为0001
                var sql="insert into nav(Nav,Path,Title,Keywords,Description,Img,Sort,Url,Status,PageContent) value(?,?,?,?,?,?,?,?,?,?)";
                var data=[
                    req.body.Nav,
                    "0001",
                    req.body.Title,
                    req.body.Keywords,
                    req.body.Description,
                    JSON.stringify(req.files),
                    req.body.Sort,
					req.body.Url,
					req.body.Status,
					req.body.PageContent
                ];
                mysql.query(sql,data,function () {})
            }else{
                var path=parseInt(r[0].Path)+1;//把数据表里面 最后一个顶级栏目path进行累加

                //"00000001".substr(-4),表示取字符串的最后四位就是0001
                //"00000012".substr(-4),表示取字符串的最后四位就是0012
                path=("0000000"+path).substr(-4);//对数字进行补0 保持有4位数字
                var sql="insert into nav(Nav,Path,Title,Keywords,Description,Img,Sort,Url,Status,PageContent) value(?,?,?,?,?,?,?,?,?,?)";
                var data=[
                    req.body.Nav,
                    path,
                    req.body.Title,
                    req.body.Keywords,
                    req.body.Description,
                    JSON.stringify(req.files),
                    req.body.Sort,
					req.body.Url,
					req.body.Status,
					req.body.PageContent
                ];
                mysql.query(sql,data,function () {})
            }
        })

    }else{
        //这个里面写 创建的不是顶级栏目
        //先找某个栏目下是否含有子导航，如果没有子导航就从0001开始
        var sql="select * from nav where Path like ? order by Path desc";
        var data=[req.body.Path+",____"];
        mysql.query(sql,data,function (e,r) {
            if(r.length==0){
                var sql="insert into nav(Nav,Path,Title,Keywords,Description,Img,Sort,Url,Status,PageContent) value(?,?,?,?,?,?,?,?,?,?)";
                var data=[
                    req.body.Nav,
                    req.body.Path+",0001",
                    req.body.Title,
                    req.body.Keywords,
                    req.body.Description,
                    JSON.stringify(req.files),
                    req.body.Sort,
					req.body.Url,
					req.body.Status,
					req.body.PageContent
                ];
                mysql.query(sql,data,function () {})
            }else{
                var path=parseInt(r[0].Path.substr(-4))+1;//把数据表里面 最后一个顶级栏目path进行累加
                path=("0000000"+path).substr(-4);//对数字进行补0 保持有4位数字
                var sql="insert into nav(Nav,Path,Title,Keywords,Description,Img,Sort,Url,Status,PageContent) value(?,?,?,?,?,?,?,?,?,?)";
                var data=[
                    req.body.Nav,
                    req.body.Path+","+path,
                    req.body.Title,
                    req.body.Keywords,
                    req.body.Description,
                    JSON.stringify(req.files),
                    req.body.Sort,
					req.body.Url,
					req.body.Status,
					req.body.PageContent
                ];
                mysql.query(sql,data,function () {})
            }
        })
        //console.log(req.body.Path)//0003
        //res.send("你创建的不是顶级栏目")
    }
    res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>添加成功！<span>3</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=3;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/addNav.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
          </script>`)
})


//查询栏目
router.get("/getNav",function (req,res) {
    mysql.query("select * from nav order by Path asc",function (e,r) {
        res.send(r);
    })
})

//删除栏目
router.get("/delNav",function (req,res) {
    /*删除的sql语句
    * 语法1：delete from 表名     这个是删除表中所有的数据
    * 比如： delete from  nav       表示删除nav表中所有的数据
    *
    * 语法2：delete from 表名  where  栏目A=1；
    * 这个表示删除 栏目A等于1的这种数据
    * 比如：delete from  nav where Id=1;  表示删除Id为1的这条数据
    * 比如：delete from nav where Path="0002"  表示删除Path为0002
    *      这样的数据
    */
    var sql="delete from nav where Path like ?";
    var data=[req.query.Path+"%"];
    mysql.query(sql,data,function (e,r) {
        //栏目删除以后 还需要把栏目下面挂内容都删除掉
        var sql="delete from content where Navpath like ?"
        mysql.query(sql,data,function () {})

        res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>删除成功！<span>3</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=3;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/navlist.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
          </script>`)
    })
})

//查询要修改的数据
router.get("/getNavLine",function (req,res) {
    var sql="select * from nav where Path=?";
    var data=[req.query.Path];
    mysql.query(sql,data,function (e,r) {
        res.send(r);
    })
})

//提交更新的路由
router.post("/update_Nav",upload.array("Img"),function (req,res) {
    var sql,data;
    if(req.files.length==0){
        //length为了就说明有上传图片，说明不更新图片，那么sql语句上就不写Img栏目
        sql="update nav set Nav=?,Title=?,Keywords=?,Description=?,Sort=?,Status=?,Url=?,PageContent=? where Id=?";
        data=[req.body.Nav,req.body.Title,req.body.Keywords,req.body.Description,req.body.Sort,
        req.body.Status,req.body.Url,req.body.PageContent,req.body.Id
        ]
    }else{
        //如果lenght不为0，说明用户上传了图片，那么sql语句上就要写Img栏目
        sql="update nav set Nav=?,Title=?,Keywords=?,Description=?,Sort=?,Status=?,Url=?,PageContent=?,Img=? where Id=?";
        data=[req.body.Nav,req.body.Title,req.body.Keywords,req.body.Description,req.body.Sort,
            req.body.Status,req.body.Url,req.body.PageContent,JSON.stringify(req.files),req.body.Id
        ]
        //如果上传了图片 还要把之前的传过的图片进行删除
        var oldImg=JSON.parse(req.body.old_Img);
        for(var i=0;i<oldImg.length;i++){
            //node中删除文件的模块fs
            var fs=require("fs");
            //process.cwd() 用获取当前这个文件的上级目录 就是E:/node_2
            //fs.unlink是用来删除文件的 fs.unlink(写要删除文件的地址,一个回调函数)
            fs.unlink(process.cwd()+"\\"+oldImg[i].path,function(){ })
        };
    }
    mysql.query(sql,data,function () {
        res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>修改成功！<span>3</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=3;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/navlist.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
          </script>`)
    })
});


//内容添加路由
router.post("/add_content",upload.array("Img"),function (req,res) {
    console.log(req.files);//接收文件的数据信息
    console.log(req.body);//接收其他非文件的数据
    //1.插入的sql语句
    var sql=`insert into 
    content(Title,Keywords,Description,Author,Img,Content,Navpath,Type)
    value(?,?,?,?,?,?,?,?)
    `;
    //2.接收数据
    var data=[
        req.body.Title,
        req.body.Keywords,
        req.body.Description,
        req.body.Author,
        JSON.stringify(req.files),
        req.body.Content,
        req.body.Path,
        req.body.Type
    ]
    mysql.query(sql,data,function () {
        res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>添加成功！<span>2</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=2;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/addContent.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
          </script>`)
    })
})

router.get("/getContentAll",function (req,res) {
    //1.得到数据的总条数
    mysql.query("select * from content",function (e,r) {
        var count=r.length;//取总数据条数：r.length
        var sql="select * from content limit ?,10";
        /*有9条数据，每页显示2条数据，一共有多少页
          求总页数公式：Math.ceil(数据总条数/每页显示的条数)
          比如：Math.ceil(9/2)=5，意思就是只有5页，前端页面中只能
          有5个button按钮，我们得把这个5传给前端 ，让前端生成5个分页按钮
          * */
        //得到总页数
        var PagesCount=Math.ceil(count/10);
        //判断传入的页数 是否大于总页数 ，如果大于总页数 我们就让当前页等于总页数
        var current=req.query.current>PagesCount?PagesCount:req.query.current
        var data=[(current-1)*10];
        mysql.query(sql,data,function (e,r) {
            //把总页数 数据 与 数据库中查的数据都都丢个前端
            res.send({page_count:PagesCount,content:r});
        })
    })
})


router.get("/delContent",function (req,res) {
    var sql="delete from content where Id=?";
    var data=[req.query.Id];
    mysql.query(sql,data,function (e,r) {
        res.end();
    })
})

router.get("/selectContent",function (req,res) {
    var sql="select * from content where Id=?";
    var data=[req.query.Id];
    mysql.query(sql,data,function (e,r) {
        res.send(r[0]);//获取r数组中 里面的第一条数据 发送给前端
    })
})


//内容更新路由
router.post("/update_content",upload.array("Img"),function (req,res) {
    if(req.files.length==0){//说明没有上传图片 可以不用更新Img栏目
        var sql=`update content set 
    Title=?,Keywords=?,Description=?,Author=?,Content=?,Navpath=?,Type=? 
    where Id=? `;
        var data=[
            req.body.Title, req.body.Keywords,
            req.body.Description, req.body.Author, req.body.Content,
            req.body.Path, req.body.Type, req.body.Id
        ]
    }else{//说明上传了图片 需要更新Img栏目
        var sql=`update content set 
    Title=?,Keywords=?,Description=?,Author=?,Img=?,Content=?,Navpath=?,Type=? 
    where Id=? `;
        var data=[
            req.body.Title, req.body.Keywords,
            req.body.Description, req.body.Author, JSON.stringify(req.files),
            req.body.Content, req.body.Path, req.body.Type, req.body.Id
        ];
        //如果上传了图片 还要把之前的传过的图片进行删除
        var oldImg=JSON.parse(req.body.old_Img);
        for(var i=0;i<oldImg.length;i++){
            //node中删除文件的模块fs
            var fs=require("fs");
            //process.cwd() 用获取当前这个文件的上级目录 就是E:/node_2
            //fs.unlink是用来删除文件的 fs.unlink(写要删除文件的地址,一个回调函数)
            fs.unlink(process.cwd()+"\\"+oldImg[i].path,function(){ })
        };
    }
    mysql.query(sql,data,function () {
        res.send(`
                 <style>
                    body{ text-align: center;}
                    .msg{ padding:20px 200px; display: inline-block;
                        margin-top: 100px; border:3px solid green;
                        background: lightgreen;
                    }
                 </style>
                 <div class="msg">
                     <img src="/admin/img/face01.png" width="80">
                     <h3>更新成功！<span>2</span>秒后自动跳转</h3>
                 </div>
                 <script>
                     var i=2;
                     setInterval(function() { 
                         i--; 
                         if(i<0){
                             location.href="/admin/conentlist.html";
                         }else{
                             document.querySelector("span").innerText=i;
                         }
                      },1000)
          </script>`)
    })
})

module.exports=router;
