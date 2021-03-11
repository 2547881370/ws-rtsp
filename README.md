## 安装前, 电脑必须要有node环境 pm2 和 ffmpeg , ffmpeg版本: 当前测试的版本是ffmpeg version 4.3.2-2021-02-27-essentials_build;
<br/>

# 安装
    1、npm i ws-rtsp
<br/>


# 使用demo

<br/>
   ws主要拼接两个参数
   <br/>
   1. url : base64编码格式的rtsp地址
   <br/>
   2. channelid : 通道编号; 强烈建议直接将base64的地址赋值给该参数
   

```
// node  /app.js

var http = require('http');
var rtsp = require('ws-rtsp');

var server = http.createServer();
new rtsp.StreamingMediaServer(server);
server.listen(8089);

```

```
// index.html

<html>

<body>
  <button onclick="player()">播放</button>
  <canvas id="canvas"></canvas>
</body>

<script type="text/javascript" src="./js/jsmpeg.min.js"></script>
<script type="text/javascript">
  function player() {
    new JSMpeg.Player('ws://localhost:8089/flv?url=cnRzcDovL2FkbWluOjEyMzQ1NmFhQDE3Mi4xNi4xLjcwL1N0cmVhbWluZy9DaGFubmVscy8xMDE=&channelid=2', {
      canvas: document.getElementById('canvas'),
    })
  }
</script>

</html>

