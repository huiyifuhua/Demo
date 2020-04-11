// pages/case/content/content.js
const app = getApp().globalData;

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
			Content:null,
			date:null,
			CommentList:null,
			time:null
		
	},
	addContent(e){
		console.log(e)
		if(app.userInfo==null){
			//说明没有登录 
			console.log("没有登录,即将进入登录页面")
			   //获取用户权限
				 wx.navigateTo({
					 url: '/pages/login/login',
					 success:()=>{
						 console.log("跳转到了登录操作")
					 }
				 })

		}else{
			//console.log("开始评论")
			wx.request({
				url: `${app.api}/addComment`,
				method: "post",
				data: { token: wx.getStorageSync('token') ,
					content: e.detail.value.Content_content,
					contentId: e.detail.value.Comment_contentId
				},
				success:(res)=>{
					console.log(res.data.msg)
						if(res.data.err){
							wx.navigateTo({
								url: '/pages/login/login',
							})
							}else{
								wx.showToast({
									title: '评论成功',
									icon:'success',
									success:()=>{
											this.getComment(e.detail.value.Comment_contentId)
									}
								})
							
						}
				}
			})
		}
	},
	getComment(id){
		wx.request({
			url: `${app.api}/getComment?Id=${id}`,
			success:(res)=>{
				
				res.data.forEach((v,k)=>{
					v.time=new Date(v.time).toLocaleDateString();
				})
				console.log(res.data)
				//let date = new Date(res.data.time).toLocaleDateString();
				//sthis.setData({ time: date })
				this.setData({ CommentList:res.data.slice(0,5)})
			}
		})
	},
	

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(options)
		let id=options.Id;

		wx.request({
			url: `${app.api}/getContent?Id=${id}`,
			success:(res)=>{
				console.log(res.data);
				
				// this.setData({date:res.data.Date.slice(0,10)})
				res.data.Date=new Date(res.data.Date).toLocaleDateString();
				this.setData({ Content: res.data })
			}
		})
		this.getComment(id);
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