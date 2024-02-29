import Visualizer from '../js/Visualizer'
// import frag from './glsl/Ripple.glsl'
import frag from './glsl/Kaleido.glsl'
// import frag from './glsl/None.glsl'
// import frag from './glsl/Rubens.glsl'
import GLSL from '../js/GLSL.js'
import Utils from '../js/Utils'

let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([
      {
        smoothingTimeConstant: 0,
        minDecibels: -70,
        maxDecibels: -30,
        dataType: 'byte',
        dataSet: 'both'
      },
      {
        dataType: 'byte',
        dataSet: 'time',
        filters: [{ type: 'lowpass', frequency: 100 }]
      }
    ])

    this.buffer = this.createBuffer()

    this.glsl = new GLSL({
      canvas: this.canvas,
      fragment: frag,
      variables: {
        bass: 0,
        time: 0,
        canvas: this.buffer
      },
      update: function(time, delta) {
        this.set('time', time)
        this.sync('canvas')
      }
    })

    this.glsl.start()
    this.ctx = this.buffer.getContext('2d')
    this.buffer2 = this.createBuffer()
    this.buf = this.buffer2.getContext('2d')
    super.render()
  }

  destroy() {
    this.glsl.stop()
    super.destroy()
  }

  resize() {
    super.resize()
    // this.ctx.scale(2, 2)
    this.buffer2.width = this.buffer.width
    this.buffer2.height = this.buffer.height
    this.glsl.setSize(this.buffer.width, this.buffer.height)
  }

  render() {
    // don't render if paused
    if (!super.render()) {
      if (this.glsl._running) this.glsl.stop()
      return
    }

    if (!this.glsl._running) this.glsl.start()

    let ctx = this.ctx,
      canvas = this.buffer,
      data = this.analyzer.getData(),
      l = floor(data[0].freq.length / 3),
      bass = (Utils.max(data[1].time) - 128) / 128 / 3

    this.glsl.set('bass', bass)

    this.buf.drawImage(this.buffer, 0, 0)
    ctx.clear()
    let scale = 1.03, //0.97,
      sx = 0, // 1 * sin(Date.now() / 1000)
      sy = 0 // 1 * sin(Date.now() / 967)

    // draw buffer scaled up for hyperspace
    ctx.drawImage(
      this.buffer2,
      -0.5 * canvas.w * scale - sx,
      -0.5 * canvas.h * scale - sy,
      canvas.w * scale,
      canvas.h * scale
    )

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(-canvas.w / 2, -canvas.h / 2, canvas.w, canvas.h)

    // ctx.clear()
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 0 + 100 * bass

    var hl = floor(0.5 * l)
    for (let j = 0; j < 2; j++) {
      ctx.save()
      ctx.rotate((j - 1) * 2 * PI / 3 - PI / 6)
      ctx.translate(0, 100 + 200 * bass)
      // ctx.beginPath()

      for (let i = 0; i < l; i++) {
        let i2 = floor(abs(0.5 * l - i))
        let f = data[0].freq[i2] / 255 * 50
        let t = (data[1].time[i * 2] / 128 - 1) * 50 + 1
        let t2 = (data[0].time[i * 2] / 128 - 1) * 50

        // optimize by ignoring half
        if ((j == 0 && i <= hl) || (j == 1 && i >= hl))
          ctx.fillRect(i * 2 - l, -50 - f / 2, 2, f)
        if ((j == 0 && i <= hl) || (j == 1 && i >= hl))
          ctx.fillRect(i * 2 - l, 50 - t / 2 + t2, 2, t)
        if ((j == 0 && i >= hl) || (j == 1 && i <= hl))
          ctx.fillRect(l - i * 2, 150 - f / 2, 2, f)
      }

      ctx.beginPath()
      ctx.arc(0, 50, 50 + 150 * bass, 0, 2 * PI)
      ctx.stroke()

      ctx.restore()
    }
  }
}
