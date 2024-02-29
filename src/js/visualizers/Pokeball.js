import Visualizer from '../Visualizer'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      smoothingTimeConstant: 0.2,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both'
    }, {
      filters: [{
        type: 'lowpass',
        frequency: 100
      }],
      dataType: 'byte',
      dataSet: 'time'
    }])

    this.ctx = this.canvas.getContext('2d')
    this.ctx.fullscreen(this.scale)
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

    let l1 = l / 2
      , r = 100
      , R = 180

    ctx.fillStyle = '#fd3333'
    ctx.beginPath()
    ctx.arc(0, 0, 200, PI, 2 * PI)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(0, 0, 200, 0, PI)
    ctx.fill()

    ctx.fillStyle = '#000'
    ctx.clearRect(-201, -15, 402, 30)
    ctx.beginPath()
    ctx.arc(0, 0, 70, 0, 2 * PI)
    ctx.fill()

    // inner ring
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    for (let i = 0; i < l; i++) {
      let f = (data[0].freq[i] / 255)
        , t = (data[0].time[i * 2] / 128 - 1)
        , r = 40 + 10 * t
        , a = PI * i / (l - 1) + PI / 2
        , x = r * cos(a)
        , y = r * sin(a)
      ctx.lineTo(x, y)
    }
    ctx.fill()

    ctx.beginPath()
    for (let i = 0; i < l; i++) {
      let f = (data[0].freq[i] / 255)
        , t = (data[0].time[i * 2] / 128 - 1)
        , r = 40 + 10 * t
        , a = PI * i / (l - 1) + PI / 2
        , x = -r * cos(a)
        , y = r * sin(a)
      ctx.lineTo(x, y)
    }
    ctx.fill()
    // end inner ring

    // outer ring
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    // ctx.fillStyle = '#fff'
    ctx.beginPath()
    for (let j = 0; j < 4 * l; j++) {
      let i = floor(abs(l - j % (2 * l)))
        , f = (data[0].freq[i] / 255)
        , t = (data[1].time[i * 2] / 128)
        , r = R + 100 * (f + t) / 2

      ctx[j == 0 ? 'moveTo' : 'lineTo'](0, r)
      ctx.rotate(2 * PI / (4 * l))
    }

    ctx.moveTo(0, 0)
    for (let j = 0; j < 4 * l; j++) {
      let i = floor(abs(l - j % (2 * l)))
        , f = (data[0].freq[i] / 255)
        , t = (data[1].time[i * 2] / 128)
        , r = R + 100 * (t - f / 3) / 2 - 3

      ctx[j == 0 ? 'moveTo' : 'lineTo'](0, r)
      ctx.rotate(-2 * PI / (4 * l))
    }
    ctx.fill()
    ctx.restore()
    // end outer ring
  }
}
