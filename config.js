// header 配置
const headersConfig = {
  origin: "https://tinypng.com",
  referer: "https://tinypng.com/",
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
};

// 上传配置
const uploadUrl = "https://tinypng.com/web/shrink";
const uploadConfig = {
  method: "POST",
  credentials: "omit"
};

// 下载配置
const downloadConfig = {
  method: "GET",
  credentials: "omit"
};

// 正则
const imgReg = /\.(png|jpe?g)$/;

module.exports = {
  headersConfig,
  uploadUrl,
  uploadConfig,
  downloadConfig,
  imgReg
};
