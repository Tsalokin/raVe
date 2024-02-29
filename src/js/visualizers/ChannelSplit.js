import Visualizer from '../Visualizer'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      smoothingTimeConstant: 0.5,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both',
      channel: 'left'
    }, {
      smoothingTimeConstant: 0.5,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both',
      channel: 'right'
    }])

    this.ctx = this.cv.getContext('2d')
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    let ctx = this.ctx
      , data = this.analyzer.getData()
      , l = floor(data[0].freq.length / 2)

    ctx.clear()
    ctx.fillStyle = '#fff'

    ctx.beginPath()
    ctx.moveTo(-l, -50)
    for (let i = 0; i < l; i++) {
      let cl = 100 * (data[0].freq[i] / 255)
        , cr = 100 * (data[1].freq[i] / 255)

      ctx.fillRect(-cl - 50 - 1, i - l / 2, 2, 2)
      ctx.fillRect(cl - cr - 1, i - l / 2, 2, 2)
      ctx.fillRect(cr + 50 - 1, i - l / 2, 2, 2)
    }
  }
}
