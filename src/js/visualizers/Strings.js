import Visualizer from '../Visualizer'
import Utils from '../utils'
let { abs, cos, ceil, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)

    let stc = 0.9
    let filts = 7
    let maxfreq = 5000
    options = []

    //TODO: lowpass bass filter to keep it propagating into higher freq filters
    // note to above, alex was dumb, setting filter type wasn't actually working
    // ... default was lowpass, you want bandpass. Q changes band width (default 1)
    // ... google Q-factor to learn how it affects width
    for (let f = 0; f < filts; f++) {
      let frequency = floor((f / filts) ** 2 * maxfreq) + 100 // add 100 to center bass
      options.push({
        filters: [{
          type: f == 0 ? 'lowpass' : 'bandpass',
          frequency, Q: 1
        }],
        smoothingTimeConstant: stc,
        minDecibels: -70,
        maxDecibels: -30,
        dataType: 'float',
        dataSet: 'both',
        fftSize: 2048
      })
    }

    this.analyzer.setOptions(options)

    this.buffer = this.createBuffer()
    this.buf = this.buffer.getContext('2d')

    this.ctx = this.canvas.getContext('2d')
    super.render()
  }

  resize() {
    super.resize()
    this.buffer.width = this.canvas.width
    this.buffer.height = this.canvas.height
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    const { canvas, ctx, buf, buffer } = this

    let data = this.analyzer.getData(),
      l = 0.5 * data[0].time.length,
      scale = 300,
      sep = canvas.h / data.length,
      cvh2 = canvas.h / 2

    buf.clear()
    ctx.fade(0.1)
    buf.drawImage(canvas, 0, 0, canvas.width, canvas.height)
    

    ctx.clear()
    let s = 0.98
    ctx.drawImage(buffer, -0.5 * canvas.w * s, -0.5 * canvas.h * s, canvas.w * s, canvas.h * s)

    // ctx.globalCompositeOperation = 'lighter' 
    for (let fil in data) {
      let td = data[fil].time
      ctx.save()

      let maxes = Utils.getMaxes(td, 5, 0.5 * l, 1.5 * l, abs)
      let offset = maxes[0][0] - 0.5 * l
      let thick = fil == 0 ? max(10, maxes[0][1] * 100) : 10

      // every other filter, flip x
      if (fil % 2) ctx.scale(-1, 1)

      let hue = this.tick + fil * 180 / data.length
      ctx.fillStyle = `hsl(${hue}, 60%, 30%)`

      let yy = ceil(fil / 2)
      let y = (fil % 2 ? -1 : 1) * yy * sep

      ctx.beginPath()
      ctx.moveTo(-l, y)
      for (let i = 0; i < l; i++) {
        let t = td[i + offset] * scale + thick
        ctx.lineTo((2 * i - l), y - t / 2)
      }
      for (let i = l - 1; i >= 0; i--) {
        let t = td[i + offset] * scale - thick
        ctx.lineTo((2 * i - l), y - t / 2)
      }
      // ctx.lineTo(l / 2 - 2, y)
      // ctx.lineTo(-l / 2, y)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }
  }
  
  destroy() {
    super.destroy()
    delete this.ctx
    delete this.buf
    delete this.buffer
    delete this.bassbuf
  }
}
