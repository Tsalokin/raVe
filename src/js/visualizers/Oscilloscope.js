import Visualizer from '../Visualizer'
import Utils from '../utils'
let { abs, sqrt, cos, floor, max, min, sin, PI, pow } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
        minDecibels: -70,
        maxDecibels: -30,
        dataType: 'float',
        dataSet: 'time',
        channel: 'left'
      }, {
        minDecibels: -70,
        maxDecibels: -30,
        dataType: 'float',
        dataSet: 'time',
        channel: 'right'
      }])

    this.ctx = this.canvas.getContext('2d', { alpha: false })
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return

    let ctx = this.ctx
    let data = this.analyzer.getData()

    let l = floor(data[0].time.length)
      ,scale = this.canvas.h*0.5
      ,maxdist = (this.canvas.height*1.4)*0.08
      ,size = this.canvas.height/700
      ,minJump = 0
      ,mode = 1
      ,offset = 0
    ctx.fade(0.8)
    ctx.fillStyle = "#0f0"

    ctx.lineWidth = 1;
    let linefade = 0
    let distsq = 0
    for (let i = 1; i < l; i++) {
        let l = data[0].time[i]
        let r = data[1].time[i]
        let l0 = data[0].time[i-1]
        let r0 = data[1].time[i-1]
        if(mode == 0){
        	ctx.fillRect(l*scale, -r*scale,size,size)
        }else{
          	let deltax = l*scale - l0*scale
         	let deltay = r*scale - r0*scale
          	distsq = sqrt(pow(deltax,2)+pow(deltay,2))
          	linefade = Utils.remap(distsq,0,maxdist,1,0)
        
        ctx.strokeStyle = "rgb(0,"+linefade*255+",0)"
        ctx.beginPath()
        ctx.moveTo(l0*scale-offset, -r0*scale+offset)
        ctx.lineTo(l*scale-offset, -r*scale+offset)
        ctx.stroke();
        }
    }
    console.log(data[0].time.length)
    // console.log(distsq, linefade, maxdist, linefade*255)
    
  }

  destroy() {
    super.destroy()
    delete this.ctx
  }
}
