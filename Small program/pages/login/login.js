// pages/login/login.js
const app = getApp().globalData;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		img:'/Images/weixin.png',
		CommentList:null
	},
	getUser(data) {
		console.log(data.detail.userInfo)
		let list = data.detail.userInfo;
		let userName=list.nickName;
		let userimg=list.avatarUrl;
		
		
		/*调用微信登录接口 获取用户凭证code*/
		wx.login({
			success: (res) => {
				console.log(res.code)
				let code = res.code;

				/*通过code 得到用户的openId号 */
				wx.request({
					url: `${app.api}/login`,
					method: 'post',
					data:{
						code:code,
						name:userName,
						img:userimg,
						appid:"wx0843911d1bbaee05",
						secret:"7112ef2d4a6e6c034a372ffffc59b409"
						},
					success: (res) => {
						console.log(res.data)
						wx.setStorage({
							key: 'token',
							data: res.data.token,
						})
						/*修改登录页面的图片和文字*/
						this.setData({img:userimg})
					}
				
				})
				/*把信息记录到app.js userinfo中*/
				app.userInfo = list;
				wx.showToast({
					title: '登录成功',
					icon:"success",
					success:()=>{
						setTimeout(()=>{
							wx.navigateBack()
						},2000)
					
					}
				})

			}
		})
	},
	loading(){
		wx.showLoading({
			title: '加载中',
			icon: "loding"
		})
	},
	
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})