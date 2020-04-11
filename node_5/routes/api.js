var express=require("express");
var request = require('request');
var router=express.Router();

//【引入mysql配置文件】
var mysql=require("../mysqlConfig.js");
router.all('*', function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "X-Requested-With");  
    res.header("Access-Control-Allow-Methods","GET");  
    res.header("Content-Type", "application/json;charset=utf-8");  
    next();  
}); 

//1.二级导航路由接口
//获取服务接口：http://192.168.8.8:83/api/sNav?Path=0001
router.get("/sNav",function(req,res){
	mysql.query("select * from nav where Path like ? and Status='1' order by Sort asc",[req.query.Path+",____"],function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				if(v.Img){
					var imgOjb=JSON.parse(v.Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					if(imgOjb.length>0){
						v.Img=imgOjb[0].path
					}else{
						v.Img="http://"+req.headers.host+"/img.jpg"
					}
					
				}
				return v;
				
			})
	
			res.send(data)
		}else{
			res.send(null)
		}
	})
})

//2.通过Id号获取 导航数据
//http://192.168.8.8/api/getNavId?Id=xxx
//比如获取:网站建设导航数据 http://192.168.8.8:83/api/getNavId?Id=1

router.get("/getNavId",function(req,res){
	if(!req.query.Id){
		res.send([])
		return;
	}
	mysql.query("select * from nav where  Id in("+req.query.Id+") order by Sort asc",function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				if(v.Img){
					var imgOjb=JSON.parse(v.Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					if(imgOjb.length>0){
						v.Img=imgOjb[0].path
					}else{
						v.Img="http://"+req.headers.host+"/img.jpg"
					}
				}
				v.PageContent=v.PageContent.replace(/<img [^>]*src=['"]\/([^'"]+)[^>]*>/gi, function(match, capture){
					//console.log(match)  
					return match.replace(/src=['"]\/([^'"]+["'])/,"src='http://"+req.headers.host+"/"+capture+"'");
				})
				return v;
				
			})
	
			res.send(data)
		}else{
			res.send([])
		}
	})
	
})


//3.获取栏目下面的列表数据
//http://192.168.8.8/api/getList?Id=写栏目的Id

router.get("/getList",function(req,res){
	    let obj={};
		mysql.query("select * from nav where Id=?",[req.query.Id],function(e,r){
			if(r.length>0){
				var imgOjb=JSON.parse(r[0].Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					if(imgOjb.length>0){
						r[0].Img=imgOjb[0].path
					}else{
						r[0].Img="http://"+req.headers.host+"/img.jpg"
					}
				let Path=r[0].Path;
				//有数据
				obj.nav=r[0];
				//获取该导航下的列表数据
				mysql.query("select * from content where Navpath like '"+Path+"%'",function(e,r){
					r.forEach((v,k)=>{
						if(v.Img){
							var imgOjb=JSON.parse(v.Img);
							imgOjb.map((v,k)=>{
								v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
									return v;
							})
							if(imgOjb.length>0){
								v.Img=imgOjb[0].path
							}else{
								v.Img="http://"+req.headers.host+"/img.jpg"
							}
							
						}
				    })
					obj.list=r;
					res.send(obj)
				})
				
			}else{
				//没有数据
				res.send({nav:[],list:[]})
			}
		})
})


//4.通过Id号取某条数据
//http://192.168.8.8/api/getContent?Id=?
//通过Id号来得到这个内容的数据
router.get("/getContent",function(req,res){
	if(isNaN(parseInt(req.query.Id))){
		res.send("参数错误！")
	}else{
	var sql="select * from content where Id in("+req.query.Id+")";
	mysql.query(sql,function(e,r){
		if(r.length>0){
			var imgOjb=JSON.parse(r[0].Img);
			imgOjb=imgOjb.map((v,k)=>{
				v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
				return v;
			})
			if(imgOjb.length>0){
				r[0].Img=imgOjb[0].path
			}else{
				r[0].Img="http://"+req.headers.host+"/img.jpg"
			}
			res.send(r[0])
		}else{
			res.send(null)
		}
	})}
})
let jwt=require("jsonwebtoken");
//5.微信登录
//接口地址：http://192.168.8.8:83/api/login
router.post("/login",function(req,res){
	request('https://api.weixin.qq.com/sns/jscode2session?appid='+req.body.appid+'&secret='+req.body.secret+'&js_code='+req.body.code+'&grant_type=authorization_code', function (error, response, body) {
		let {openid,session_key}=JSON.parse(body);
		console.log(req.body.name)
		mysql.query("select * from user where openId=?",[openid],(err,r)=>{
			if(r.length==0){
				mysql.query(
				"insert into user set name=?,img=?,openId=?"
				,[req.body.name,req.body.img,openid]
				,(err,r)=>{
						let token=jwt.sign({
							data:openid
						}, 'secret', { expiresIn: 60 * 5 });
						res.send({token:token});
				})	
			}else{
				mysql.query(
				"update user set name=?,img=? where openId=?"
				,[req.body.name,req.body.img,openid]
				,(err,r)=>{
						//加密
						let token=jwt.sign({
							data:openid
						}, 'secret', { expiresIn: 60 * 5 });
						res.send({token:token});
					
				})	
			}
		})
		//res.send(body)
	})
})


//6.添加评论
//参数`UserId` 、`Content` 、`ContentPath`
router.post("/addComment",function(req,res){
	jwt.verify(req.body.token, 'secret', function(err, decoded) {
		if(err){
			res.send({err:true,msg:"状态已经过期,需要重新登录!",data:[]})
		}else{
			//没有过期添加评论到数据库
			var sql="insert into comment set Openid=?,c_Content=?,Contentid=?";
			var data=[decoded.data,req.body.content,req.body.contentId]
			mysql.query(sql,data,(e,r)=>{
				res.send({err:false,msg:"评论成功！",data:[]})
			})
		}
	});
})


//7.获取内容评论
//http://192.168.8.8:83/api/getComment?Id=内容的Id
router.get("/getComment",function(req,res){
	var sql="select c.*,u.name,u.img,u.openId from comment as c,user as u where (c.Contentid=? and c.Openid=u.openId)  order by time desc"
	var data=req.query.Id;
	mysql.query(sql,data,function(e,r){
		res.send(r);
	})
})



//8.网站基本信息接口
//接口地址为:http://192.168.8.8:83/api/websit
router.get("/website",function(req,res){
	mysql.query("select * from 基本信息",function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				v.Logo="http://"+req.headers.host+"/"+(v.Logo.replace("uploads\\",""));
				v.Img="http://"+req.headers.host+"/"+(v.Img.replace("uploads\\",""));
				return v;
			})
			res.send(data)
		}else{
			res.send(null)
		}
	})
	
})




//9.首页大型轮播图接口
//http://192.168.8.8:83/api/getBanner
router.get("/getBanner",function(req,res){
		mysql.query("select * from content where Type=4",function(e,r){
				var Url=[];
				r.forEach((v,k)=>{
					if(v.Img){
						var imgOjb=JSON.parse(v.Img);
						imgOjb.map((v,k)=>{
							v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
								return v;
						})
						if(imgOjb.length>0){
							v.Img=imgOjb[0].path;
						}else{
							v.Img="http://"+req.headers.host+"/img.jpg"
						}
						
					}
				})
				res.send(r);
		})
	
})
//10.首页搜索接口
//http://192.168.8.8:83/api/search?wd=写搜索的词
router.get("/search",function(req,res){
		mysql.query("select * from content where TItle like '%"+req.query.wd+"%'",function(e,r){
				var Url=[];
				r.forEach((v,k)=>{
					if(v.Img){
						var imgOjb=JSON.parse(v.Img);
						imgOjb.map((v,k)=>{
							v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
								return v;
						})
						if(imgOjb.length>0){
							v.Img=imgOjb[0].path;
						}else{
							v.Img="http://"+req.headers.host+"/img.jpg"
						}
						
					}
				})
				res.send(r);
		})
	
})




























//6.登录状态过期检查
/*router.post("/xxx",function(req,res,next){
	//解密验证
	console.log(req.body)
	jwt.verify(req.body.token, 'secret', function(err, decoded) {
		if(err){
			//说明已经过期需要重新登录
			res.send({expires:"登录状态已经过期，需要重新登录"});
		}else{
			//还在登录状态！
			next();
		}
	});
})*/










































































//1.网站基本信息结构
//接口地址为:http://192.168.8.8/api/websit
router.get("/website",function(req,res){
	mysql.query("select * from 基本信息",function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				v.Logo="http://"+req.headers.host+"/"+(v.Logo.replace("uploads\\",""));
				return v;
			})
			res.send(data)
		}else{
			res.send(null)
		}
	})
	
})
//2.顶级导航结构
//http://192.168.8.8:83/api/topNav
router.get("/topNav",function(req,res){
	mysql.query("select * from nav where Path like '____' and Status='1' order by Sort asc",function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				if(v.Img){
					var imgOjb=JSON.parse(v.Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					v.Img=imgOjb
				}
				return v;
				
			})
	
			res.send(data)
		}else{
			res.send(null)
		}
	})
	
})


//2.顶级导航结构
//http://192.168.8.8/api/getNav?Url=?
router.get("/getNav",function(req,res){
	mysql.query("select * from nav where Url=?",[req.query.Url],function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				if(v.Img){
					var imgOjb=JSON.parse(v.Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					v.Img=imgOjb
				}
				return v;
				
			})
	
			res.send(data)
		}else{
			res.send(null)
		}
	})
	
})

//2.二级导航路由接口
//http://192.168.8.8/api/sNav?Path=xxx
//Path用来接收父导航的Path地址
//http://192.168.8.8:83/api/sNav?Path=0001
router.get("/sNav",function(req,res){
	mysql.query("select * from nav where Path like ? and Status='1' order by Sort asc",[req.query.Path+",____"],function(e,r){
		if(r.length>0){
			var data=r.map((v,k)=>{
				if(v.Img){
					var imgOjb=JSON.parse(v.Img);
					imgOjb.map((v,k)=>{
						v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
						return v;
					})
					v.Img=imgOjb
				}
				return v;
				
			})
	
			res.send(data)
		}else{
			res.send(null)
		}
	})
	
})


//3.二级导航下的数据列表
//http://192.168.8.8/api/getConentList?Url=栏目的Url&Page=1;
//Url 是接收栏目的 Url，栏目只要传入Url就能查找当前 栏目的内容列表
//Page是指定列表 显示第几页，接收一个数字
router.get("/getConentList",function(req,res){
	var pagination = require('tiny-pagination');
	mysql.query("select * from nav where Url=?",[req.query.Url],function(e,r){
		if(r.length>0){
			var data1=r[0].Path;
			//1.得到数据的总条数
			mysql.query("select * from content where Navpath=?",[data1],function (e,r) {
				var count=r.length;//取总数据条数：r.length
				if(count>0){
							var sql="select * from content  where Navpath=?  limit ?,9";
							var PagesCount=Math.ceil(count/9);
							
							//判断传入的页数 是否大于总页数 ，如果大于总页数 我们就让当前页等于总页数
							var current=req.query.page>PagesCount?PagesCount:parseInt(req.query.page)||1
							var data=[data1,(current-1)*9];
							// 假设当前页码为 10，总页数为 30，中间显示页码数为 7
							var pageInfo = pagination(parseInt(current), parseInt(PagesCount), 7);
							pageInfo.info={
								  first:"第一页，值为 1",
								  last:"最后一页，值为 总页数",
								  prev:"当前页码的上一页页码",
								  next:"当前页码的下一页页码",
								  show:"是否显示页码，当总页数为1的时候，为false",
								  showPrev:"是否显示上一页",
								  showNext:"是否显示下一页",
								  showFirst:"是否显示第一页",
								  showLast:"是否显示最后一页",
								  pageList:"中间页码列表",
								  page:"当前页码",
							};
							mysql.query(sql,data,function (e,r) {
								if(r.length>0){
									var rdata=r.map((v,k)=>{
										if(v.Img){
											var imgOjb=JSON.parse(v.Img);
											imgOjb.map((v,k)=>{
												v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
												return v;
											})
											v.Img=imgOjb
										}
										return v;
										
									})
							
									res.send({pageInfo:pageInfo,content:rdata})
								}else{
									res.send({pageInfo:null,content:[]})
								}
							})
				}else{
					res.send({pageInfo:null,content:[]})
				}
			})
			
		}else{
			res.send({pageInfo:null,content:[]})
		}
	})
})



//关于我们、荣誉资质、联系我们 这个几个路由里面的二级导航接口
http://192.168.8.8/api/getNavId?Id=20,17,4,19,21








//获取某个栏目下 热门的内容
//http://192.168.8.8/api/getHotContent?parentPath=父栏目的path
/*我们要获取某个栏目下的热门内容 
只需要传入父栏目的path值就能到这个栏目的热门内容*/
router.get("/getHotContent",function(req,res){
		mysql.query("select a.*,b.Url from content as a,nav as b where a.Navpath=b.Path  and a.Type=2 and b.Path="+req.query.parentPath,function(e,r){
				var Url=[];
				r.forEach((v,k)=>{
					if(v.Img){
						var imgOjb=JSON.parse(v.Img);
						imgOjb.map((v,k)=>{
							v.path="http://"+req.headers.host+"/"+(v.path.replace("uploads\\",""));
								return v;
						})
						v.Img=imgOjb
					}
					mysql.query("select * from nav where  Path=?",[v.Navpath],function(e,r){
						v.Url=r[0].Url;
					})
				})
				console.log(r)
				res.send(r);
		})
	
})







module.exports=router;
