#!/usr/bin/env node

const chalk = require("chalk");
const util = require("./util");

const arguments = process.argv.splice(2);
const key = arguments[0];

console.log(chalk.green("开始保存tinykey"), "\n");

util.writeKey(key);

console.log("写入完成，当前本地key:", chalk.green(key), "\n");
