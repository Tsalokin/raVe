import Visualizer from '../js/Visualizer'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      smoothingTimeConstant: 0,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both'
    }])

    this.ctx = this.cv.getContext('2d')
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    let ctx = this.ctx
      , data = this.analyzer.getData()
      , l = floor(data[0].freq.length / 3)

    ctx.clear()
    ctx.fillStyle = '#fff'

    ctx.beginPath()
    ctx.moveTo(-l, -50)
    for (let i = 0; i < l; i++) {
      let f = (data[0].freq[i] / 255) * 50
        , t = (data[0].time[i * 2] / 128 - 1) * 50
      ctx.lineTo(i * 2 - l, -50 - f / 2)
      ctx.fillRect(i * 2 - l, 50 - t / 2, 2, t + 1)
    }

    ctx.fillStyle = '#fff'
    ctx.lineTo(l, -50)
    for (let i = l - 1; i >= 0; i--) {
      let f = (data[0].freq[i] / 255) * 50
      ctx.lineTo(i * 2 - l, -50 + f / 2)
    }
    ctx.lineTo(-l, -50)
    ctx.fill()
  }
}
