// pages/case/case.js
const app = getApp().globalData;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
			listData:null,
			selectNav:0,
			ListContent:null,
			loading:false
	},
	/*导航点击事件*/
	clickNav(e){
		console.log(e.currentTarget.dataset.navindex);
		console.log(e.currentTarget.dataset);
		const index = e.currentTarget.dataset.navindex;
		this.setData({ selectNav:index})
		// this.getList(res.data[0].id)

		/*点击时 把点击的导航Id得到 用来获取它的数据*/
		 this.getList(this.data.listData[index].Id)

	},
	getList(e){
		this.setData({loading:false})
		wx.request({
			url: `${app.api}/getList?Id=${e}`,
			success:(res)=>{
				this.setData({ListContent:res.data,loading:true})
				console.log(res.data)

			}
		})
	},
	getListNav(e){
		/*获取view标签的index*/
		let index=e.currentTarget.dataset.navindex;
		/*改变选中的导航index*/
		this.setData({ selectNav:index});
		


	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
			wx.request({
				url: `${app.api}/sNav?Path=0002`,
				success:(res)=>{
					//console.log(res.data)
					this.getList(res.data[0].Id)
					
					this.setData({ listData: res.data});
					
				}
			})


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