### 安装

全局安装 tiny 命令

```
yarn global add cl-tinypng
```

或者

```
npm install -g cl-tinypng
```

### 使用

#### 获取 tinypng 秘钥

[秘钥获取地址](https://tinypng.com/developers)

#### 设置本地密码

保存 key 到本地，方便后续使用

```js
cl-tinypng --save key
```

#### 压缩命令

支持两种压缩方式：

##### 基于 tinypng http 接口（无限次数免费压缩）

压缩当前目录

```js
cl-tinypng
```

压缩指定目录，或者压缩指定图片

```js
cl-tinypng --path ./test
// 或者
cl-tinypng --path ./test.png
```

##### 基于 tinypng api 接口（需要 key，每月免费压缩 500 次，更多次数需要收费）

压缩当前目录

```js
cl-tinypng --key xxxkey

// 如果已经配置过了本地key，可以使用如下方式
cl-tinypng --key

```

压缩指定目录，或者压缩指定图片

```js
cl-tinypng --path ./test --key
// 或者
cl-tinypng --path ./test.png --key
```

#### 注意事项

1、为了防止触发 tinypng 接口的 429（频次限制），http 接口访问做了延迟处理，并且设置同一时间，并发请求量为 2。

2、如果你每月免费次数还剩余的情况下，推荐使用 api key 方式压缩。 
