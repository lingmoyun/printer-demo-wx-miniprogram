// pages/ble/ble.js
const Bluetooth = require("../../util/bluetooth.js");
const CPCL = require("../../util/CPCL.min.js");
const HEX = CPCL.Tools.HEX;
const uni = wx;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    device: undefined,
    deviceList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const deviceList = [];
    this.setData({
      deviceList: deviceList
    });
    // 搜索蓝牙设备
    Bluetooth.find((res) => {
      for (const item of res.devices) {
        if (!item.name) continue;
        let bol = true;
        for (const device of deviceList) {
          if (item.deviceId === device.deviceId) {
            bol = false;
            break;
          }
        }
        bol && deviceList.push(item);
      }
      this.setData({
        deviceList: deviceList
      });
    });
  },
  // 已废弃，请使用新版API，imgPath -> CanvasImageData
  async imgPath2CanvasImageData(imgPath) {
    // 获取图片信息
    let imgInfo = await new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: imgPath,
        success: resolve
      });
    })
    // 获取在画布上绘图的环境
    const ctx = uni.createCanvasContext('myCanvas');
    // 填充白色底色，否则透明png图片打印出来会全黑
    ctx.setFillStyle('white')
    ctx.fillRect(0, 0, imgInfo.width, imgInfo.height)
    // 将图片绘制到画布上
    ctx.drawImage(imgPath, 0, 0, imgInfo.width, imgInfo.height)
    await new Promise((resolve, reject) => ctx.draw(false, resolve))
    // 获取画布上的图像像素矩阵
    return new Promise((resolve, reject) => {
      uni.canvasGetImageData({
        canvasId: 'myCanvas',
        x: 0,
        y: 0,
        width: imgInfo.width,
        height: imgInfo.height,
        success: resolve
      })
    })
  },
  // 已废弃，请使用新版API，生成图片并获取Canvas的ImageData
  async generateCanvasImageDataOld() {
    // 定义画布宽高
    const width = 400
    const height = 200
    // 获取在画布上绘图的环境
    const ctx = uni.createCanvasContext('myCanvas');
    // 填充白色底色，否则透明png图片打印出来会全黑
    ctx.setFillStyle('white')
    ctx.fillRect(0, 0, width, height)
    // 在画布上绘制被填充的文本
    ctx.setFillStyle('black')
    ctx.setFontSize(20)
    ctx.fillText('Hello', 20, 50)
    ctx.setFontSize(26)
    ctx.fillText('Winford', 100, 100)
    ctx.setStrokeStyle('black')
    ctx.strokeRect(80, 60, 130, 60)
    // 更多使用示例参考官方文档：https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.html

    await new Promise((resolve, reject) => ctx.draw(false, resolve))
    // 获取画布上的图像像素矩阵
    return new Promise((resolve, reject) => {
      uni.canvasGetImageData({
        canvasId: 'myCanvas',
        x: 0,
        y: 0,
        width,
        height,
        success: resolve
      })
    })
  },
  // 生成图片并获取Canvas的ImageData
  async generateCanvasImageData() {
    // 定义画布宽高
    const width = 1680 // A4 wigth 210mm 203DPI
    const height = 2376 // A4 height 297mm 203DPI
    // const width = 2480 // A4 wigth 210mm 300DPI
    // const height = 3508 // A4 height 297mm 300DPI
    // 创建离屏 2D canvas 实例
    const canvas = uni.createOffscreenCanvas({type: '2d', width: width, height: height})
    // 获取 context。注意这里必须要与创建时的 type 一致
    const ctx = canvas.getContext('2d')

    // 填充白色底色，否则透明png图片打印出来会全黑
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    // 在画布上绘制被填充的文本
    ctx.fillStyle = 'black'
    ctx.font = '16px'
    ctx.fillText('Hello', 20, 50)
    ctx.font = '26px'
    ctx.fillText('Winford', 100, 100)
    ctx.strokeStyle = 'black'
    ctx.strokeRect(80, 60, 130, 60)

    // 创建一个图片
    const image = canvas.createImage()
    // === 本地图片打印 ===
    // 等待图片加载
    await new Promise(resolve => {
      image.onload = resolve
      image.src = '../../static/test.jpg' // 要加载的图片 url
    })
    // 把图片画到离屏 canvas 上
    ctx.drawImage(image, 30, 200, image.width, image.height)

    // === 网络图片打印 ===
    // 等待图片加载
    await new Promise(resolve => {
      image.onload = resolve
      image.src = 'https://web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png' // 要加载的图片 url
    })
    // 把图片画到离屏 canvas 上
    ctx.drawImage(image, 400, 200, image.width, image.height)

    // === BASE64编码图片打印 ===
    // 等待图片加载
    await new Promise(resolve => {
      image.onload = resolve
      image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAglJREFUWEfNmFGOgzAMRJOTlZ6M9mS0J8tqkIxSGnsmgV2Wv6rBeR7Hxk4upZQkPq/XKz2fz201ftszTVO63W7rz8fjIVrky7ICiA3f73eqgZjpeZ5PgQ0BAXS/3xlL+D9AjyjqAsJoHc5DlCmlUdAmIFTrCacKPwL5BfhbcOZEL+QHoBpWZCwebGZK9yTRsizJbDD1N0AFTvFesQM4QCrPBphzdtfDIOBUr60WRkmmOAs7KyDzuqOWfzh5ht0VMFJP9dSTP0o65SzmZVmKV4yPwgE6KvbKWczzPBfvrIyGdq9mpCLbI0/TVFpFWfFOyUKmIguzC3hGeM2BKMwUMKXUbLfOBFzLhVPG2D4ofk1A5pkaXlvnnUMK6J1B9mIvoKcgE+LyJBnOYijEXlZVjL4obI+wUDP5jwIqpSz81CkGGGSknnLOV8Co0itGPEg207Dwbt0MMzQCaSOqNzqoNrd+kLX6qkGlF+xJwA2QqVjPFAZRh9aUQuPBBq4eZz9mEhWyBkMiMaD9Ge25hfia6lgXzLK293+mZnMu/k+Q7s3CSLg99aASG0s9Jenl0RE1601ZlYBzLUgKaKrYBRC7r6mH+npMVSOyh5QBWyXFstdA2NysRqOGHALszdR6fS/knwOqXxqsQzd1CaAKiSNzGaACibN4KSCDvDTELHGsm79cwbrOosbur/p+AOSh+VvOQpJrAAAAAElFTkSuQmCC' // 要加载的图片 url
    })
    // 把图片画到离屏 canvas 上
    ctx.drawImage(image, 430, 400, 50, 50) // 缩放到指定尺寸
    // ctx.drawImage(image, 430, 400, image.width, image.height) // 原图尺寸

    // Canvas更多使用方法参考官方文档：
    // https://developers.weixin.qq.com/miniprogram/dev/api/canvas/OffscreenCanvas.html
    // https://developers.weixin.qq.com/miniprogram/dev/api/canvas/RenderingContext.html
    // https://whatwg-cn.github.io/html/#2dcontext

    // 获取画完后的数据
    return ctx.getImageData(0, 0, width, height) // 打印整个画布

    // // === 大尺寸图片测试 ===
    // // 等待图片加载
    // console.log(' ======> image.onload begin <=====');
    // await new Promise(resolve => {
    //   image.onload = resolve
    //   image.src = 'http://lmy-file.oss-cn-hangzhou.aliyuncs.com/tmp/winford/test/a4_doc_203dpi.jpg' // 要加载的图片 url
    //   // image.src = 'http://lmy-file.oss-cn-hangzhou.aliyuncs.com/tmp/winford/test/a4_doc_300dpi.jpeg' // 要加载的图片 url
    //   // image.src = 'http://lmy-file.oss-cn-hangzhou.aliyuncs.com/tmp/winford/test/a4_photo_300dpi.png' // 要加载的图片 url
    // })
    // console.log(' ======> image.onload end <=====');
    // // 清空画布
    // ctx.fillStyle = 'white'
    // ctx.fillRect(0, 0, width, height)
    // // 把图片画到离屏 canvas 上
    // // 原图尺寸
    // ctx.drawImage(image, 0, 0, image.width, image.height) // 原图尺寸
    // return ctx.getImageData(0, 0, image.width, image.height) // 获取画完后的数据
    // 缩放到画布尺寸(非等比，强制拉伸)
    // ctx.drawImage(image, 0, 0, width, height) // 缩放到画布尺寸(非等比)
    // return ctx.getImageData(0, 0, width, height) // 获取画完后的数据
    // // 等比例缩放到画布尺寸
    // const ratio = Math.min(width / image.width, height / image.height);
    // const targetWidth = Math.floor(image.width * ratio);
    // const targetHeight = Math.floor(image.height * ratio);
    // ctx.drawImage(image, 0, 0, targetWidth, targetHeight) // 等比例缩放
    // return ctx.getImageData(0, 0, targetWidth, targetHeight) // 获取画完后的数据
  },
  // 使用SDK(CPCL.js)构建指令
  async cpcl0() {
    uni.showLoading({
      title: '正在处理图片...',
      mask: true,
    });
    // === 本地图片打印 ===
    // let imgPath = "../../static/test.jpg"
    // === 选择图片打印 ===
    // let imgPath = await new Promise((resolve, reject) => {
    //   uni.chooseImage({
    //     count: 1,
    //     sizeType: ['original'],
    //     success: res => resolve(res.tempFilePaths[0])
    //   })
    // })
    // === 网络图片打印 ===
    // let url = 'https://web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
    // let imgPath = await new Promise((resolve, reject) => {
    // 	uni.downloadFile({
    //      url: url,
    // 		success: res => resolve(res.tempFilePath)
    // 	})
    // })
    // === BASE64编码图片打印 ===
    // 数据中不能包含前缀，如："data:image/png;base64,"
    // let base64 = "iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAglJREFUWEfNmFGOgzAMRJOTlZ6M9mS0J8tqkIxSGnsmgV2Wv6rBeR7Hxk4upZQkPq/XKz2fz201ftszTVO63W7rz8fjIVrky7ICiA3f73eqgZjpeZ5PgQ0BAXS/3xlL+D9AjyjqAsJoHc5DlCmlUdAmIFTrCacKPwL5BfhbcOZEL+QHoBpWZCwebGZK9yTRsizJbDD1N0AFTvFesQM4QCrPBphzdtfDIOBUr60WRkmmOAs7KyDzuqOWfzh5ht0VMFJP9dSTP0o65SzmZVmKV4yPwgE6KvbKWczzPBfvrIyGdq9mpCLbI0/TVFpFWfFOyUKmIguzC3hGeM2BKMwUMKXUbLfOBFzLhVPG2D4ofk1A5pkaXlvnnUMK6J1B9mIvoKcgE+LyJBnOYijEXlZVjL4obI+wUDP5jwIqpSz81CkGGGSknnLOV8Co0itGPEg207Dwbt0MMzQCaSOqNzqoNrd+kLX6qkGlF+xJwA2QqVjPFAZRh9aUQuPBBq4eZz9mEhWyBkMiMaD9Ge25hfia6lgXzLK293+mZnMu/k+Q7s3CSLg99aASG0s9Jenl0RE1601ZlYBzLUgKaKrYBRC7r6mH+npMVSOyh5QBWyXFstdA2NysRqOGHALszdR6fS/knwOqXxqsQzd1CaAKiSNzGaACibN4KSCDvDTELHGsm79cwbrOosbur/p+AOSh+VvOQpJrAAAAAElFTkSuQmCC"
    // let imgPath = `${wx.env.USER_DATA_PATH}/tmp_${new Date().getTime()}`;
    // 写入文件，用完记得删除：uni.getFileSystemManager().unlink({filePath: imgPath})
    // await new Promise((resolve, reject) => {
    // 	uni.getFileSystemManager().writeFile({
    // 		filePath: imgPath,
    // 		data: base64,
    // 		encoding: 'base64',
    // 		success: resolve
    // 	})
    // })

    // 已废弃，请使用新版API，获取ImageData
    // let canvasImageData = await this.imgPath2CanvasImageData(imgPath);
    // 删除BASE64临时保存的文件
    // uni.getFileSystemManager().unlink({filePath: imgPath})

    // === 已废弃，请使用新版API，Canvas生成图片打印(旧版API) ===
    // let canvasImageData = await this.generateCanvasImageDataOld();
 
    // === Canvas生成图片打印(OffscreenCanvas) ===
    let canvasImageData = await this.generateCanvasImageData();

    // console.log('canvasImageData => ', [...canvasImageData.data]);
    console.log('canvasImageData => ', canvasImageData.width, canvasImageData.height);
    uni.showLoading({
      title: '正在生成指令...',
      mask: true,
    });
    // 构建CPCL指令，更多使用方式见cpcl-sdk-demo-js，下载地址：http://open.lingmoyun.com/#/sdkDownload
    console.log('cpcl start => ', new Date());
    const dpi = 203; // 打印机DPI
    // const dpi = 300; // 打印机DPI
    // 构建CPCL指令               整体偏移量 高度 打印份数
    let cpcl = CPCL.Builder.createArea(0, 2376, 1) // ! 0 203 203 2376 1\n
    // let cpcl = CPCL.Builder.createArea(0, 3508, 1) // ! 0 203 203 2376 1\n
      // 任务ID，这里传什么打印结果会原样携带返回，部分打印机支持
      .taskId('1')
      // 固定写法，无需修改
      .pageWidth(dpi == 203 ? 1728 : 2592)
      // 设置图片二值化阈值，数值越大黑点越多，数值越小黑点越少
      //.imageThreshold(150)
      // 打印图片 Canvas的ImageData x y
      .imageGG(canvasImageData, 0, 0) // 小程序调试模式下比较耗时，体验版、正式版正常。
      .formPrint() // FORM\nPRINT\n
      .build();
    console.log('cpcl finish => ', new Date());
    console.log('cpcl => ', cpcl.byteLength);
    // console.log(HEX.ab2hex(cpcl))
    // console.log(HEX.ab2base64(cpcl));
    uni.hideLoading();
    return cpcl;
  },
  // 纯手写指令
  cpcl1() {
    let cpclStr = '! 0 200 200 1040 1\n' +
      'TEXT 55 3 130 40 物流发货单（普运）\n' +

      'TEXT 24 0 70 100 单号:\n' +
      'TEXT 24 0 155 100 6101622\n' + //单号值

      'TEXT 24 0 305 100  货号:\n' +
      'TEXT 24 0 390 100  101521-1-383\n' + //货号值

      'TEXT 24 0 70 140  起站:\n' +
      'TEXT 24 0 155 140  北城\n' + //起站值

      'TEXT 24 0 305 140  电话:\n' +
      'TEXT 24 0 390 140  18000000000\n' + //起站电话

      'TEXT 24 0 70 180  到站:\n' +
      'TEXT 24 0 155 180  宜宾\n' + //到站值

      'TEXT 24 0 305 180  电话:\n' +
      'TEXT 24 0 390 180  18000000000\n' + //到站电话

      'TEXT 24 0 70 220  收货人:\n' +
      'TEXT 24 0 170 220  收货人值\n' + //收货人值

      'TEXT 24 0 305 220  电话:\n' +
      'TEXT 24 0 390 220  18000000000\n' + //收货人电话

      'TEXT 24 0 70 260  发货人:\n' +
      'TEXT 24 0 170 260  发货人值\n' + //发货人值

      'TEXT 24 0 305 260  电话:\n' +
      'TEXT 24 0 390 260  18000000000\n' + //发货人电话

      'TEXT 24 0 70 300  编码:\n' +
      'TEXT 24 0 170 300  编码值\n' + //编码值

      'TEXT 24 0 305 300  日期:\n' +
      'TEXT 24 0 390 300  2021-4-18\n' + //日期

      'LINE 51 350 550 350 2\n' +
      'TEXT 24 0 70 370 货物名称：\n' +
      'TEXT 24 0 180 370  货物名称值\n' + //货物名称值

      'TEXT 24 0 310 370 件数：\n' +
      'TEXT 24 0 420 370  件数值\n' + //件数值

      'TEXT 24 0 70 420 重量：\n' +
      'TEXT 24 0 180 420  重量值\n' + //重量值

      'TEXT 24 0 310 420 体积：\n' +
      'TEXT 24 0 420 420  体积值\n' + //体积值

      'TEXT 24 0 70 470 运费：\n' +
      'TEXT 24 0 180 470  运费值\n' + //运费值

      'TEXT 24 0 310 470 快件费：\n' +
      'TEXT 24 0 420 470  快件费值\n' + //快件费

      'TEXT 24 0 70 520 保价金额：\n' +
      'TEXT 24 0 180 520  保价金额值\n' + //保价金额值

      'TEXT 24 0 310 520 保价费：\n' +
      'TEXT 24 0 420 520  保价费值\n' + //保价费费

      'TEXT 24 0 70 570 叉车费：\n' +
      'TEXT 24 0 180 570  叉车费值\n' + //叉车费值

      'TEXT 24 0 310 570 垫付款：\n' +
      'TEXT 24 0 420 570  垫付款值\n' + //垫付款值

      'TEXT 24 0 70 620 送货费：\n' +
      'TEXT 24 0 180 620  送货费值\n' + //送货费值

      'TEXT 24 0 310 620 已付合计：\n' +
      'TEXT 24 0 420 620  已付合计值\n' + //垫付款值

      'TEXT 24 0 70 670 代收款：\n' +
      'TEXT 24 0 180 670  代收款值\n' + //送货费值

      'TEXT 24 0 310 670 付款方式：\n' +
      'TEXT 24 0 420 670  付款方式值\n' + //付款方式值

      'TEXT 24 0 70 720 货到付款：\n' +
      'TEXT 24 0 180 720  货到付款值\n' + //货到付款值

      'TEXT 24 0 310 720 提货方式：\n' +
      'TEXT 24 0 420 720  提货方式值\n' + //提货方式值

      'TEXT 24 0 70 770 备注：\n' +
      'TEXT 24 0 180 770  备注值\n' + //备注值

      'TEXT 24 0 70 850 重要提示：本公司不收国家禁运货物，包括险品\n' +
      'TEXT 24 0 70 880 同时，请保价运输，没有保价货物，按照单价丢\n' +
      'TEXT 24 0 70 910 货物运费的最高5倍赔偿（货损除外）。\n' +
      'FORM\n' +
      'PRINT\n';
    let cpcl = HEX.str2ab(cpclStr);
    return cpcl;
  },
  // 从服务端获取指令
  async cpcl2() {
    // 服务端以BASE64格式返回，推荐
    let cpclBase64Str = await new Promise(resolve => {
      wx.request({
        url: 'example.php', //仅为示例，并非真实的接口地址
        data: {
          type: 'BASE64'
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          console.log(res.data)
          resolve(res.data.cpcl)
        }
      })
    })
    let cpcl = wx.base64ToArrayBuffer(cpclBase64Str)

    // 服务端以HEX格式返回，不推荐
    // let cpclHexStr = await new Promise(resolve => {
    //   wx.request({
    //     url: 'example.php', //仅为示例，并非真实的接口地址
    //     data: {
    //       type: 'HEX'
    //     },
    //     header: {
    //       'content-type': 'application/json' // 默认值
    //     },
    //     success (res) {
    //       console.log(res.data)
    //       resolve(res.data.cpcl)
    //     }
    //   })
    // })
    // let cpcl = HEX.hex2ab(cpclHexStr)
    
    return cpcl
  },
  async connect(deviceId) {
    if (
      this.data.device &&
      this.data.device.deviceId === deviceId &&
      this.data.device.connected
    ) {
      console.log('---已连接')
      return; // 已连接
    }

    this.data.device && this.data.device.close();
    this.setData({
      device: undefined
    });

    console.log('---正在连接')
    // 蓝牙连接状态监听
    let onBLEConnectionStateChange = function (res) {
      if (res.connected) {
        console.log(`${res.deviceId}连接成功`);
      } else {
        console.log(`${res.deviceId}断开连接`);
      }
    };

    // 蓝牙数据监听
    let resJsons = [];
    let buf = undefined;
    let onBLECharacteristicValueChange = function (res) {
      let buffer = res.value; // ArrayBuffer
      let data = new Uint8Array(buffer);
      let hex = HEX.ab2hex(buffer);
      console.log(`收到数据(hex)--->${hex}`);
      let str = HEX.ab2str(buffer);
      console.log(`收到数据(str)--->${str}`);

      // *****粘包处理开始**************************************************************************
      for (let i = 0; i < data.byteLength; i++) {
        const b = data[i];
        if (buf) {
          buf.push(b);
        }
        if (b === 0x7B) { // '{'
          buf = [b];
        }
        if (b === 0x7D) { // '}'
          let jsonStr = HEX.ab2str(new Uint8Array(buf).buffer);
          resJsons.push(jsonStr);
          buf = undefined;
        }
      }
      // *****粘包处理结束**************************************************************************

      let jsonStr;
      while (jsonStr = resJsons.shift()) {
        let resJson = JSON.parse(jsonStr);
        let taskid = resJson.taskid;
        let printMsg = resJson.printMsg;

        if (printMsg === '77') { // 77表示打印机收到指令，开始打印
          console.log(`taskid=${taskid} print start.`);
          uni.showLoading({
            title: '正在打印...',
            mask: true,
          });
        } else { // 打印机打印结果回复
          const printSuccess = printMsg === '0';
          uni.hideLoading();
          if (printSuccess) { // 打印成功
            console.log(`taskid=${taskid} print successed.`);
            uni.showModal({
              content: '打印成功',
              showCancel: false,
            });
          } else { // 打印失败
            console.log(`taskid=${taskid} print err, code=${printMsg}.`);
            uni.showModal({
              content: '打印失败，err=' + printMsg,
              showCancel: false,
            });
          }
        }
      }
    };

    // 连接
    const device = await Bluetooth.connect({
      deviceId,
      onBLEConnectionStateChange,
      onBLECharacteristicValueChange,
    });

    this.setData({
      device
    });

  },
  async testPrint(e) {
    let deviceId = e.currentTarget.dataset.deviceid;
    uni.showLoading({
      title: '正在连接蓝牙...',
      mask: true,
    });
    await this.connect(deviceId);

    // CPCL指令
    // 一、本地SDK生成指令
    let cpcl = await this.cpcl0();
    // 二、本地手动拼写指令
    // let cpcl = this.cpcl1();
    // 三、服务器生成指令
    // let cpcl = await this.cpcl2();

    uni.showLoading({
      title: '正在发送指令...',
      mask: true,
    });
    // 写入指令
    await this.data.device.write(cpcl);
    // uni.hideLoading();
    // uni.showModal({
    // 	title: '',
    // 	content: '指令已发送，请等待打印',
    // 	showCancel: false,
    // 	success: function (res) {
    // 	}
    // });

  },

})