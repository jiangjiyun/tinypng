#!/usr/bin/env node

const path = require("path");
const chalk = require("chalk");
const tinify = require("tinify");
const ProgressBar = require("progress");
const util = require("./util");

console.log(chalk.green("开始压缩图片"), "\n");

const arguments = process.argv.splice(2);
// 获取用户传入的路径
const userPath = arguments[0];
const projectDir = process.cwd();
const tinyPath = path.resolve(projectDir, userPath);

console.log("压缩路径：" + chalk.green(tinyPath), "\n");

// 用户的tinify key
const key = arguments[1] || util.readKey();
if (!key) {
  console.warn("tinypng key 是必须参数！");
}
tinify.key = key;

console.log("tiny秘钥：" + chalk.green(key), "\n");

// 压缩
function tinifyImg(path) {
  return tinify.fromFile(path).toFile(path);
}

console.log(chalk.green("正在收集文件夹下所有图片"), "\n");

// 获取文件夹下所有的图片
const imgs = util.findImgs(tinyPath);

console.log(chalk.green(`总共发现${imgs.length}张图片，开始压缩...`), "\n");

// 压缩进度
const bar = new ProgressBar("压缩进度: [:bar] :percent \n", {
  total: imgs.length
});

bar.update();

// 开始压缩
const tinyArray = [];
imgs.forEach(item => {
  tinyArray.push(
    tinifyImg(item).then(() => {
      bar.tick();
    })
  );
});

Promise.all(tinyArray).then(() => {
  console.log(chalk.green("压缩完成"), "\n");
  console.log(chalk.green("本月压缩次数：" + tinify.compressionCount), "\n");
});
