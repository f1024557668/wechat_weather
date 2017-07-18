var util = require("../../utils/util.js")
//index.js
//获取应用实例
var app = getApp()
var order = ['red', 'yellow', 'blue', 'green', 'red']
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    result : {},
    mainObj : {},
    toView: 'red',
    scrollTop: 100
  },
  //滚动条滚到顶部的时候触发
  upper: function (e) {
    console.log(e)
  },
  //滚动条滚到底部的时候触发
  lower: function (e) {
    console.log(e)
  },
  //滚动条滚动后触发
  scroll: function (e) {
    console.log(e)
  },
  //点击按钮切换到下一个view
  tap: function (e) {
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1]
        })
        break
      }
    }
  },
  //通过设置滚动条位置实现画面滚动
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '/example/flex/flex'
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        //var speed = res.speed
        //var accuracy = res.accuracy
        var now = new Date(), hour = now.getHours()
        var todayTempUrl = 'https://api.yytianqi.com/observe?city=' + latitude + ',' + longitude + '&key=l59wg5nh20oi46oi'
        that.fetchNowTemperature(todayTempUrl, hour)
        var airUrl = 'http://api.yytianqi.com/air?city=' + latitude + ',' + longitude + '&key=l59wg5nh20oi46oi'
        that.fetchAirQuantity(airUrl)
        // 20分钟取一次
        setInterval(function () {
          that.fetchNowTemperature(todayTempUrl, hour)
          that.fetchAirQuantity(airUrl)
        }, 2000000)
        var weekTempUrl = 'https://api.yytianqi.com/forecast7d?city=' + latitude + ',' + longitude + '&key=l59wg5nh20oi46oi'
        wx.request({
          url: weekTempUrl,
          success: function (res) {
            var data = res.data
            if (data.msg == "Sucess") {
              var list = data.data.list
              for(var i = 0; i < list.length; i++) {
                var item = list[i]
                that.transformItemPic(item, hour);

                if (hour >= 19) {
                  item["temperature"] = item.tq2
                  item["degree"] = item.qw2
                  item["flow"] = item.fl2
                  item["flowx"] = item.fx2
                } else {
                  item["temperature"] = item.tq1
                  item["degree"] = item.qw1
                  item["flow"] = item.fl1
                  item["flowx"] = item.fx1
                }
              }
              that.setData({
                result : {
                  cityName : data.data.cityName,
                  counts: data.counts,
                  lastModifyTime: '\n' + data.data.sj,
                  list: list
                }
              })
            }
          }
        })
      }
    })
  },
  fetchAirQuantity: function(airUrl) {
    var _this = this
    wx.request({
      url: airUrl,
      success: function (res) {
        var data = res.data
        if (data.msg == "Sucess") {
          var result = _this.data.result
          result.counts = data.counts
          var mainObj = _this.data.mainObj
          
          // AQI
          mainObj.aqi= data.data.aqi,
          // 主要污染物
          mainObj.pollutant= data.data.pollutant,
          // PM2.5浓度，单位μg/m3
          mainObj.pm25= data.data.pm25,
          // PM10浓度，单位μg/m3
          mainObj.pm10= data.data.pm10,
          // SO2浓度，单位μg/m3
          mainObj.so2= data.data.so2,
          // NO2浓度，单位μg/m3
          mainObj.no2= data.data.no2,
          //　污染级别
          mainObj.level= data.data.level,
          // 污染类别
          mainObj.grade= data.data.grade,
          // 建议使用颜色
          mainObj.color= data.data.color,
          // 健康影响
          mainObj.health= data.data.health,
          // 建议措施
          mainObj.measure= data.data.measure,
          mainObj.lastModifyTime= data.data.last_update
          result.lastModifyTime = data.data.last_update
          _this.setData({
            result: result,
            mainObj: mainObj
          })
        }
      }
    })
  },
  // 拉取现在的气温等参数
  fetchNowTemperature: function (todayTempUrl, hour) {
    var _this = this
    wx.request({
      url: todayTempUrl,
      success: function (res) {
        var data = res.data
        if (data.msg == "Sucess") {
           _this.transformPicUrl(data, hour);
          var weatherDesc = "天\t\t气：" + data.data.tq
          var temperatureDesc = "当前温度：" + data.data.qw 
          var flowDesc = "当前风力：" + data.data.fl
          var fxDesc = "当前风向：" + data.data.fx
          var sdDesc = "当前湿度：" + data.data.sd + "%"
          var result = _this.data.result
          result.counts = data.counts
          result.lastModifyTime = data.lastUpdate
          var mainObj = _this.data.mainObj
          mainObj.tempPicUrl= "https://raw.githubusercontent.com/f1024557668/WeChatProgramImage/master" + data.picUrl
          mainObj.weatherDesc= weatherDesc
          mainObj.temperatureDesc= temperatureDesc
          mainObj.flowDesc= flowDesc
          mainObj.fxDesc= fxDesc,
          mainObj.sdDesc= sdDesc
          _this.setData({
            result: result,
            mainObj: mainObj
          })
        }
      }
    })
  },
  // 天气对应图片转换
  transformPicUrl: function(data, hour) {
    var numtq = data.data.numtq;
    if (numtq == '00') {
      if (hour >= 19) {
        data.picUrl = '/images/main/00_1.png';
      } else {
        data.picUrl = '/images/main/00_0.png';
      }
    }
    if (numtq == '01') {
      if (hour >= 19) {
        data.picUrl = '/images/main/01_1.png';
      } else {
        data.picUrl = '/images/main/01_0.png';
      }
    }
    if (numtq == '02') {
      if (hour >= 19) {
        data.picUrl = '/images/main/02_1.png';
      } else {
        data.picUrl = '/images/main/02_0.png';
      }
    }
    if (numtq == '03') {
      if (hour >= 19) {
        data.picUrl = '/images/main/03_1.png';
      } else {
        data.picUrl = '/images/main/03_0.png';
      }
    }
    if (numtq == '04') {
      if (hour >= 19) {
        data.picUrl = '/images/main/04_1.png';
      } else {
        data.picUrl = '/images/main/04_0.png';
      }
    }
    if (numtq == '05') {
      if (hour >= 19) {
        data.picUrl = '/images/main/05_1.png';
      } else {
        data.picUrl = '/images/05_0.png';
      }
    }
    if (numtq == '06') {
      if (hour >= 19) {
        data.picUrl = '/images/main/06_1.png';
      } else {
        data.picUrl = '/images/main/06_0.png';
      }
    }
    if (numtq == '07') {
      if (hour >= 19) {
        data.picUrl = '/images/main/07_1.png';
      } else {
        data.picUrl = '/images/main/07_0.png';
      }
    }
    if (numtq == '08') {
      if (hour >= 19) {
        data.picUrl = '/images/main/08_1.png';
      } else {
        data.picUrl = '/images/main/08_0.png';
      }
    }
    if (numtq == '08') {
      if (hour >= 19) {
        data.picUrl = '/images/main/08_1.png';
      } else {
        data.picUrl = '/images/main/08_0.png';
      }
    }
    if (numtq == '09') {
      if (hour >= 19) {
        data.picUrl = '/images/main/09_1.png';
      } else {
        data.picUrl = '/images/09_0.png';
      }
    }
    if (numtq == '10') {
      if (hour >= 19) {
        data.picUrl = '/images/main/10_1.png';
      } else {
        data.picUrl = '/images/main/10_0.png';
      }
    }
    if (numtq == '11') {
      if (hour >= 19) {
        data.picUrl = '/images/main/11_1.png';
      } else {
        data.picUrl = '/images/main/11_0.png';
      }
    }
    if (numtq == '12') {
      if (hour >= 19) {
        data.picUrl = '/images/main/12_1.png';
      } else {
        data.picUrl = '/images/main/12_0.png';
      }
    }
    if (numtq == '13') {
      if (hour >= 19) {
        data.picUrl = '/images/main/13_1.png';
      } else {
        data.picUrl = '/images/main/13_0.png';
      }
    }
    if (numtq == '14') {
      if (hour >= 19) {
        data.picUrl = '/images/main/14_1.png';
      } else {
        data.picUrl = '/images/main/14_0.png';
      }
    }
    if (numtq == '15') {
      if (hour >= 19) {
        data.picUrl = '/images/main/15_1.png';
      } else {
        data.picUrl = '/images/main/15_0.png';
      }
    }
    if (numtq == '16') {
      if (hour >= 19) {
        data.picUrl = '/images/main/16_1.png';
      } else {
        data.picUrl = '/images/main/16_0.png';
      }
    }
    if (numtq == '17') {
      if (hour >= 19) {
        data.picUrl = '/images/main/17_1.png';
      } else {
        data.picUrl = '/images/main/17_0.png';
      }
    }
    if (numtq == '18') {
      if (hour >= 19) {
        data.picUrl = '/images/main/18_1.png';
      } else {
        data.picUrl = '/images/main/18_0.png';
      }
    }
    if (numtq == '19') {
      if (hour >= 19) {
        data.picUrl = '/images/main/19_1.png';
      } else {
        data.picUrl = '/images/main/19_0.png';
      }
    }
    if (numtq == '20') {
      if (hour >= 19) {
        data.picUrl = '/images/main/20_1.png';
      } else {
        data.picUrl = '/images/main/20_0.png';
      }
    }
    if (numtq == '21') {
      if (hour >= 19) {
        data.picUrl = '/images/main/21_1.png';
      } else {
        data.picUrl = '/images/main/21_0.png';
      }
    }
    if (numtq == '22') {
      if (hour >= 19) {
        data.picUrl = '/images/main/22_1.png';
      } else {
        data.picUrl = '/images/main/22_0.png';
      }
    }
    if (numtq == '23') {
      if (hour >= 19) {
        data.picUrl = '/images/main/23_1.png';
      } else {
        data.picUrl = '/images/main/23_0.png';
      }
    }
    if (numtq == '24') {
      if (hour >= 19) {
        data.picUrl = '/images/main/24_1.png';
      } else {
        data.picUrl = '/images/main/24_0.png';
      }
    }
    if (numtq == '25') {
      if (hour >= 19) {
        data.picUrl = '/images/main/25_1.png';
      } else {
        data.picUrl = '/images/main/25_0.png';
      }
    }
    if (numtq == '26') {
      if (hour >= 19) {
        data.picUrl = '/images/main/26_1.png';
      } else {
        data.picUrl = '/images/main/26_0.png';
      }
    }
    if (numtq == '27') {
      if (hour >= 19) {
        data.picUrl = '/images/main/27_1.png';
      } else {
        data.picUrl = '/images/main/27_0.png';
      }
    }
    if (numtq == '28') {
      if (hour >= 19) {
        data.picUrl = '/images/main/28_1.png';
      } else {
        data.picUrl = '/images/main/28_0.png';
      }
    }
    if (numtq == '29') {
      if (hour >= 19) {
        data.picUrl = '/images/main/29_1.png';
      } else {
        data.picUrl = '/images/main/29_0.png';
      }
    }
    if (numtq == '30') {
      if (hour >= 19) {
        data.picUrl = '/images/main/30_1.png';
      } else {
        data.picUrl = '/images/main/30_0.png';
      }
    }
    if (numtq == '31') {
      if (hour >= 19) {
        data.picUrl = '/images/main/31_1.png';
      } else {
        data.picUrl = '/images/main/31_0.png';
      }
    }
    if (numtq == '32') {
      if (hour >= 19) {
        data.picUrl = '/images/main/32_1.png';
      } else {
        data.picUrl = '/images/main/32_0.png';
      }
    }
    if (numtq == '49') {
      if (hour >= 19) {
        data.picUrl = '/images/main/49_1.png';
      } else {
        data.picUrl = '/images/main/49_0.png';
      }
    }
    if (numtq == '53') {
      if (hour >= 19) {
        data.picUrl = '/images/main/53_1.png';
      } else {
        data.picUrl = '/images/main/53_0.png';
      }
    }
    if (numtq == '54') {
      if (hour >= 19) {
        data.picUrl = '/images/main/54_1.png';
      } else {
        data.picUrl = '/images/main/54_0.png';
      }
    }
    if (numtq == '55') {
      if (hour >= 19) {
        data.picUrl = '/images/main/55_1.png';
      } else {
        data.picUrl = '/images/main/55_0.png';
      }
    }
    if (numtq == '56') {
      if (hour >= 19) {
        data.picUrl = '/images/main/56_1.png';
      } else {
        data.picUrl = '/images/main/56_0.png';
      }
    }
    if (numtq == '57') {
      if (hour >= 19) {
        data.picUrl = '/images/main/57_1.png';
      } else {
        data.picUrl = '/images/main/57_0.png';
      }
    }
    if (numtq == '58') {
      if (hour >= 19) {
        data.picUrl = '/images/main/58_1.png';
      } else {
        data.picUrl = '/images/main/58_0.png';
      }
    }
    if (numtq == '99') {
      if (hour >= 19) {
        data.picUrl = '/images/main/99_1.png';
      } else {
        data.picUrl = '/images/main/99_0.png';
      }
    }
    if (numtq == '100') {
      if (hour >= 19) {
        data.picUrl = '/images/main/100_1.png';
      } else {
        data.picUrl = '/images/main/100_0.png';
      }
    }
  },
  transformItemPic: function(item, hour) {
    if (item.numtq1 == '00' || item.numtq2 == '00') {
      if (hour >= 19) {
        item.picUrl = '/images/00_1.png';
      } else {
        item.picUrl = '/images/00_0.png';
      }
    }
    if (item.numtq1 == '01' || item.numtq2 == '01') {
      if (hour >= 19) {
        item.picUrl = '/images/01_1.png';
      } else {
        item.picUrl = '/images/01_0.png';
      }
    }
    if (item.numtq1 == '02' || item.numtq2 == '02') {
      if (hour >= 19) {
        item.picUrl = '/images/02_1.png';
      } else {
        item.picUrl = '/images/02_0.png';
      }
    }
    if (item.numtq1 == '03' || item.numtq2 == '03') {
      if (hour >= 19) {
        item.picUrl = '/images/03_1.png';
      } else {
        item.picUrl = '/images/03_0.png';
      }
    }
    if (item.numtq1 == '04' || item.numtq2 == '04') {
      if (hour >= 19) {
        item.picUrl = '/images/04_1.png';
      } else {
        item.picUrl = '/images/04_0.png';
      }
    }
    if (item.numtq1 == '05' || item.numtq2 == '05') {
      if (hour >= 19) {
        item.picUrl = '/images/05_1.png';
      } else {
        item.picUrl = '/images/05_0.png';
      }
    }
    if (item.numtq1 == '06' || item.numtq2 == '06') {
      if (hour >= 19) {
        item.picUrl = '/images/06_1.png';
      } else {
        item.picUrl = '/images/06_0.png';
      }
    }
    if (item.numtq1 == '07' || item.numtq2 == '07') {
      if (hour >= 19) {
        item.picUrl = '/images/07_1.png';
      } else {
        item.picUrl = '/images/07_0.png';
      }
    }
    if (item.numtq1 == '08' || item.numtq2 == '08') {
      if (hour >= 19) {
        item.picUrl = '/images/08_1.png';
      } else {
        item.picUrl = '/images/08_0.png';
      }
    }
    if (item.numtq1 == '09' || item.numtq2 == '09') {
      if (hour >= 19) {
        item.picUrl = '/images/09_1.png';
      } else {
        item.picUrl = '/images/09_0.png';
      }
    }
    if (item.numtq1 == '10' || item.numtq2 == '10') {
      if (hour >= 19) {
        item.picUrl = '/images/10_1.png';
      } else {
        item.picUrl = '/images/10_0.png';
      }
    }
    if (item.numtq1 == '11' || item.numtq2 == '11') {
      if (hour >= 19) {
        item.picUrl = '/images/11_1.png';
      } else {
        item.picUrl = '/images/11_0.png';
      }
    }
    if (item.numtq1 == '12' || item.numtq2 == '12') {
      if (hour >= 19) {
        item.picUrl = '/images/12_1.png';
      } else {
        item.picUrl = '/images/12_0.png';
      }
    }
    if (item.numtq1 == '13' || item.numtq2 == '13') {
      if (hour >= 19) {
        item.picUrl = '/images/13_1.png';
      } else {
        item.picUrl = '/images/13_0.png';
      }
    }
    if (item.numtq1 == '14' || item.numtq2 == '14') {
      if (hour >= 19) {
        item.picUrl = '/images/14_1.png';
      } else {
        item.picUrl = '/images/14_0.png';
      }
    }
    if (item.numtq1 == '15' || item.numtq2 == '15') {
      if (hour >= 19) {
        item.picUrl = '/images/15_1.png';
      } else {
        item.picUrl = '/images/15_0.png';
      }
    }
    if (item.numtq1 == '16' || item.numtq2 == '16') {
      if (hour >= 19) {
        item.picUrl = '/images/16_1.png';
      } else {
        item.picUrl = '/images/16_0.png';
      }
    }
    if (item.numtq1 == '17' || item.numtq2 == '17') {
      if (hour >= 19) {
        item.picUrl = '/images/17_1.png';
      } else {
        item.picUrl = '/images/17_0.png';
      }
    }
    if (item.numtq1 == '18' || item.numtq2 == '18') {
      if (hour >= 19) {
        item.picUrl = '/images/18_1.png';
      } else {
        item.picUrl = '/images/18_0.png';
      }
    }
    if (item.numtq1 == '19' || item.numtq2 == '19') {
      if (hour >= 19) {
        item.picUrl = '/images/19_1.png';
      } else {
        item.picUrl = '/images/19_0.png';
      }
    }
    if (item.numtq1 == '20' || item.numtq2 == '20') {
      if (hour >= 19) {
        item.picUrl = '/images/20_1.png';
      } else {
        item.picUrl = '/images/20_0.png';
      }
    }
    if (item.numtq1 == '21' || item.numtq2 == '21') {
      if (hour >= 19) {
        item.picUrl = '/images/21_1.png';
      } else {
        item.picUrl = '/images/21_0.png';
      }
    }
    if (item.numtq1 == '22' || item.numtq2 == '22') {
      if (hour >= 19) {
        item.picUrl = '/images/22_1.png';
      } else {
        item.picUrl = '/images/22_0.png';
      }
    }
    if (item.numtq1 == '23' || item.numtq2 == '23') {
      if (hour >= 19) {
        item.picUrl = '/images/23_1.png';
      } else {
        item.picUrl = '/images/23_0.png';
      }
    }
    if (item.numtq1 == '24' || item.numtq2 == '24') {
      if (hour >= 19) {
        item.picUrl = '/images/24_1.png';
      } else {
        item.picUrl = '/images/24_0.png';
      }
    }
    if (item.numtq1 == '25' || item.numtq2 == '25') {
      if (hour >= 19) {
        item.picUrl = '/images/25_1.png';
      } else {
        item.picUrl = '/images/25_0.png';
      }
    }
    if (item.numtq1 == '26' || item.numtq2 == '26') {
      if (hour >= 19) {
        item.picUrl = '/images/26_1.png';
      } else {
        item.picUrl = '/images/26_0.png';
      }
    }
    if (item.numtq1 == '27' || item.numtq2 == '27') {
      if (hour >= 19) {
        item.picUrl = '/images/27_1.png';
      } else {
        item.picUrl = '/images/27_0.png';
      }
    }
    if (item.numtq1 == '28' || item.numtq2 == '28') {
      if (hour >= 19) {
        item.picUrl = '/images/28_1.png';
      } else {
        item.picUrl = '/images/28_0.png';
      }
    }
    if (item.numtq1 == '29' || item.numtq2 == '29') {
      if (hour >= 19) {
        item.picUrl = '/images/29_1.png';
      } else {
        item.picUrl = '/images/29_0.png';
      }
    }
    if (item.numtq1 == '30' || item.numtq2 == '30') {
      if (hour >= 19) {
        item.picUrl = '/images/30_1.png';
      } else {
        item.picUrl = '/images/30_0.png';
      }
    }
    if (item.numtq1 == '31' || item.numtq2 == '31') {
      if (hour >= 19) {
        item.picUrl = '/images/31_1.png';
      } else {
        item.picUrl = '/images/31_0.png';
      }
    }
    if (item.numtq1 == '32' || item.numtq2 == '32') {
      if (hour >= 19) {
        item.picUrl = '/images/32_1.png';
      } else {
        item.picUrl = '/images/32_0.png';
      }
    }
    if (item.numtq1 == '49' || item.numtq2 == '49') {
      if (hour >= 19) {
        item.picUrl = '/images/49_1.png';
      } else {
        item.picUrl = '/images/49_0.png';
      }
    }
    if (item.numtq1 == '53' || item.numtq2 == '53') {
      if (hour >= 19) {
        item.picUrl = '/images/53_1.png';
      } else {
        item.picUrl = '/images/53_0.png';
      }
    }
    if (item.numtq1 == '54' || item.numtq2 == '54') {
      if (hour >= 19) {
        item.picUrl = '/images/54_1.png';
      } else {
        item.picUrl = '/images/54_0.png';
      }
    }
    if (item.numtq1 == '55' || item.numtq2 == '55') {
      if (hour >= 19) {
        item.picUrl = '/images/55_1.png';
      } else {
        item.picUrl = '/images/55_0.png';
      }
    }
    if (item.numtq1 == '56' || item.numtq2 == '56') {
      if (hour >= 19) {
        item.picUrl = '/images/56_1.png';
      } else {
        item.picUrl = '/images/56_0.png';
      }
    }
    if (item.numtq1 == '57' || item.numtq2 == '57') {
      if (hour >= 19) {
        item.picUrl = '/images/57_1.png';
      } else {
        item.picUrl = '/images/57_0.png';
      }
    }
    if (item.numtq1 == '58' || item.numtq2 == '58') {
      if (hour >= 19) {
        item.picUrl = '/images/58_1.png';
      } else {
        item.picUrl = '/images/58_0.png';
      }
    }
    if (item.numtq1 == '99' || item.numtq2 == '99') {
      if (hour >= 19) {
        item.picUrl = '/images/99_1.png';
      } else {
        item.picUrl = '/images/99_0.png';
      }
    }
    if (item.numtq1 == '100' || item.numtq2 == '100') {
      if (hour >= 19) {
        item.picUrl = '/images/100_1.png';
      } else {
        item.picUrl = '/images/100_0.png';
      }
    }

    item.picUrl = "https://raw.githubusercontent.com/f1024557668/WeChatProgramImage/master" + item.picUrl
  }
})
