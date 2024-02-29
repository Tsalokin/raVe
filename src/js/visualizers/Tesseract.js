import Visualizer from '../Visualizer'
import Utils from '../utils'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      filters: [{type: 'highpass', frequency: 100}],
      smoothingTimeConstant: 0,
      minDecibels: -70,
      maxDecibels: 30,
      dataType: 'byte',
      dataSet: 'both'
    },
    { 
      filters: [{type: 'lowpass', frequency: 100}],
      dataType: 'float',
      dataSet: 'time',
    }
  ])

    this.rotation = 1
    this.stars = (new Array(400)).fill(0).map(function () {
      return (new Array(3)).fill(0);
    });
    this.bassbuf = new Array(15).fill(0)
    this.vo = 0
    this.ctx = this.canvas.getContext('2d')
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return
    this.tick++;

    var noise = 0
      , avg = 0
      , spike = 0
      , fade = 0
      , PI = Math.PI
      ,fdata = this.analyzer.getData()[0].freq
      ,tdatab = this.analyzer.getData()[1].time

    let bass = Utils.max(tdatab, abs)
    this.bassbuf.shift()
    this.bassbuf.push(bass)
    let bassAvg = Utils.average(this.bassbuf)
    let bassSpike = bass > 0.15 && bass > 1.3 * bassAvg
    bass += (0.1 * Utils.average(tdatab, 0, 2)) / 255

    let q
    let e
    this.ctx.clear();
    // this.ctx.fillStyle = dim;
    // this.ctx.fillRect(-canvas.w/2, -canvas.h/2, canvas.w, canvas.h);
    var avg = Utils.average(fdata, 7, 512)
      , ab = Utils.avgbin(fdata, 100);


    // STARS
    for (var i = 0; i < this.stars.length; i++) {
      var x = this.stars[i][0]
        , y = this.stars[i][1]
        , d = Utils.dist(x, y, 0, 0)
        , a = Math.atan2(y, x);

      if (!d || Math.abs(x) > this.canvas.w / 2 || Math.abs(y) > this.canvas.h / 2) {
        d = Math.random() * this.canvas.w / 2 + 50;
        a = Math.random() * 2 * PI;
        this.stars[i][2] = Math.min(0.5, Math.random());
      } else {
        d *= 1.01;
      }

      a += d / 100000;
      x = d * Math.cos(a);
      y = d * Math.sin(a);

      this.stars[i][0] = x;
      this.stars[i][1] = y;
      this.stars[i][2] *= 1.01;

      var alpha = Math.min(100, ab[i % ab.length] * 6) / 80;
      this.ctx.fillStyle = "hsla(0, 100%, 100%," + alpha + ")";
      this.ctx.fillRect(...this.stars[i], this.stars[i][2]);
    }

    // Tesseract
    // Inner
    var o = Math.min(20 * bass, 20)
      , h = 50 + o / 2
      , w = h * Math.sin(PI / 3);

    this.ctx.save();
    if (this.rotaton) this.ctx.rotate(-Math.pow(Math.sin(this.tick / 500 / 3), 6) * PI * 8)
    this.ctx.rotate(PI)
    for (var i = 0; i < 3; i++) {
      var light = 60 + 30 * Math.sin(2 * PI * (this.tick / 280 + i / 3));
      this.ctx.fillStyle = "hsl(30, 100%, " + light + "%)";
      this.ctx.rotate(2 * PI / 3);
      this.ctx.beginPath();
      this.ctx.moveTo(0, o + h);
      this.ctx.lineTo(w, o + h / 2);
      this.ctx.lineTo(0, o + 0);
      this.ctx.lineTo(-w, o + h / 2);
      this.ctx.lineTo(0, o + h);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Outer
    this.vo += avg;
    var h = 70 + this.vo / 2
      , w = h * Math.sin(PI / 3);

    this.ctx.save()
    if (this.rotation) this.ctx.rotate(Math.pow(Math.sin((this.tick + bassAvg*5) / 500 / 3), 6) * PI * 8)
    this.ctx.rotate(PI)
    for (var i = 0; i < 3; i++) {
      var light = 60 + 30 * Math.sin(2 * PI * (this.tick / 480 + -i / 3));
      this.ctx.fillStyle = "hsl(0, 0%, " + light + "%)"
      this.ctx.rotate(2 * PI / 3)
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.vo + h);
      this.ctx.lineTo(w, this.vo + h / 2);
      this.ctx.lineTo(0, this.vo + 0);
      this.ctx.lineTo(-w, this.vo + h / 2);
      this.ctx.lineTo(0, this.vo + h);
      this.ctx.fill();
    }
    this.vo = Math.max(20, this.vo * 0.8);
    this.ctx.restore();

  };
  destroy() {
    super.destroy()
    delete this.ctx
  }
}
