// pages/index/index.ts
import { API_CONFIG } from '../../config/api'

interface Style {
  id: string
  name: string
  icon: string
}

interface AspectRatio {
  label: string
  value: string
}

Page({
  data: {
    // 提示词输入
    prompt: '',
    // 风格选项
    styles: [
      { id: 'general', name: '通用', icon: '🎨' },
      { id: 'anime', name: '二次元', icon: '🌸' },
      { id: 'realistic', name: '写实', icon: '📷' },
      { id: 'oil', name: '油画', icon: '🖼️' },
      { id: 'cyberpunk', name: '赛博朋克', icon: '🌃' },
      { id: 'ink', name: '水墨', icon: '🖌️' },
    ] as Style[],
    selectedStyle: 'general',
    // 比例选项
    aspectRatios: [
      { label: '1:1', value: '1:1' },
      { label: '3:4', value: '3:4' },
      { label: '16:9', value: '16:9' },
    ] as AspectRatio[],
    selectedRatio: '1:1',
    // 提示词标签
    promptTags: [
      '赛博朋克', '8K分辨率', '宫崎骏风格',
      '广角镜头', '柔和光线', '细节丰富',
      '高清画质', '电影感', '梦幻氛围'
    ],
    // 生成状态
    isGenerating: false,
    generatedImage: '',
    generatedPrompt: '',
    showResult: false,
  },

  onLoad() {
    console.log('首页加载完成')
  },

  onShow() {
    this.checkRemixData()
  },

  checkRemixData() {
    // 检查是否有做同款的数据
    const remixData = wx.getStorageSync('remixData')
    if (remixData) {
      this.setData({
        prompt: remixData.prompt,
        selectedStyle: remixData.style,
        selectedRatio: remixData.ratio,
        showResult: false, // 重置结果展示
        generatedImage: '' // 重置生成的图片
      })
      wx.removeStorageSync('remixData')

      wx.showToast({
        title: '已填充相同提示词',
        icon: 'success',
        duration: 1500
      })
    }
  },

  // 输入提示词
  onPromptInput(e: any) {
    this.setData({
      prompt: e.detail.value
    })
  },

  // 选择风格
  onStyleSelect(e: any) {
    const styleId = e.currentTarget.dataset.id
    this.setData({
      selectedStyle: styleId
    })
  },

  // 选择比例
  onRatioSelect(e: any) {
    const ratio = e.currentTarget.dataset.ratio
    this.setData({
      selectedRatio: ratio
    })
  },

  // 点击标签
  onTagClick(e: any) {
    const tag = e.currentTarget.dataset.tag
    const currentPrompt = this.data.prompt
    this.setData({
      prompt: currentPrompt ? `${currentPrompt}, ${tag}` : tag
    })
  },

  // 随机灵感
  onRandomPrompt() {
    const randomPrompts = [
      '一只穿着宇航服的猫在月球上漫步，赛博朋克风格，霓虹灯光',
      '日落时分的富士山，樱花飘落，宫崎骏动画风格',
      '未来城市的空中花园，悬浮建筑，科幻感十足',
      '中国古代书房，水墨画风格，窗外竹影婆娑',
      '蒸汽朋克风格的机械巨龙，精密齿轮，黄铜质感',
      '梦幻森林中的发光蘑菇，精灵飞舞，奇幻氛围'
    ]
    const randomIndex = Math.floor(Math.random() * randomPrompts.length)
    this.setData({
      prompt: randomPrompts[randomIndex]
    })
  },

  // 清空输入
  onClearPrompt() {
    this.setData({
      prompt: ''
    })
  },

  // 生成图片
  async onGenerate() {
    if (!this.data.prompt.trim()) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      })
      return
    }

    const currentPrompt = this.data.prompt

    this.setData({
      isGenerating: true,
      showResult: false
    })

    wx.showLoading({
      title: '正在绘制中...',
      mask: true
    })

    try {
      // 调用豆包 API
      const imageUrl = await this.callDoubaoApi()

      this.setData({
        generatedImage: imageUrl,
        generatedPrompt: currentPrompt,
        showResult: true
      })

      // 保存到本地存储
      this.saveToHistory()

      wx.hideLoading()
      wx.showToast({
        title: '生成成功',
        icon: 'success'
      })
    } catch (error: any) {
      wx.hideLoading()
      console.error('生成失败详情:', error)
      wx.showModal({
        title: '生成失败',
        content: error.message || '网络请求失败，请检查 API Key 或网络设置',
        showCancel: false
      })
    } finally {
      this.setData({
        isGenerating: false
      })
    }
  },

  // 调用豆包 API
  callDoubaoApi(): Promise<string> {
    return new Promise((resolve, reject) => {
      // 1. 构建更丰富的提示词
      const selectedStyleObj = this.data.styles.find(s => s.id === this.data.selectedStyle)
      const styleName = selectedStyleObj ? selectedStyleObj.name : ''
      const ratioStr = this.data.selectedRatio
      // 组合提示词：原词 + 风格 + 比例描述
      const fullPrompt = `${this.data.prompt}, ${styleName} style, ${ratioStr} aspect ratio, high quality, 8k`

      // 根据比例选择尺寸
      let size = "1024x1024"
      switch (this.data.selectedRatio) {
        case '3:4':
          size = "896x1152" // 调整分辨率以满足最小像素限制 (>921600)
          break
        case '16:9':
          size = "1280x720" // 调整分辨率以满足最小像素限制 (>921600)
          break
        case '1:1':
        default:
          size = "1024x1024"
          break
      }

      console.log('正在请求 API:', `${API_CONFIG.DOUBAO_TEXT2IMG_URL}/images/generations`)
      console.log('完整提示词:', fullPrompt)
      console.log('请求尺寸:', size)

      wx.request({
        url: `${API_CONFIG.DOUBAO_TEXT2IMG_URL}/images/generations`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.DOUBAO_API_KEY}`
        },
        data: {
          // ⚠️ 重要：这里需要填入你在火山引擎 Ark 平台创建的【推理接入点 ID】(例如 ep-20240604...)
          // 如果没有接入点，请先去控制台创建：https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint
          model: "doubao-seedream-4-0-250828",
          prompt: fullPrompt,
          size: size,
          n: 1
        },
        timeout: API_CONFIG.TIMEOUT,
        success: (res: any) => {
          console.log('API 响应:', res)

          if (res.statusCode === 200 && res.data) {
            // 尝试解析不同的返回格式
            const data = res.data

            // 情况1: 标准 OpenAI 格式
            if (data.data && data.data.length > 0 && data.data[0].url) {
              resolve(data.data[0].url)
              return
            }

            // 情况2: 返回 Base64
            if (data.data && data.data.length > 0 && data.data[0].b64_json) {
              // 处理 Base64 图片显示
              const base64Data = data.data[0].b64_json
              const base64Url = `data:image/png;base64,${base64Data}`
              resolve(base64Url)
              return
            }

            // 情况3: 火山引擎原生格式 (可能在 output 字段)
            if (data.output && data.output.image_url) {
              resolve(data.output.image_url)
              return
            }

            reject(new Error('无法解析返回的图片数据'))
          } else {
            reject(new Error(`请求失败: ${res.statusCode} - ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 模拟生成（临时）
  mockGenerate(): Promise<void> {
    const currentPrompt = this.data.prompt
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setData({
          generatedImage: 'https://via.placeholder.com/512x512?text=Generated+Image',
          generatedPrompt: currentPrompt,
          showResult: true
        })

        // 保存到本地存储
        this.saveToHistory()
        resolve()
      }, 2000)
    })
  },

  // 保存到历史记录
  saveToHistory() {
    const history = wx.getStorageSync('imageHistory') || []
    const newItem = {
      id: Date.now(),
      image: this.data.generatedImage,
      prompt: this.data.prompt,
      style: this.data.selectedStyle,
      ratio: this.data.selectedRatio,
      createTime: new Date().toISOString()
    }
    history.unshift(newItem)
    wx.setStorageSync('imageHistory', history)
  },

  // 保存到相册
  onSaveImage() {
    if (!this.data.generatedImage) return

    wx.showLoading({ title: '保存中...' })

    wx.downloadFile({
      url: this.data.generatedImage,
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

  // 再来一张
  onRegenerate() {
    if (this.data.generatedPrompt) {
      this.setData({
        prompt: this.data.generatedPrompt
      })
    }
    this.onGenerate()
  },

  // 复制提示词
  onCopyPrompt() {
    wx.setClipboardData({
      data: this.data.generatedPrompt || this.data.prompt,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  }
})