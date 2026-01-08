// pages/about/about.ts
Page({
  data: {
    version: '1.0.0',
    features: [
      '🎨 智能文生图',
      '🖼️ 历史作品画廊',
      '📱 响应式布局',
      '⚡ 极速生成体验'
    ]
  },

  onCopyGithub() {
    wx.setClipboardData({
      data: 'https://github.com/your-repo',
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  }
})
