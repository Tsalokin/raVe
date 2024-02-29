import Visualizer from '../Visualizer'
// dunno why import doesn't work here
// import THREE from 'three'
const THREE = require('three')

export default class extends Visualizer {
  constructor (options, settings) {
    super(options, settings)
    this.analyzer.setOptions([{
      smoothingTimeConstant: 0.5,
      minDecibels: -70,
      maxDecibels: -30,
      dataType: 'byte',
      dataSet: 'both'
    }])

    // no particular reason why I made an init function
    // instead of leaving it all in the constructor
    this.init()
    super.render()
  }

  resize () {
    let width = window.innerWidth
    let height = window.innerHeight

    let three = this.three
    three.camera.aspect = width / height
    three.camera.updateProjectionMatrix()
    three.renderer.setSize(width, height)
  }

  init () {
    let three = this.three = {}
    let width = window.innerWidth
    let height = window.innerHeight

    this.layers = []

    three.renderer = new THREE.WebGLRenderer({
      // antialias: true,
      canvas: this.canvas
    })

    // comment out this line for non-retina
    three.renderer.setPixelRatio(devicePixelRatio)
    three.renderer.setSize(width, height)

    three.scene = new THREE.Scene()

    three.camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000)
    three.camera.position.z = 10
    three.scene.add(three.camera)

    three.light = new THREE.PointLight(0xffffff, 2, 0, 2)
    three.light.position.set(0, 0, 20)
    three.scene.add(three.light)

    // create layers
    for (let i = 0; i < 4; i++)
      this.layers.push(new Layer(three.scene, 2 + i / 2, this))
  }

  render () {
    // don't render if paused
    if (!super.render()) return

    let three = this.three
    let data = this.analyzer.getData()

    // data array is passed into update function
    for (let i = 0; i < this.layers.length; i++)
      this.layers[i].update(data[0].time)

    three.renderer.render(three.scene, three.camera)
  }
}

class Layer {
  constructor (scene, r, vis) {
    // need vis for tickm
    // this.vis = vis

    // create canvas for texture
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    // change texture size to improve perf
    this.ctx.fullscreen(2, 1024, 1024)
    this.ctx.fillStyle = '#fff'
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 1

    this.texture = new THREE.Texture(this.canvas)
    this.texture.premultiplyAlpha = true

    var material = new THREE.MeshLambertMaterial({
      map: this.texture,
      alphaTest: 0.1,
      blending: THREE.CustomBlending,
      transparent: true,
      side: THREE.DoubleSide,
      // wireframe: true
    })

    // geometry size also can affect perf
    this.geometry = new THREE.SphereGeometry(r, r * 16, r * 8)
    this.mesh = new THREE.Mesh(this.geometry, material)
    scene.add(this.mesh)

    // this.tickOffset = 1000 * Math.random()
    this.rotate = new THREE.Vector3(
      1 - 2 * Math.random(),
      1 - 2 * Math.random(),
      1 - 2 * Math.random()
    ).multiplyScalar(0.01)
  }

  update (data) {
    let ctx = this.ctx
    let canvas = this.canvas
    // let tick = this.vis.tick + this.tickOffset
    let l = Math.floor(data.length / 4)

    // ctx.clear()
    ctx.fillStyle = '#fff'
    ctx.fillRect(-canvas.w / 2, -canvas.h / 2, canvas.w, canvas.h)

    ctx.fillStyle = '#111'
    ctx.fillRect(-canvas.w / 2, -48, canvas.w, 96)

    ctx.beginPath()
    for (var i = 0; i <= 2 * l; i++) {
      let d = (data[Math.abs(i - l)] - 128) / 255
      ctx.lineTo(canvas.w * (i / (2 * l) - 0.5), 100 * d)
    }
    ctx.stroke()

    // crop to be a band
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillRect(-canvas.w / 2, -50, canvas.w, 100)
    ctx.globalCompositeOperation = 'source-over'

    this.texture.needsUpdate = true
    this.mesh.rotation.x += this.rotate.x
    this.mesh.rotation.y += this.rotate.y
    this.mesh.rotation.z += this.rotate.z
  }

  destroy () {
    // I think this will free up memory?
    // this is for hot reload fps drop
    delete this.layers
    delete this.three
    super.destroy()
  }
}
