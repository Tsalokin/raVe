precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float bass;
uniform sampler2D canvas;

#define PI 3.1415926535897932384626433832795

void main () {
  vec3 rgb, rgbl, rgbr, col;
  vec2 p, c, k;
  float a, d, t, f, h, x;

  p = gl_FragCoord.xy;
  c = 0.5 * resolution;

  // PI/7
  t = PI * 0.1428571429;

  a = atan(p.y - c.y, p.x - c.x) + 0.5 * PI;
  f = mod(floor(a / t), 2.);
  a = mod(a, t);
  if (f == 0.) a = t - a;
  a -= 0.0002 * time;

  float n = 0.3 * resolution.y;
  d = distance(p, c);
  d -= 0.0001 * time * resolution.y;
  f = mod(floor(d / n), 2.);
  d = mod(d, n);
  if (f == 1.) d = n - d;
  d += 70.;

  a = -mod(a, 0.6666666666 * PI) + 0.3333333333 * PI;
  k = c + d * vec2(cos(a), sin(a));
  k /= resolution;
  // k.x *= resolution.x / resolution.y;

  // get color for separation
  h = 0.00003 * time;
  x = 1. - abs(mod(h, 2.) - 1.);
  h = floor(mod(h, 6.));

       if (h == 0.) col = vec3(1., x, 0.);
  else if (h == 1.) col = vec3(x, 1., 0.);
  else if (h == 2.) col = vec3(0., 1., x);
  else if (h == 3.) col = vec3(0., x, 1.);
  else if (h == 4.) col = vec3(x, 0., 1.);
  else if (h == 5.) col = vec3(1., 0., x);

  rgbl = texture2D(canvas, k - vec2(0.15 * bass, 0)).rgb;
  rgbr = texture2D(canvas, k + vec2(0.15 * bass, 0)).rgb;

  // rgb = texture2D(canvas, k).rgb;
  // rgb = texture2D(canvas, k - vec2(0.1 * bass, 0)).rgb * vec3(1.0, 0.5, 1.0);
  // rgb += texture2D(canvas, k + vec2(0.1 * bass, 0)).rgb * vec3(0.0, 0.5, 1.0);
  // rgb = texture2D(canvas, k - vec2(0.1 * bass, 0)).rgb * vec3(1.0, 0.5, 0.0);
  // rgb += texture2D(canvas, k + vec2(0.1 * bass, 0)).rgb * vec3(0.0, 0.5, 1.0);
  rgb = mix(rgbl, rgbr, col);
  gl_FragColor = vec4(rgb, 1.0);
}
