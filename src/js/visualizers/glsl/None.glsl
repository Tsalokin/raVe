precision lowp float;

uniform sampler2D canvas;
uniform vec2 resolution;
uniform float time;

void main () {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(texture2D(canvas, p).rgb, 1.0);
}