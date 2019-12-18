const fetch = require("node-fetch");
const config = require("./config");
const fs = require("fs");

// 上传图片
function upload(filePath) {
  const matches = filePath.match(config.imgReg);
  return fetch(config.uploadUrl, {
    ...config.uploadConfig,
    headers: {
      ...config.headersConfig,
      "content-type": "image/" + matches[1]
    },
    body: fs.readFileSync(filePath)
  }).then(res => {
    if (res.status === 201) {
      return res.json();
    } else if (res.status === 429) {
      console.log("429 Too Many Requests。（频次限制: 请求过于频繁，请稍后重试）");
    }
  });
}

// { input: { size: 124122, type: 'image/png' },
//   output:
//    { size: 121293,
//      type: 'image/png',
//      width: 750,
//      height: 914,
//      ratio: 0.9772,
//      url:
//       'https://tinypng.com/web/output/0fxz22tpup0yz3uzfap8q7y0w44t54pa' } }

function download(url) {
  return fetch(url, {
    ...config.downloadConfig
  }).then(res => {
    if (res.status === 200) {
      return res.buffer();
    }
  });
}

module.exports = {
  upload,
  download
};
