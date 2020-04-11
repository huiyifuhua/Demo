// pages/record/record.js
const app=getApp().globalData;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		img:[]
	},
	add(e){
		console.log(e.detail.value)
		//提交数据到后端
		wx.uploadFile({
			url: `${app.api}/addAppointment`,
			filePath: this.data.img[0],
			//后端接收的字段为Img
			name: 'Img',
			formData:{
				'token':wx.getStorageSync('token'),
				'company_name': e.detail.value.company,
				'contacts_name': e.detail.value.people,
				'phone': e.detail.value.phone,
				'email':e.detail.value.email,
				'txt': e.detail.value.txt,
				'dizhi': e.detail.value.address
			},
			success:(res)=>{
					console.log(res.data)
			}
		})

	},
	openImg(){
		//打开相册接口
		wx.chooseImage({
			success:(res)=> {
				console.log(res.tempFilePaths)
				this.setData({ img: res.tempFilePaths})
			},
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