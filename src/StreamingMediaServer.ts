import { Channel } from './Channel';
import { ChannelConfig } from './ChannelConfig';
import * as SocketIO from 'socket.io';
import { Server } from 'http';
import * as WS from 'ws'
import * as urlib from "url"
import * as atob from "atob"

interface IParamsQuery {
    query: {
        url?: string
        channelid?: string
    }
}
type TParams = IParamsQuery & urlib.UrlWithParsedQuery

/** 流媒体服务器 */
export class StreamingMediaServer {
    /** 视频通道列表 */
    public readonly channels: Channel[] = [];
    private _ws: WS.Server
    /**
     * 实例化一个流媒体服务器对象
     * @param http HTTP服务
     */
    constructor(http: Server) {
        // 空闲检测
        setInterval(() => this.checkFree(), 10000);

        // node 自带模块 ws创建
        this._ws = new WS.Server({
            server: http
        })

        this._ws.on("connection", (socket: SocketIO.Socket, request) => {
            // 解析url
            const params: TParams = urlib.parse(request.url, true)
            console.log(params.query.url)
            console.log(params.query.channelid)

            // 注册视频通道
            if (params.query.channelid && params.query.url) {
                const channelid = params.query.channelid
                const url = atob((params.query.url.toString()))
                this.onStart(socket, JSON.stringify({
                    channelid: channelid,
                    url: url
                }))
            }
        })
    }

    /**
     * 注册视频通道
     * @param client 客户端soket信息 
     * @param msg  config参数
     */
    private onStart(client: SocketIO.Socket, msg: string): void {
        let config: ChannelConfig = JSON.parse(msg);
        //先检查对应的通道是否存在，如果存在则直接加入到该通道，否则先创建通道再加入
        let channel: Channel = this.getChannel(config.channelid);
        if (!channel) channel = this.createChannel(config);
        // 将客户端soket信息加入到视频通道中, 视频通道对象需要使用
        channel.addClient(client);
    }
    
    /**
     * 判断指定通道是否存在
     * @param channelid 通道编号
     */
    private getChannel(channelid: string): Channel {
        for (let channel of this.channels) {
            if (channel.config.channelid == channelid) return channel;
        }
        return null;
    }
    /**
     * 创建一个视频通道
     * @param config 通道配置信息
     */
    public createChannel(config: ChannelConfig): Channel {
        let channel: Channel = new Channel(config);
        this.channels.push(channel);
        return channel;
    }
    /**
     * 移除指定的视频通道
     * @param channelid 视频通道编号
     */
    public removeChannel(channel: Channel): void {
        let index: number = this.channels.indexOf(channel);
        if (index > -1) {
            this.channels.splice(index, 1);
            channel.stopStreamWrap();
        }
    }
    /** 空闲检测，通道空闲超过1分钟，则移除对应通道。 */
    private checkFree(): void {
        // this.channels存储的是视频通道对象
        for (let channel of this.channels) {
            // 视频通道对象里面会有多个客户端soket对象 clients
            // 如果视频通道中的存在多个客户端soket对象, 证明此长连接正在使用
            if (channel.clients.length > 0) {
                channel.freeTime = 0
            } else {
                channel.freeTime += 10
            };
            if (channel.freeTime >= 60) {
                this.removeChannel(channel)
            };
        }
    }
}