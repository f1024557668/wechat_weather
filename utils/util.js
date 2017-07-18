function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}

/* 
* @param {Object} target 目标对象。 
* @param {Object} source 源对象。 
* @param {boolean} deep 是否复制(继承)对象中的对象。 
* @returns {Object} 返回继承了source对象属性的新对象。 
*/
var extend = (function () {
  for (var p in { toString: null }) {
    //检查当前浏览器是否支持forin循环去遍历出一个不可枚举的属性，比如toString属性，如果不能遍历不可枚举的属性(IE浏览器缺陷)，那么forin循环不会进来
    return function extend(o) {
      for (var i = 1, len = arguments.length; i < len; i++) {
        var source = arguments[i];
        for (prop in source) {
          o[prop] = source[prop];
        }
      }

    }
  }
  //这些属性需要特殊检查一下，因为有的IE浏览器不支持for in去遍历这些属性
  var protoprops = ["toString", "valueOf", "constructor", "hasOwnProperty", "isPropertyOf", "propertyIsEnumerable", "toLocalString"];
  return function patched_extend(o) {
    for (var i = 1, len = arguments.length; i < len; i++) {
      var source = arguments[i];
      for (prop in source) {//先遍历常规的属性
        o[prop] = source[prop];
      }
      //检查是否有特殊属性，防止漏掉
      for (var j = 0, len = protoprops.length; j < len; j++) {
        prop = protoprops[j];
        if (source.hasOwnProperty(prop)) {
          o[prop] = source[prop];
        }
      }
    }
    return o;
  }
}());

module.exports.extend = { extend: extend}