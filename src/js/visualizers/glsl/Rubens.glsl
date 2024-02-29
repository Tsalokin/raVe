precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D canvas;

#define PI 3.1415926535897932384626433832795

vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
    return c.z + c.y * (rgb - 0.5) * (1. - abs(2. * c.z - 1.));
}

void main () {
  vec3 rgb;
  vec2 p, c, k;

  p = gl_FragCoord.xy;
  c = 0.5 * resolution;

  float n = sqrt(0.5 * resolution.y * resolution.y);
  float t = 0.25 * PI;//-time * 0.0001;

  vec2 p1 = c + vec2(n * cos(t + 0.0 * PI), n * sin(t + 0.0 * PI));
  vec2 p2 = c + vec2(n * cos(t + 0.5 * PI), n * sin(t + 0.5 * PI));
  vec2 p3 = c + vec2(n * cos(t + 1.0 * PI), n * sin(t + 1.0 * PI));
  vec2 p4 = c + vec2(n * cos(t + 1.5 * PI), n * sin(t + 1.5 * PI));

  float v = 1. / (2.5 * resolution.y);

  float l = 0.;

  l += texture2D(canvas, vec2(v * distance(p, p1), 0)).r - 0.5;
  l += texture2D(canvas, vec2(v * distance(p, p2), 0)).r - 0.5;
  l += texture2D(canvas, vec2(v * distance(p, p3), 0)).r - 0.5;
  l += texture2D(canvas, vec2(v * distance(p, p4), 0)).r - 0.5;
  
  vec2 r = resolution;

  // current uncommented is outer ones reflected off left and right edge

  // edges
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(r.x, 0)), 0)).r - 0.5);
  l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(r.x, 0)), 0)).r - 0.5); //
  l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(r.x, 0)), 0)).r - 0.5); //
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(r.x, 0)), 0)).r - 0.5);

  l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 - vec2(r.x, 0)), 0)).r - 0.5); //
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 - vec2(r.x, 0)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 - vec2(r.x, 0)), 0)).r - 0.5);
  l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 - vec2(r.x, 0)), 0)).r - 0.5); //

  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(0, r.y)), 0)).r - 0.5); //
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(0, r.y)), 0)).r - 0.5); //
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(0, r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(0, r.y)), 0)).r - 0.5);

  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 - vec2(0, r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 - vec2(0, r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 - vec2(0, r.y)), 0)).r - 0.5); //
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 - vec2(0, r.y)), 0)).r - 0.5); //

  // corners
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(+r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(+r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(+r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(+r.x, +r.y)), 0)).r - 0.5);

  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(+r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(+r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(+r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(+r.x, -r.y)), 0)).r - 0.5);

  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(-r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(-r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(-r.x, +r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(-r.x, +r.y)), 0)).r - 0.5);

  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p1 + vec2(-r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p2 + vec2(-r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p3 + vec2(-r.x, -r.y)), 0)).r - 0.5);
  // l += 0.25 * (texture2D(canvas, vec2(v * distance(p, p4 + vec2(-r.x, -r.y)), 0)).r - 0.5);

  l *= 2.;

  // rgb = vec3(l * 10.);
  vec3 o = hsl2rgb(vec3(0.0833, 1., l));
  vec3 b = hsl2rgb(vec3(0.6111, 1., l));

  // rgb = o + b;
  rgb = l > 0.25 ? o : b;
  // rgb = vec3(l);
  
  // rgb = texture2D(canvas, p / resolution).rgb;
  gl_FragColor = vec4(rgb, 1.0);
}
