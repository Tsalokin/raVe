import Visualizer from '../Visualizer'
import GLSL from '../GLSL.js'
import frag from './glsl/Rubens.glsl'
// import frag from './glsl/None.glsl'

let { abs, cos, floor, max, min, sin, sqrt, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
        dataType: 'byte',
        dataSet: 'time',
        filters: [{ type: 'lowpass', frequency: 400 }]
      }
    ])

    this.buffer = this.createBuffer(2048, 1)
    this.ctx = this.buffer.getContext('2d')

    this.glsl = new GLSL({
      canvas: this.canvas,
      fragment: frag,
      variables: {
        time: 0,
        canvas: this.buffer
      },
      update: function(time, delta) {
        this.set('time', time)
        this.sync('canvas')
      }
    })

    this.glsl.start()

    super.render()
  }

  destroy() {
    this.glsl.stop()
    super.destroy()
  }

  resize() {
    // super.resize()
    let s = this.scale
    let w = window.innerWidth
    let h = window.innerHeight
    this.glsl.setSize(w * s, h * s)
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    let ctx = this.ctx
    let canvas = this.canvas
    let data = this.analyzer.getData()
    let l = data[0].time.length

    for (let i = 0; i < l; i++) {
      let t = data[0].time[i] / 255 * 100
      // let t = 0.5 * (data[0].time[i] + 1) * 100
      ctx.fillStyle = `hsl(0, 0%, ${t}%)`

      if (i == l - 1) ctx.fillStyle = 'rgb(127, 0, 0)'
      // let t = 0.5 * (data[0].time[i] + 1) * 255
      // ctx.fillStyle = `rgb(${floor(t)}, 20, 0)`
      ctx.fillRect(i, 0, 1, 1)
    }

    // for (let i = -50; i < 50; i++) {
    //   for (let j = -50; j < 50; j++) {
    //     let d1 = 10 * floor(sqrt((i + 40) ** 2 + (j + 40) ** 2))
    //     let d2 = 10 * floor(sqrt((i - 40) ** 2 + (j + 40) ** 2))
    //     let d3 = 10 * floor(sqrt((i + 40) ** 2 + (j - 40) ** 2))
    //     let d4 = 10 * floor(sqrt((i - 40) ** 2 + (j - 40) ** 2))

    //     let t1 = (data[0].time[d1] / 128 - 1) * 200
    //     let t2 = (data[0].time[d2] / 128 - 1) * 200
    //     let t3 = (data[0].time[d3] / 128 - 1) * 200
    //     let t4 = (data[0].time[d4] / 128 - 1) * 200

    //     ctx.fillStyle = `hsl(30, 100%, ${t1 + t2 + t3 + t4}%)`
    //     ctx.beginPath()
    //     ctx.fillRect(10 * i, 10 * j, 10, 10)
    //     ctx.fill()
    //   }
    // }
  }
}
