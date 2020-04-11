// pages/contact/contact.js
const app = getApp().globalData;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		list:null,

	},
	call(){
		wx.makePhoneCall({
			phoneNumber: this.data.list['客服电话号码1'],
		})
	},
	call1() {
		wx.makePhoneCall({
			phoneNumber: this.data.list['客服电话号码2'],
		})
	},
	address(){
		console.log(22)
		wx.openLocation({
			latitude: 31.239580,
			longitude: 121.499763,
			name:'东方明珠',
			scale:20
		})
	},
	save(){
		wx.addPhoneContact({
			firstName: '',
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
			wx.request({
				url: `${app.api}/website`,
				success:(res)=>{
					console.log(res.data[0])
					this.setData({ list: res.data[0]})
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
			return{
				title:"demo",
				
			}
	}
})