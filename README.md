# sketch-ui-proofread
移动端对稿工具，减少对稿链路，快速匹配对稿，早点下班☕️

## 基本背景
前端在工作中难以避免遇到与设计进行对稿工作，在了解到一些设计的对稿步骤繁琐，传图链路过长而且效率低下，所以这个工具的产生就是为了解决这个问题。

## 项目介绍
工具主要分为两端，一个是sketch的插件端，一个是服务端。两者通过websocket进行通信。对稿通过服务端提供的链接选择自己的sketch，传输任何图片，然后在sketch端直接显示，并直接对齐设计稿。

## 项目底层
为了尝鲜和更好的管理项目，选择使用[yarn](https://yarnpkg.com/) + [lerna](https://github.com/lerna/lerna)来管理两端的项目，在此基础上，衍生出ui-pr-socket工具包进行两端通信。
项目构建工具主要选择[vite](https://vitejs.dev/)、[rollup](https://rollupjs.org/guide/en/)，前端界面自然优先使用[vue3](https://vuejs.org/)

### ui-pr-helper
sketch插件端实现基于 *sketch-module-web-view* 来实现webview层，然后在webview上使用websocket进行接收图片，从服务器的网页端接收到图片后通过 *sketch-module-web-view* 桥接接口将图片发送到sketch中
webview主要是使用了 [headlessui](https://headlessui.dev/vue/) + [socket.io](https://socket.io/docs/v4/) + [vue3](https://vuejs.org/)，简单并快速搭建页面

### ui-pr-server
服务端主要是用[koa](https://koajs.com/)搭建，中间使用[lowdb](https://github.com/typicode/lowdb/tree/v1.0.0)管理连接sketch端用户，实现在同一个公司局域网内多sketch用户使用的场景

### ui-pr-socket
socket插件包是基于[socket.io](https://socket.io/docs/v4/)开发，集成sketch端和服务端的socket连接通信，双端通信的能力，同时也适用于浏览器端，毕竟sketch插件底层就是webview。

### 项目运行
```bash
yarn

# ui-pr-socket build
cd packages/ui-pr-socket
yarn build

# ui-pr-helper dev
cd packages/ui-pr-helper
yarn dev

# ui-pr-helper build
cd packages/ui-pr-helper
yarn build

# ui-pr-server server dev
cd packages/ui-pr-server
yarn build:client
yarn dev:server

# ui-pr-server client dev
cd packages/ui-pr-server
yarn dev:client

# ui-pr-server build
cd packages/ui-pr-server
yarn compile

```
