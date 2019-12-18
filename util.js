const fs = require("fs");
const path = require("path");

function writeKey(key) {
  const pathName = path.join(__dirname, "key.txt");
  fs.writeFileSync(pathName, key);
}

function readKey() {
  const pathName = path.join(__dirname, "key.txt");
  return fs.readFileSync(pathName, "UTF-8");
}

// 判断一个路径是不是图片
function isImg(path) {
  const img = [".png", ".jpg", ".jpeg"];
  return img.some(item => path.indexOf(item) > -1);
}

// 遍历文件夹
function findImgs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + "/" + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findImgs(file));
    } else {
      // 判断文件路径是不是图片
      if (isImg(file)) {
        results.push(file);
      }
    }
  });
  return results;
}

// 展示帮助文案
function showHelp() {
  console.log("关于帮助：");
  console.log(`cl-tinypng                       压缩当前目录下所有图片`);
  console.log(`cl-tinypng --path ./test         压缩./test/目录下所有图片`);
  console.log(`cl-tinypng --path ./test.png     压缩./test.png图片`);
  console.log(`cl-tinypng --save xx             设置本地key值`);
  console.log(`cl-tinypng --key                 压缩当前目录下所有图片，使用api key模式，key值为本地保存的key`);
  console.log(`cl-tinypng --key xx              压缩当前目录下所有图片，使用api key模式，key值为xx`);
}

// 可读文件大小
function getReadableFileSize(fileSizeInBytes) {
  let i = -1;
  const byteUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  do {
    fileSizeInBytes = fileSizeInBytes / 1024;
    i++;
  } while (fileSizeInBytes > 1024);

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

module.exports = {
  writeKey,
  readKey,
  findImgs,
  isImg,
  showHelp,
  getReadableFileSize
};
