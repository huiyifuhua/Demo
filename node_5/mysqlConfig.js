//1.引入mysql模块
var mysql=require("mysql");
//2.让mysql模块 连接你电脑上安装的mysql软件
var con = mysql.createConnection({
    host     : 'localhost',//数据库地址
    user     : 'root',//数据库用户名
    password : '12345678',//数据库密码
    database : 'admin3',/*连接的数据库为admin，
    这个admin数据库等一会需要自己创建*/
	charset:'UTF8MB4_GENERAL_CI'
});
//3.链接数据库
con.connect();
//4.导出连接的数据库
module.exports=con;





