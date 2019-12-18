#!/usr/bin/env node
const argv = require("optimist").argv;
const util = require("./util");
const readline = require("readline");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const data = require("./data");
const pLimit = require("p-limit");
const qrcode = require("qrcode-terminal");
const tinify = require("tinify");

// 暂时帮助文案
if (argv.help) {
  util.showHelp();
  process.exit();
}

// 保存key
if (argv.save && argv.save !== true) {
  const key = argv.save;
  console.log(chalk.green("开始设置本地key值"), "\n");
  util.writeKey(key);
  console.log("写入完成，当前本地key:", chalk.green(key), "\n");
  process.exit();
}

let fail = 0; // 失败的个数
const failPath = [];
const tryNumber = 1; // 失败重连次数
const limitNumber = 2; // 同时请求数量
const uploadWait = 2000; // 上传延迟时间
const downloadWait = 2000; // 下载延迟时间

console.log(chalk.green("开始压缩图片"));

// 运行路径
const projectDir = process.cwd();
// 获取路径参数
if (!argv.path) {
  // 如果用户没有传入path，默认压缩当前路径，这种情况下需要用户确认是否压缩
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // 用户确认是否压缩
  rl.question("确认压缩当前目录?(yes/no)", answer => {
    if (answer === "" || answer === "yes") {
      // 开始压缩任务
      startTasks(projectDir);
      // 关闭rl
      rl.close();
    } else {
      // 关闭rl
      rl.close();
    }
  });
} else {
  // 压缩路径
  const taskPath = path.resolve(projectDir, argv.path);
  // 开始压缩任务
  startTasks(taskPath);
}

// 压缩任务函数
function startTasks(taskPath) {
  console.log(chalk.green("正在收集所有图片"));
  // 首先判断传入的路径是文件还是文件夹
  const stat = fs.statSync(taskPath);
  if (stat && stat.isDirectory()) {
    // 如果是文件夹，开始搜索图片
    const imgArr = util.findImgs(taskPath);
    // 开始压缩
    tinyImgs(imgArr);
  } else {
    if (util.isImg(taskPath)) {
      // 如果是图片，开始压缩
      tinyImgs([taskPath]);
    } else {
      // 如果不是图片
      console.warn("错误：传入的路径有误", "\n");
      process.exit();
    }
  }
}

// 睡眠函数
async function sleep(time) {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

// 压缩一张图片
async function tinyAImg(imgPath) {
  // 上传延迟
  await sleep(uploadWait);
  // 上传图片
  const uploadResult = await data.upload(imgPath);
  // 判断上传结果是否成功
  if (!uploadResult || !uploadResult.output || !uploadResult.output.url) {
    return false;
  }
  // 下载延迟
  await sleep(downloadWait);
  // 生成下载链接
  const basename = path.basename(imgPath);
  const downloadUrl = uploadResult.output.url + "/" + basename;
  // 开始下载图片
  const downloadResult = await data.download(downloadUrl);
  // 判断是否下载成功
  if (!downloadResult) {
    return false;
  }
  // 写入图片文件
  fs.writeFileSync(imgPath, downloadResult);

  // 当前图片相对于执行路径的相对路径
  const relativeName = path.relative(projectDir, imgPath);
  console.log(
    chalk.green(
      relativeName,
      "压缩完成",
      " from:",
      util.getReadableFileSize(uploadResult.input.size),
      " to:",
      util.getReadableFileSize(uploadResult.output.size),
      " 压缩比例：",
      uploadResult.output.ratio
    )
  );
  return true;
}

// 失败重连机制
async function reTry(imgPath) {
  let count = 1;
  let tinyResult;
  while (!tinyResult && count <= tryNumber) {
    tinyResult = await tinyAImg(imgPath);
    if (!tinyResult) {
      console.log(chalk.red(imgPath, `压缩失败，尝试第${count}次重新压缩。`));
      count++;
    }
  }
  if (!tinyResult) {
    fail++;
    failPath.push(imgPath);
    console.log(chalk.red(imgPath, `重试失败。`));
  }
}

// 压缩图片，没有key，基于网页接口
async function tinyWithoutKey(imgs) {
  // 限制同时请求数量
  const limit = pLimit(limitNumber);
  // 生成任务队列
  const tasks = imgs.map(item => {
    return limit(() => reTry(item));
  });
  // 执行任务
  await Promise.all(tasks);
}

// 压缩图片，基于tinypng api
async function tinyWithKey(imgs) {
  let key = argv.key;
  if (key === true) {
    key = util.readKey();
  }
  if (!key) {
    console.warn("tinypng key 是必须参数！");
    process.exit();
  }
  // api key 传入
  tinify.key = key;
  const tinyArray = imgs.map(item => {
    const beforeSize = fs.statSync(item).size;
    return tinify
      .fromFile(item)
      .toFile(item)
      .then(() => {
        const afterSize = fs.statSync(item).size;
        console.log(
          chalk.green(
            item,
            "压缩完成",
            " from:",
            util.getReadableFileSize(beforeSize),
            " to:",
            util.getReadableFileSize(afterSize),
            " 压缩比例：",
            (afterSize / beforeSize).toFixed(2)
          )
        );
      });
  });
  await Promise.all(tinyArray).then(() => {
    console.log(chalk.green("本月压缩次数：" + tinify.compressionCount), "\n");
  });
}

// 压缩图片函数
async function tinyImgs(imgs) {
  console.log(chalk.green(`总共发现${imgs.length}张图片，开始压缩...`), "\n");

  if (argv.key) {
    await tinyWithKey(imgs);
  } else {
    await tinyWithoutKey(imgs);
  }

  // 完成
  console.log(
    "\n",
    chalk.green(
      `压缩任务执行完，成功个数：${imgs.length - fail}，失败个数：${fail}。`
    ),
    "\n"
  );
  if (fail > 0) {
    console.log("失败地址：\n", chalk.red(failPath.join("\n")));
  } else {
    console.log(chalk.green("O(∩_∩)O ： 感谢使用"));
    console.log(
      chalk.green("如果您觉得不错的话，请作者喝杯奶茶吧！，微信扫码识别："),
      "\n"
    );
    // wxp://f2f08kTJ1FQHEiNOgYHsiv_ZZJPgdlAbnVN_
    qrcode.generate("wxp://f2f08kTJ1FQHEiNOgYHsiv_ZZJPgdlAbnVN_", {
      small: true
    });
  }
}
