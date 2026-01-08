// pages/profile/profile.ts
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '未登录',
      credits: 10 // 剩余点数
    },
    menuList: [
      {
        icon: '📝',
        title: '生成记录',
        desc: '查看我的作品',
        url: '/pages/gallery/gallery'
      },
      {
        icon: '📖',
        title: 'Prompt 指南',
        desc: '学习提示词技巧',
        url: '/pages/guide/guide'
      },
      {
        icon: '️🗑️',
        title: '清除缓存',
        desc: '释放存储空间',
        action: 'clearCache'
      },
      {
        icon: 'ℹ️',
        title: '关于我们',
        desc: '版本信息',
        url: '/pages/about/about'
      }
    ],
    stats: {
      totalGenerated: 0,
      totalSaved: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        'userInfo.avatarUrl': userInfo.avatarUrl,
        'userInfo.nickName': userInfo.nickName
      })
    }
  },

  // 加载统计数据
  loadStats() {
    const history = wx.getStorageSync('imageHistory') || []
    this.setData({
      'stats.totalGenerated': history.length,
      'stats.totalSaved': history.length // 简化处理
    })
  },

  // 获取用户信息
  onGetUserInfo(e: any) {
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo
      this.setData({
        'userInfo.avatarUrl': userInfo.avatarUrl,
        'userInfo.nickName': userInfo.nickName
      })
      wx.setStorageSync('userInfo', userInfo)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  },

  // 点击菜单项
  onMenuTap(e: any) {
    const index = e.currentTarget.dataset.index
    const item = this.data.menuList[index]

    if (item.action) {
      // 执行特定操作
      switch (item.action) {
        case 'clearCache':
          this.clearCache()
          break
      }
    } else if (item.url) {
      // 跳转页面
      if (item.url.includes('gallery')) {
        wx.switchTab({ url: item.url })
      } else {
        wx.navigateTo({
          url: item.url,
          fail: () => {
            wx.showToast({
              title: '页面开发中',
              icon: 'none'
            })
          }
        })
      }
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const userInfo = wx.getStorageSync('userInfo')
            wx.clearStorageSync()
            if (userInfo) {
              wx.setStorageSync('userInfo', userInfo)
            }

            this.loadStats()

            wx.showToast({
              title: '清除成功',
              icon: 'success'
            })
          } catch (error) {
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 查看点数说明
  onCreditsTap() {
    wx.showModal({
      title: '灵感值说明',
      content: '每次生成消耗 1 点灵感值\n每日登录可获得 10 点',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
