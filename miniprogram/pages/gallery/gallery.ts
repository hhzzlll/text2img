// pages/gallery/gallery.ts
interface HistoryItem {
  id: number
  image: string
  prompt: string
  style: string
  ratio: string
  createTime: string
}

Page({
  data: {
    historyList: [] as HistoryItem[],
    isEmpty: true,
    generatingCount: 0
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    // 每次显示时刷新列表
    this.loadHistory()
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('imageHistory') || []
    this.setData({
      historyList: history,
      isEmpty: history.length === 0
    })
  },

  // 查看详情（预览图片）
  onImageTap(e: any) {
    const index = e.currentTarget.dataset.index
    const item = this.data.historyList[index]
    const urls = this.data.historyList.map(i => i.image)

    wx.previewImage({
      current: item.image, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },

  // 长按操作
  onImageLongPress(e: any) {
    const index = e.currentTarget.dataset.index
    const item = this.data.historyList[index]

    wx.showActionSheet({
      itemList: ['保存到相册', '做同款', '删除'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.saveImage(item.image)
            break
          case 1:
            this.remixImage(item)
            break
          case 2:
            this.deleteImage(index)
            break
        }
      }
    })
  },

  // 保存图片
  saveImage(imageUrl: string) {
    wx.showLoading({ title: '保存中...' })

    wx.downloadFile({
      url: imageUrl,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            })
          },
          fail: () => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 做同款
  remixImage(item: HistoryItem) {
    // 将数据传递到首页
    wx.setStorageSync('remixData', {
      prompt: item.prompt,
      style: item.style,
      ratio: item.ratio
    })

    wx.switchTab({
      url: '/pages/index/index'
    })

    wx.showToast({
      title: '已填充参数',
      icon: 'success'
    })
  },

  // 删除图片
  deleteImage(index: number) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      success: (res) => {
        if (res.confirm) {
          const history = this.data.historyList
          history.splice(index, 1)
          wx.setStorageSync('imageHistory', history)
          this.loadHistory()

          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 清空所有记录
  onClearAll() {
    if (this.data.isEmpty) return

    wx.showModal({
      title: '确认清空',
      content: '将删除所有历史记录',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('imageHistory')
          this.loadHistory()

          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  }
})
