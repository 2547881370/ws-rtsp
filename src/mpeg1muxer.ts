var Mpeg1Muxer
import * as child from 'child_process'

import * as util from "util"

import * as events from "events"

Mpeg1Muxer = function (options) {
  var key
  this.url = options.url
  this.ffmpegOptions = options.ffmpegOptions
  this.exitCode = undefined
  this.additionalFlags = []
  if (this.ffmpegOptions) {
    for (key in this.ffmpegOptions) {
      this.additionalFlags.push(key)
      if (String(this.ffmpegOptions[key]) !== '') {
        this.additionalFlags.push(String(this.ffmpegOptions[key]))
      }
    }
  }
  this.spawnOptions = [
    "-rtsp_transport", "tcp", "-thread_queue_size", "512",
    "-i",
    this.url,
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    // additional ffmpeg options go here
    ...this.additionalFlags,
    '-'
  ]
  this.stream = child.spawn(options.ffmpegPath, this.spawnOptions, {
    detached: false
  })
  this.inputStreamStarted = true
  this.stream.stdout.on('data', (data) => {
    return this.emit('mpeg1data', data)
  })
  this.stream.stderr.on('data', (data) => {
    return this.emit('ffmpegStderr', data)
  })
  this.stream.on('exit', (code, signal) => {
    if (code === 1) {
      console.error('RTSP stream exited with error')
      this.exitCode = 1
      return this.emit('exitWithError')
    }
  })
  return this
}

util.inherits(Mpeg1Muxer, events.EventEmitter)

export default Mpeg1Muxer
