export function dateFormatter(date: Date, fmt: string = 'YYYY-mm-dd HH:MM:SS') {
  let ret;
  const opt: { [key: string]: string } = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

export function validateHTTP(str: string) {
  return str.indexOf("http://") == 0 || str.indexOf("https://") == 0
}

export function getUuid(str = ''): string {
  return str
    ? ((Number(str) ^ Math.random() * 16) >> Number(str) / 4).toString(16)
    : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
}

export function arrayBufferToImgUrl(buffer: ArrayBuffer) {
  // Obtain a blob: URL for the image data.
  let arrayBufferView = new Uint8Array(buffer);
  let blob = new Blob([arrayBufferView], { type: "image/jpeg" });
  let urlCreator = window.URL || window.webkitURL;
  let imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// 获取图片比例
export function getImgScale(base64Str: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // 创建对象
    var img = new Image()
    // 改变图片的src
    img.src = base64Str
    // 判断是否有缓存
    if (img.complete) {
      resolve(img.width / img.height)
    } else {
      // 加载完成执行
      img.onload = function () {
        resolve(img.width / img.height)
      }
      img.onerror = function (err) {
        reject(err)
      }
    }
  })
}