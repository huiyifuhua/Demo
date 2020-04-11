let app = getApp().globalData;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		banner:null,
		server:null,
		caseList:null,
		newsList:null
	},
	searchBtn(e){
		//console.log(e.detail.value)
		wx.request({
			url: `${app.api}/search?wd=${e.detail.value}`,
			success:(res)=>{
				console.log("搜索的数据",res.data)
				wx.navigateTo({
					url: '/pages/search/search?Id='+e.detail.value,
				})
			}
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.request({
			url: `${app.api}/getBanner`,
			success: (res) => {
				//console.log(res.data)
				this.setData({ banner: res.data.slice(0,3)})
			}
		}),
			wx.request({
				// url: 'http://192.168.8.8:83/api/topNav',
				url: `${app.api}/sNav?Path=0001`,
				success: (res) => {
					//console.log(res.data)
					this.setData({ server: res.data })
				}
			}),
			wx.request({
				url: `${app.api}/getList?Id=6`,
				success:(res)=>{
					//console.log(res.data.list.slice(0, 4))
					this.setData({caseList:res.data.list.slice(0,4)})
				}
			}),
			wx.request({
				url: `${app.api}/getList?Id=13`,
				success: (res) => {
					//console.log(res.data.list)
					res.data.list.forEach((v, k) => {
						v.Date = new Date(v.Date).toLocaleDateString();
					})
					console.log(res.data.list.slice(0, 4))
					 this.setData({ newsList: res.data.list.slice(0, 4) })
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
		setTimeout(() => {
			wx.stopPullDownRefresh()
		},500)
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