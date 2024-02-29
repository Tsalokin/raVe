import Visualizer from '../Visualizer'
import Utils from '../utils'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([
      {
        fftSize: 8192,
        smoothingTimeConstant: 0.5,
        minDecibels: -70,
        maxDecibels: 30, 
        dataType: 'byte',
        dataSet: 'frequency',
        //fftsize: 120
      },
      {
        filters: [{ type: 'lowpass', frequency: 3000 }],
        minDecibels: -70,
        maxDecibels: 30,
        dataType: 'float',
        dataSet: 'time',
        fftSize: 2048
      },
      {
        filters: [{ type: 'lowpass', frequency: 1000 }],
        dataType: 'float',
        dataSet: 'time',
      }
    ])

    this.bgar = (new Array(400)).fill((new Array(2)).fill(0))
    this.ctx = this.canvas.getContext('2d')
    this.buffer = this.createBuffer()
    //this.container.appendChild(this.buffer)
    this.buf = this.buffer.getContext('2d')
    this.buffer1 = this.createBuffer()
    //this.container.appendChild(this.buffer1)
    this.buf1 = this.buffer1.getContext('2d')
    this.buffer1b = this.createBuffer()
    //this.container.appendChild(this.buffer1b)
    this.buf1b = this.buffer1b.getContext('2d')
    this.bassbuf = new Array(15).fill(0)
    this.rtavg = new Array(60).fill(0)
    this.rfavg = new Array(60).fill(0)
    super.render()
  }

  resize() {
    super.resize()
    this.buffer.width = this.canvas.width
    this.buffer.height = this.canvas.height
    this.buffer1.width = this.canvas.width
    this.buffer1.height = this.canvas.height
    this.buffer1b.width = this.canvas.width
    this.buffer1b.height = this.canvas.height
  }

  maxcalc(data) {
    let max = (new Array(100)).fill((new Array(2)).fill(0))
      , avg = this.arrAvg(data, 2, 1024, 10)

    for (let i = 2; i < 512; i++) {
      for (let j = 0; j < max.length - 1; j++) {
        if (data[i] >= max[j][0] && data[i] > avg * 1.5)
          max[j] = [data[i], i]
        if (max[j][0] >= max[j + 1][0]) {
          max[j + 1] = max[j]
          max[j] = [0, 0]
        }
      }
    }
    return max
  }

  arrAvg(data, start, end, min) {
    let sum = 0
    min = min || 0
    for (let i = start; i < end; i++)
      if (data[i] > min)
        sum += data[i]
    return sum / ((end - start))
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    var { canvas, ctx, bgar, buf, buf1, buf1b } = this
      , noise = 0
      , spike = 0
      , fade = 0

      , fdata = this.analyzer.getData()[0].freq
      , tdata = this.analyzer.getData()[1].time
      , tdatab = this.analyzer.getData()[2].time
      , avg = this.arrAvg(fdata, 2, 700)
      , tavg = this.arrAvg(tdata , 0, 2048)*100
      , hscale = canvas.w/1920*0.75*Utils.remap(avg, 0, 40, 1, 2)
      , max = this.maxcalc(fdata)
      , lowscalemod = 0.75
      , hiscalemod = 1
      , scale = 0.02
      , space = Math.ceil(1*canvas.w/1920)
      , width = Math.ceil(1*canvas.w/800)
      , huelimit = 180
      , hue = (this.tick / 10) % huelimit
      , l = tdata.length*this.scale
      , sep = canvas.h / tdata.length
      , maxes = Utils.getMaxes(tdata, 5, 0.5 * l, 1.5 * l, abs)
      , offset = maxes[0][0] - 0.5 * l

      
    ctx.clear()

    
    this.rfavg.shift()
    this.rfavg.push(avg)

    this.rtavg.shift()
    this.rtavg.push(tavg)

    let bass = Utils.max(tdatab, abs)
    this.bassbuf.shift()
    this.bassbuf.push(bass)
    let bassAvg = Utils.average(this.bassbuf)
    let bassSpike = bass > 0.15 && bass > 1.3 * bassAvg
    bass += (0.1 * Utils.average(tdatab, 0, 2)) / 255

    this.debug = " "+this.arrAvg(this.rfavg,0,this.rfavg.length).toFixed(2)+" "+this.arrAvg(this.rtavg,0,this.rfavg.length).toFixed(2)+" "+(bass*30).toFixed(2)

    //draw scaled buffer
    // ctx.drawImage(
    //   this.buffer,
    //   -0.5 * canvas.w * (1 - scale),
    //   -0.5 * canvas.h * (1 - scale),
    //   canvas.w * (1 - scale),
    //   canvas.h * (1 - scale)
    // )

    //MAX BARS
    for (let i = 0; i < max.length; i++) {
      if (max[i][0] > 0) {
        ctx.fillStyle = `hsl(${abs(hue - huelimit)},70%,${Utils.remap(max[i][0], 0, 78, 80, 50)}%)`
        // RIGHT
        ctx.fillRect(max[i][1] * (width + space) - width / 2, -1, width, hscale * -max[i][0])
        ctx.fillRect(max[i][1] * (width + space) - width / 2, 2, width, hscale * max[i][0] / 2)
        // LEFT
        ctx.fillRect(-max[i][1] * (width + space) - width / 2, -1, width, hscale * -max[i][0])
        ctx.fillRect(-max[i][1] * (width + space) - width / 2, 2, width, hscale * max[i][0] / 2)
        //BG BARS
        bgar[max[i][1]] = max[i][0] * 4
      }
    }

    buf.clear()
    buf.drawImage(
      this.canvas,
      0,
      0
    ) //save
    //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    //primary tdata buffer
    buf1.clear()
    buf1.drawImage(
      this.buffer1b,
      (this.scale - 1) * 0.5 * canvas.w * (scale),
      (this.scale - 1) * 0.5 * canvas.h * (1 - Utils.remap(tavg/1.5+(bass*15), 0, 40, 1 - scale*lowscalemod, 1 + scale*hiscalemod)),
      this.scale * canvas.w,
      this.scale * canvas.h
    )
    buf1b.clear()

    //TDATA WARP
    for (let i = 0; i < l; i++) {
      var w = canvas.w * this.scale
      var h = canvas.h * this.scale
      var ws = 1 * this.scale
      var hs = 150 * this.scale
      var canvash4 = h / 4
        , OneZeroOne = Math.abs(i - canvash4) / canvash4
      //console.log(OneZeroOne)
      buf1.fillStyle = `hsl(${abs(hue - (huelimit * bassSpike))},${Utils.remap(bassSpike ? (1 + bassAvg) * 10 : avg, 0, 30, 0, 100)}%,${OneZeroOne * 80}%)`
      buf1.fillRect((w - 25 + OneZeroOne * ws) - (tdata[i]) * OneZeroOne * 2, (i * 2), (tdata[i + offset] * hs * (1 + 2 * bassAvg * bassSpike)) * OneZeroOne * 2, 1)
      buf1.fillRect((25 - OneZeroOne * ws) + (tdata[i]) * OneZeroOne * 2, (i * 2), -(tdata[i + offset] * hs * (1 + 2 * bassAvg * bassSpike)) * OneZeroOne * 2, 1)
      //buf1.fillRect(0,0,canvas.w,canvas.h)
    }

    ctx.drawImage(
      this.buffer1,
      -0.5 * canvas.w,
      -0.5 * canvas.h,
      canvas.w,
      canvas.h
    )

    buf1b.drawImage(this.buffer1,
      0.5 * canvas.w * (scale),
      0.5 * canvas.h * (1 - Utils.remap(tavg/1.5+(bass*20), 0, 40, 1 - scale*lowscalemod, 1 + scale*hiscalemod)),
      this.scale * canvas.w * (1 - scale),
      this.scale * canvas.h * Utils.remap(tavg/1.5+(bass*20), 0, 40, 1 - scale*lowscalemod, 1 + scale*hiscalemod)
    )


    //RAWBARS
    for (let i = 0; i < this.canvas.w / 2; i++) {
      //CenterLines

      ctx.fillStyle = "hsla(0,0%,70%,0.4)"
      //ctx.fillRect(-1,-canvas.h/2,2,canvas.h)
      ctx.fillRect(i * (width + space) - width / 2, 0, width, 1)
      ctx.fillRect(-i * (width + space) - width / 2, 0, width, 1)
      if (fdata[i] > 0) {
        //FREQ BARS
        //RIGHT
        ctx.fillRect(i * (width + space) - width / 2, -1, width, hscale * -fdata[i])
        ctx.fillRect(i * (width + space) - width / 2, 2, width, hscale * fdata[i] / 2)

        //LEFT
        ctx.fillRect(-i * (width + space) - width / 2, -1, width, hscale * -fdata[i])
        ctx.fillRect(-i * (width + space) - width / 2, 2, width, hscale * fdata[i] / 2)

        //BG Bars
        if (bgar[i] > 200) {
          // let grey = Math.round(Math.min(bgar[i], 250))
          // ctx.fillStyle = ctx.strokeStyle = "rgba(" + grey + "," + grey + "," + grey + ",0.3)"

          let grd = ctx.createLinearGradient(0, 300, 0, -300)
          grd.addColorStop(0, "transparent")
          grd.addColorStop(0.5, `hsl(${hue - 90},80%,30%)`)
          grd.addColorStop(1, "transparent")

          ctx.fillStyle = grd

          //RIGHT
          ctx.fillRect(i * (width + space) - width / 2, hscale * -fdata[i] - 5, width, -125)
          ctx.fillRect(i * (width + space) - width / 2, hscale * fdata[i] / 2 + 5, width, 125)
          //LEFT
          ctx.fillRect(-i * (width + space) - width / 2, hscale * -fdata[i] - 5, width, -125)
          ctx.fillRect(-i * (width + space) - width / 2,  hscale * fdata[i] / 2 + 5, width, 125)
          bgar[i] -= 5
        }
      }
    }
  }

  estroy() {
    super.destroy()
    delete this.ctx
    delete this.buf
    delete this.buf1
    delete this.buf1b
    delete this.buffer
    delete this.buffer1
    delete this.buffer1b
    delete this.bassbuf
  }
}
