import Visualizer from '../js/Visualizer'
import Utils from '../js/Utils'
import * as tf from '@tensorflow/tfjs-node'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
  constructor(options, settings) {
    super(options, settings)
    this.analyzer.setOptions(
      [
        {
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
      ]
    )

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({inputShape: [1024], units: 32, activation: 'relu'}),
        tf.layers.dense({units: 10, activation: 'softmax'}),
      ]
    });
  
    this.model.compile({
      optimizer: 'sgd',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.rotation = 1
    this.stars = (new Array(400)).fill(0).map(function () {
      return (new Array(3)).fill(0);
    });
    this.bassbuf = new Array(15).fill(0)
    this.vo = 0
    this.ctx = this.cv.getContext('2d')
    super.render()
  }

  render() {
    // don't render if paused
    if (!super.render()) return
    this.tick++;

    let PI = Math.PI
        ,fdata = this.analyzer.getData()[0].freq
        ,tdatab = this.analyzer.getData()[1].time

    
    
    function* data() {
      for (let i = 0; i < 100; i++) {
        // Generate one sample at a time.
        yield this.analyzer.getData()[0];
      }
     }
     
     function* labels() {
      for (let i = 0; i < 100; i++) {
        // Generate one sample at a time.
        yield tf.randomUniform([100]);
      }
     }
     
     const xs = tf.data.generator(data);
     const ys = tf.data.generator(labels);
     // We zip the data and labels together, shuffle and batch 32 samples at a time.
     const ds = tf.data.zip({xs, ys}).shuffle(100 /* bufferSize */).batch(32);
     
     // Train the model for 5 epochs.
     model.fitDataset(ds, {epochs: 1}).then(info => {
      console.log('Accuracy', info.history.acc);
     });

     super.audio.paused = True;

  };
}
