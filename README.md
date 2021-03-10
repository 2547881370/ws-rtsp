## 安装前, 电脑必须要有node环境 pm2 和 ffmpeg , ffmpeg版本: 当前测试的版本是ffmpeg version 4.3.2-2021-02-27-essentials_build;
<br/>

# 安装
    1、npm install
<br/>

# 运行

    1、后台挂起运行 npm run pm2
<br/>

# 其他命令

    1、停止服务 npm run stop
<br/>

    2、重启服务 npm run restart

# 使用demo

<br/>
   ws主要拼接两个参数
   <br/>
   1. url : base64编码格式的rtsp地址
   <br/>
   2. channelid : 通道编号; 强烈建议直接将base64的地址赋值给该参数
    ```
        <html>

        <body>
        <button onclick="player()">播放</button>
        <canvas id="canvas"></canvas>
        </body>

        <script type="text/javascript" src="./js/jsmpeg.min.js"></script>
        <script type="text/javascript">
        function player() {
            new JSMpeg.Player('ws://172.16.1.3:8089/flv?url=cnRzcDovL2FkbWluOjEyMzQ1NmFhQDE3Mi4xNi4xLjcwL1N0cmVhbWluZy9DaGFubmVscy8xMDE=&channelid=2', {
            canvas: document.getElementById('canvas'),
            })
        }
        </script>

        </html>
    ```


