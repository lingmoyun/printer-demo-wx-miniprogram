/*!
 * Create by Winford
 */
// var GBK = require('./gbk.min.js');
import GBK from './gbk.min.js'


// 16进度字符串转ArrayBuffe
const hex2ab = (hex) => {
  let hexArr = hex.match(/[\da-f]{2}/gi) || [];
  return new Uint8Array(hexArr.map(function (e) {
    return parseInt(e, 16);
  })).buffer;
}

// ArrayBuffer转16进度字符串
const ab2hex = (buffer) => {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2);
    }
  )
  return hexArr.join('');
}

// ArrayBuffer转字符串
const ab2str = (buffer) => {
  return GBK.decode(new Uint8Array(buffer));
}

// 字符串转ArrayBuffer
const str2ab = (str) => {
  return new Uint8Array(GBK.encode(str)).buffer;
}

// 拼接 let ab = connect(Uint8Array, ab0, ab1)
const concat = (resultConstructor, ...arrays) => {
  let totalLength = 0;
  for (let arr of arrays) {
      totalLength += arr.length;
  }
  let result = new resultConstructor(totalLength);
  let offset = 0;
  for (let arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
  }
  return result;
}



module.exports = {
  ab2hex, hex2ab,
  ab2str, str2ab,
  concat,
}
