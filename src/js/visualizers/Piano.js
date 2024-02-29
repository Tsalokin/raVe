//Piano wirtten by Michael Delay adapted by Nikolas Anctil

import Visualizer from '../Visualizer'
let { abs, cos, floor, max, min, sin, PI } = Math

export default class extends Visualizer {
	constructor(options, settings) {
		super(options, settings)
		this.analyzer.setOptions([{
		fftSize: 16384,
		smoothingTimeConstant: 0.75,
		minDecibels: -90,
		maxDecibels: -10,
		dataType: 'byte',
		dataSet: 'both'
		}])

		this.ctx = this.canvas.getContext('2d')
		this.times = [0,0,0,0,0]
		this.numharmonics = 1
		super.render()
	}

	

	updateHarmonics( value ) { 
		params.harmonics = value; 
	}

	

	render() {
		let t0 = performance.now();
		// don't render if paused
		if (!super.render()) return

		let params = {
			bscale: 700,
			harmonics: 2000.0,
			samplerate: 16384.0, //not directly editable
			cutoffVolumeDiff: 21, //db
			bigness:150,
			startsz:7,
			aggro:0,
			particlethresh:30
		}

		let ctx = this.ctx
		, curranalyzer = this.analyzer.analyzers[0]
		, data = this.analyzer.getData()[0].freq
		, sperdoub = 3.0*(255.0/(curranalyzer.minDecibels-curranalyzer.maxDecibels))
		, overtones = [2,3,4,5]
		, undertones = [0.5,.33333,0.25,0.20]
		, freqchangeperbin = 22000.0/(curranalyzer.fftSize/2.0)
		, bufferLength = curranalyzer.frequencyBinCount
		, barWidth = (this.canvas.w / bufferLength) * 6
		, scores = []
		, scores2 = []
		, scores3 = []
		, pks = []
		, peaks = []
		, buflast = []
		, colorslast = []
		, currentmult = 0.75
		, particles = []
		, maxxx = 0
		, harmonicvals = []
		, harmonicvals2 = []
		, peakiness = []
		, tonelogs = []
		, diff = 0
		, ranges = []
		, x = 0
		
		

		this.debug = bufferLength

		function db2vol(db){
			return Math.pow(2,db/sperdoub);
		}
		ctx.clear()
		ctx.fillStyle = '#fff'
		for(let n = 0; n<bufferLength; n++){ //peak detection
			let targ = data[n];
			let ep = 0;
			let sp = 0;
			let bonus = 0;
			if(targ>20){
				let idxep = n;
				let idxsp = n;
				let total = 0;
				let prev = data[n];
				for(let i = n ; i<bufferLength ; i++){
					if(ep>3) break;
					let dati = data[i];
					if(dati>prev){
						bonus = targ-prev;
						break;
					}
					if(dati<targ-6){
						bonus = targ-dati;
						ep += 5;
					}else{
						ep += 1;
					}
					idxep = i;
					total += data[i];
				}
				let b1 = bonus;
				prev = data[n];
				for(let j=n ; j>0 ; j--){
					
					if(sp>3) break;
					let datj = data[j];
					if(datj>prev){
						bonus = targ-prev;
						break;
					}
					
					if(datj<targ-6){
						bonus = targ-datj;
						sp += 5;
					}else{
						sp += 1;
					}
					idxsp = j;
					total += data[j];
				}
				
				//for( i=idxsp; i<idxep+1;i++) total += data[i];
				let count = idxep-idxsp;
				let sinen = (total/count)/targ;
				if(count>=5 || ep+sp>=7){
					//this is a peak
					let peakdata = [
						n,
						targ,
						sinen,
						count,
						0,
						0,
						bonus+b1
					]
					peaks.push(peakdata);
				}
			}
		}//end peak detection
		let t1 = performance.now();
		let pklen = peaks.length;
		for( let x=0; x<undertones.length; x++){ tonelogs.push(Math.log(x+2)/Math.log(2)*sperdoub);}

		let t2 = performance.now();
		for( let i =0; i<pklen; i++){
			let eidx = 0.5+peaks[i][0];
			let magnitude = peaks[i][1];
			let spread = Math.round((Math.ceil(peaks[i][3]))/2.0);
			let mx = (eidx+spread);
			let mn = (eidx-spread);
			
			for( let x=0, xl = this.numharmonics; x<xl; x++){
				diff = tonelogs[x];
				ranges = [undertones[x]*mn,undertones[x]*mx];
				// let mag = db2vol(magnitude+diff);
				// for( let j=0; j<pklen; j++){
				// 	let pkloc = peaks[j][0]+0.5;
				// 	if( ranges[0] < pkloc && pkloc < ranges[1] ){//could be the same tone
				// 		if(i!=j && peaks[j][1]>magnitude+sperdoub && peaks[j][1]>(magnitude+diff)){//this sounds just like a harmonic
				// 			let tmp = mag/db2vol(peaks[j][1]);
				// 			peaks[j][5] += tmp;
				// 			peaks[i][4] += 1/tmp;
				// 			peaks[i][5] -= tmp;
				// 			peaks[j][4] -= 1/tmp;
				// 		}
				// 	}
				// }
				//overtones
				ranges = [overtones[x]*mn,overtones[x]*mx];
				let mag = db2vol(magnitude);
				for( let j=0; j<pklen; j++){
					let pkloc = peaks[j][0]+0.5;
					if( ranges[0] < pkloc && pkloc < ranges[1] ){//could be the same tone TODO pkloc may want to be different for the two logic statements here
						if(i!=j && magnitude>peaks[j][1]+sperdoub && magnitude>(peaks[j][1]+diff)){//large enough its not noise
							let tmp = db2vol(peaks[j][1]+diff)/mag;
							peaks[i][5] += tmp;
							peaks[j][4] += 1/tmp;
							peaks[j][5] -= tmp;
							peaks[i][4] -= 1/tmp;
							
						}
					}
				}
			}
			
			let tttt = db2vol(peaks[i][1]);
			scores2.push((peaks[i][5]/tttt)/10000000.0);//scales non-harmonics output threshhold
			scores.push(Math.sqrt(peaks[i][4]/tttt*0.01));
			pks.push(peaks[i][0]);
			scores3.push(peaks[i][6]);
		}	

		let t3 = performance.now();

		//max value detection
		for (let i = 0; i < bufferLength; i++) {
			if (data[i]>maxxx){maxxx = data[i];}
			harmonicvals[i]=0;
			harmonicvals2[i]=0;
			peakiness[i]=0;
		}

		let tot2 = 0;
		let precompute = maxxx-params.cutoffVolumeDiff*(255.0/(curranalyzer.maxDecibels-curranalyzer.minDecibels));//efficiency
		let totalharms = 0;
		for(let j=0; j<pklen; j++){
			harmonicvals[pks[j]] = scores[j];
			harmonicvals2[pks[j]] = scores2[j];
			peakiness[pks[j]] = scores3[j];
			if(scores2[j]>0) totalharms++;
			if(data[pks[j]]>precompute){tot2+= scores2[j];}
		}
		if(buflast.length==0){
			for(let i = 0; i < bufferLength/2; i++){
				buflast[i] = data[i];
				colorslast[i] = [0,0,0];
				particles.push([]);
			}
		}
		
		let t4 = performance.now();

		//draw
		for (let i = 0; i < bufferLength/2; i++) {
			let barHeight = data[i];

			let r = 0;
			let g = 0;
			let b = barHeight/4.0;
			if(barHeight>maxxx-params.cutoffVolumeDiff*(255.0/(curranalyzer.maxDecibels-curranalyzer.minDecibels))){
				if(harmonicvals2[i]*2>255){
					g += Math.min(((harmonicvals2[i]*2-255)),128);
				}
				if(harmonicvals2[i]*2>0){
					r += (harmonicvals2[i]*2);
				}
				if(peakiness[i]>40){
					g *= peakiness[i]/40.0;
					r *= peakiness[i]/40.0;
					b *= peakiness[i]/40.0;
				}
			}
			if(harmonicvals[i]>0){
				b += (harmonicvals[i]*20);
			}
			let difr = (data[i]-buflast[i]);
			b += difr/50.0;
			g *= Math.pow(2,difr/50.0);
			r *= Math.pow(2,difr/50.0);
			b *= Math.pow(2,difr/50.0);

			b = Math.min(b,255);
			b /= Math.sqrt(Math.max((tot2)/params.harmonics,0.5))
			
			let topcoord = params.bscale*((barHeight+(data[i]-buflast[i])*params.aggro)/255.0);
			
			let bw = (barWidth/(i/(params.bigness/100)+params.startsz))*params.bigness;

			if(difr>params.particlethresh){
				particles[i].push([topcoord+difr, difr, "rgba(" + r + "," + g + "," + b + ",", Math.abs(difr)+10,0])
			}else if(r-colorslast[i][0]+g-colorslast[i][1]+b-colorslast[i][2]>params.particlethresh*9){
				particles[i].push([topcoord+bw, bw, "rgba(" + r + "," + g + "," + b + ",", 10,0])
			}
			for(let j =0;j<particles[i].length;j++){
				let part = particles[i][j];
				particles[i][j][0] += particles[i][j][3]; //track distance
				particles[i][j][4] += particles[i][j][3]; //track distance
				particles[i][j][5] -= 0.02; //track distance
				if(particles[i][j][4]>params.fadedist){particles[i].splice(j,1);} //remove particle
				else if(particles[i][j][5]<=0){particles[i].splice(j,1);} //remove particle
				else{
					ctx.fillStyle = particles[i][j][2]+((500-particles[i][j][4])/500.0)+")";
					ctx.fillRect(Math.round(x) - this.canvas.width/2, -particles[i][j][0]+this.canvas.height/2, Math.round(bw*0.9),  particles[i][j][1]);
				}
			}

			ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			ctx.fillRect(Math.round(x) - this.canvas.width/2, -topcoord+this.canvas.height/2, Math.round(bw*0.9),  topcoord);
			
			//(barWidth/(i+10))*200
			buflast[i] = data[i];
			colorslast[i] = [r,g,b];
			x += bw
			

		}
		let t5 = performance.now();
		
		//currentmult += Math.max(Math.min((tot2-params.harmonics)/params.harmonics,0.01),-0.01);
		//currentmult = Math.max(Math.min(currentmult,0.95),0.00);
		//params.windowRollFactor = currentmult;
		//params.cutoffVolumeDiff *= Math.max(Math.min(params.harmonics/tot2,1.01),0.99);
		//params.cutoffVolumeDiff = Math.max(Math.min(params.cutoffVolumeDiff,30),12);
		//console.log(params.cutoffVolumeDiff,tot2);

		this.times[0] *= 0.99;
		this.times[1] *= 0.99;
		this.times[2] *= 0.99;
		this.times[3] *= 0.99;
		this.times[4] *= 0.99;
		//console.log(0.01*(t1-t0),0.01*(t2-t1),0.01*(t3-t2))
		this.times[0] += 0.01*(t1-t0);
		this.times[1] += 0.01*(t2-t1);
		this.times[2] += 0.01*(t3-t2);
		this.times[3] += 0.01*(t4-t3);
		this.times[4] += 0.01*(t5-t4);

		let residual = (16.66-(this.times[0]+this.times[1]+this.times[3]+this.times[4]));
		
		let timefraction = this.times[2]/residual;

		if(timefraction>1) this.numharmonics = Math.max(Math.min(this.numharmonics-1,3),1);
		else if(this.times[2]*((this.numharmonics+1)/this.numharmonics)/residual<0.9) this.numharmonics = Math.max(Math.min(this.numharmonics+1,3),1);
		
		// console.log(this.times)	
		// console.log(this.numharmonics,pklen,residual,Math.round(this.times[2]*1000));
 	}
}