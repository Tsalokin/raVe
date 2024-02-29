precision lowp float;

uniform sampler2D canvas;
uniform vec2 resolution;
uniform float time;

void main () {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec2 c = resolution.xy / 2.0;
  vec2 d = (c - gl_FragCoord.xy) / resolution.xy;
  float dist = length(c - gl_FragCoord.xy) / resolution.x;

  p = p + d * cos(dist * 100. - time / 200.) / 20.;

  vec3 r = texture2D(canvas, p + vec2(dist / 100.)).rgb;
  vec3 b = texture2D(canvas, p - vec2(dist / 100.)).rgb;

  vec3 t = vec3(r.r, b.gb);

  gl_FragColor = vec4(t.rgb, 1.0);
}