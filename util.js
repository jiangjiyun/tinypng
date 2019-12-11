#!/usr/bin/env node

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

module.exports = {
  writeKey,
  readKey,
  findImgs
};
