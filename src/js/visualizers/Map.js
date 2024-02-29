import Visualizer from '../Visualizer'
import procnoise from 'proc-noise'

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      filters: [{
        type: 'lowpass',
        frequency: 4000
      }],
      smoothingTimeConstant: 0.7,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both'
    }])

    this.size = 80
    this.glsl = 0
    this.perlin = new procnoise()
    this.ctx = this.canvas.getContext('2d')
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    let { canvas, ctx } = this
      , data = this.analyzer.getData()

    switch (this.glsl) {
      case 0:
        ctx.clear()
        for (let x = 0; x < this.size; x++) {
          for (let y = 0; y < this.size; y++) {
            let s = this.perlin.noise(x * 0.015, y * 0.015, this.tick / 1000)
              , n = Math.floor(Math.abs(s * 256))
              , w = canvas.w / this.size
              , h = canvas.h / this.size
              , ow = canvas.w / 2
              , oh = canvas.h / 2

            ctx.fillStyle = `hsl(${s * 360}, 100%, ${(data[0].freq[n] / 255) * 70}%)`
            ctx.fillRect((x * w - ow), (y * h - oh), w, h)
          }
        }
        break;
      case 1:

        break;
    }
  }
  destroy() {
    super.destroy()
    delete this.ctx
  }
}
