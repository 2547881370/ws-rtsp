import { ChannelConfig } from './ChannelConfig';
import * as SocketIO from 'socket.io';
import Mpeg1Muxer from "./mpeg1muxer"

interface IFfmpeg {
    instance: any,
    stream: any,
    data: null
}
/** 通道 */
export class Channel {
    /** 空闲时间 */
    public freeTime: number = 0;
    /** 通道配置信息 */
    public readonly config: ChannelConfig;
    /** 客户端列表 */
    public readonly clients: SocketIO.Socket[] = [];
    /** 是否正在封装码流 */
    public isStreamWrap: boolean = false;
    /** ffmpeg进程 */
    private mpeg1Muxer: IFfmpeg = {
        instance: null,
        stream: null,
        data: null
    };
    /**
     * 实例化一个通道配置信息
     * @param config 通道配置信息
     */
    constructor(config: ChannelConfig) {
        this.config = config;
    }
    /** 开始封装码流 */
    public startStreamWrap(): void {
        if (this.isStreamWrap) return;
        this.isStreamWrap = true;
        this.mpeg1Muxer.instance = new Mpeg1Muxer({
            ffmpegOptions: { // options ffmpeg flags
                '-stats': '', // an option with no neccessary value uses a blank string
                '-r': 30 // options with required values specify the value after the key
            },
            url: this.config.url,
            ffmpegPath: "ffmpeg"
        })
        this.mpeg1Muxer.stream = this.mpeg1Muxer.instance.stream
        this.mpeg1Muxer.instance.on('mpeg1data', (data) => {
            this.broadcast(data)
            this.mpeg1Muxer.data = data
        })
    }

    private broadcast(data: any): void {
        for (let client of this.clients) {
            if ((client as any).initSegment) {
                client.send(data)
            };
        }
    }
    /** 结束封装码流 */
    public stopStreamWrap(): void {
        this.mpeg1Muxer.stream.kill()
        this.mpeg1Muxer.stream = null;
    }
    /**
     * 添加客户端
     * @param client 客户端
     */
    public addClient(client: SocketIO.Socket): void {
        client.once("close", () => {
            this.onDisconnect(client)
        })
        this.clients.push(client);
        if (!this.isStreamWrap) this.startStreamWrap();
        // 如果当前通道正在转流, 且有视频流 ,直接返回给客户端
        if (this.mpeg1Muxer.data) {
            this.initSegment(client);
        }
        else {
            let timeout: NodeJS.Timeout = setInterval(() => {
                if (this.mpeg1Muxer) {
                    clearInterval(timeout);
                    this.initSegment(client);
                }
            }, 100);
        }
    }
    private initSegment(client: SocketIO.Socket): void {
        client.send(this.mpeg1Muxer.data);
        (client as any).initSegment = true;
    }
    private onDisconnect(client: SocketIO.Socket): void {
        let index: number = this.clients.indexOf(client);
        if (index > -1) this.clients.splice(index, 1);
    }
}