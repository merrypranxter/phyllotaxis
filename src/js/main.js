// main.js — phyllotaxis WebGL2 instanced renderer
import { buildRamp, REGIMES } from './color-maps.js';

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.insertBefore(canvas, document.body.firstChild);

const gl = canvas.getContext('webgl2');
if (!gl) { alert('WebGL2 required'); }
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);  // additive blend

// params
const params = {
  point_count: 1597,
  divergence_angle: 137.507,
  radius_scale: 1.0,
  floret_size: 1.0,
  rotation_speed: 0.05,
  grow_speed: 0.0,
  bloom: 0.3,
  chromatic: 0.2,
  vignette: 0.4,
  mode: 0,
  sweep: false,
  regime: 'sunflower_classic',
};

let paletteTex = null;
let growTimer = 0;
let sweepDir = 1;
let sweepAngle = 137.507;

// UI wiring
const sliders = ['divergence_angle','point_count','radius_scale','floret_size','rotation_speed','grow_speed','bloom','chromatic','vignette'];
const PREC = { divergence_angle:3, point_count:0, radius_scale:2, floret_size:2, rotation_speed:2, grow_speed:2, bloom:2, chromatic:2, vignette:2 };

sliders.forEach(id => {
  const el = document.getElementById(id);
  const val = document.getElementById('v-'+id);
  el.addEventListener('input', () => {
    const v = parseFloat(el.value);
    if (id === 'point_count') params.point_count = Math.round(v);
    else params[id] = v;
    val.textContent = v.toFixed(PREC[id]||2);
    if (id === 'divergence_angle') {
      sweepAngle = v;
      updateFibLabel(v);
    }
  });
});

function updateFibLabel(angle) {
  const fibLabel = document.getElementById('fib-label');
  const diff = Math.abs(angle - 137.507);
  if (diff < 0.05) {
    fibLabel.textContent = '✨ golden angle — Fibonacci arms visible';
  } else if (diff < 0.5) {
    fibLabel.textContent = 'near-golden — spirals forming';
  } else {
    fibLabel.textContent = 'detuned — ' + Math.round(angle) + '° (spirals disrupted)';
  }
}
updateFibLabel(137.507);

document.querySelectorAll('.regime-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.regime-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyRegime(btn.dataset.regime);
  });
});

function applyRegime(name) {
  const r = REGIMES[name];
  if (!r) return;
  Object.assign(params, r, { regime: name });
  sliders.forEach(id => {
    if (r[id] === undefined) return;
    const el = document.getElementById(id);
    const val = document.getElementById('v-'+id);
    el.value = r[id];
    val.textContent = parseFloat(r[id]).toFixed(PREC[id]||2);
  });
  sweepAngle = params.divergence_angle;
  updateFibLabel(sweepAngle);
  if (paletteTex) gl.deleteTexture(paletteTex);
  paletteTex = buildRamp(gl, r.colors);
}

// Shaders
const VS = `#version 300 es
precision highp float;

uniform float u_divergence_angle;  // degrees
uniform float u_radius_scale;
uniform float u_floret_size;
uniform float u_aspect;
uniform float u_time;
uniform float u_point_count;
uniform int   u_mode;  // 0=disk 1=sphere 2=cone 3=parametric
uniform float u_grow_n;  // only show points < grow_n

out float v_t;       // normalized index 0..1
out float v_angle;   // actual angle for color variation
out float v_radius;  // for size variation
out float v_alpha;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

vec2 vogelDisk(float n, float angle_deg) {
  float a = n * angle_deg * PI / 180.0;
  float r = sqrt(n / u_point_count) * u_radius_scale;
  return vec2(cos(a), sin(a)) * r;
}

vec2 fibSphere(float n) {
  // Even sphere distribution projected to 2D with rotation
  float theta = acos(1.0 - 2.0*(n+0.5)/u_point_count);
  float phi = n * 137.507 * PI / 180.0 + u_time * 0.2;
  // Orthographic project XY
  float x = sin(theta)*cos(phi);
  float y = cos(theta);
  return vec2(x, y) * u_radius_scale * 0.9;
}

vec2 conical(float n) {
  float t = n / u_point_count;
  float a = n * 137.507 * PI / 180.0;
  // Map to cone: radius grows from 0 at apex, height maps to Y
  float r = t * u_radius_scale * 0.9;
  float x = cos(a) * r;
  float y = sin(a) * r * 0.5 + (t - 0.5) * u_radius_scale * 0.7;
  return vec2(x, y);
}

vec2 parametricAngle(float n, float angle_deg) {
  return vogelDisk(n, angle_deg);
}

void main() {
  float n = float(gl_InstanceID);

  // Growth gating
  float visible = step(n, u_grow_n);

  vec2 pos;
  if (u_mode == 0) pos = vogelDisk(n, u_divergence_angle);
  else if (u_mode == 1) pos = fibSphere(n);
  else if (u_mode == 2) pos = conical(n);
  else pos = parametricAngle(n, u_divergence_angle);

  // Global rotation
  float rot = u_time * (137.507 * PI / 180.0) * 0.01;
  float c = cos(rot), s = sin(rot);
  pos = vec2(c*pos.x - s*pos.y, s*pos.x + c*pos.y);

  // Aspect correct
  pos.x /= u_aspect;

  float t = n / u_point_count;
  v_t = t;
  v_angle = n * u_divergence_angle;
  v_radius = sqrt(n / u_point_count);
  v_alpha = visible;

  // Size: base + growth from center outward
  float sz = u_floret_size * (0.003 + 0.004 * (1.0 - t) + 0.002 * t);
  gl_Position = vec4(pos, 0, 1);
  gl_PointSize = sz * 200.0 / (1.0 + v_radius * 0.5);
}`;

const FS = `#version 300 es
precision highp float;

in float v_t;
in float v_angle;
in float v_radius;
in float v_alpha;

uniform sampler2D u_palette;
uniform float u_time;

out vec4 fragColor;

void main() {
  if (v_alpha < 0.5) discard;

  // Disc shape
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c,c)*4.0;
  if (d > 1.0) discard;
  float edge = 1.0 - smoothstep(0.6, 1.0, d);

  // Color from ramp by normalized index + slow hue drift
  float drift = sin(u_time * 0.3 + v_angle * 0.001) * 0.05;
  vec3 col = texture(u_palette, vec2(v_t + drift, 0.5)).rgb;

  // Highlight center points, fade outer
  float brightness = mix(1.2, 0.7, v_t);
  col *= brightness;

  // Inner glow: very small points near center glow brighter
  float glow = max(0.0, 1.0 - v_radius * 2.5);
  col += glow * 0.4;

  float alpha = edge * mix(0.9, 0.4, v_t * 0.7);
  fragColor = vec4(col, alpha);
}`;

// Post-process shaders
const POST_VS = `#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() { vUv = a_position*0.5+0.5; gl_Position = vec4(a_position,0,1); }`;

const POST_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_tex;
uniform float u_bloom;
uniform float u_chromatic;
uniform float u_vignette;
out vec4 fragColor;

vec3 chromaShift(sampler2D tex, vec2 uv, float strength) {
  vec2 dir = (uv - 0.5) * strength * 0.015;
  float r = texture(tex, uv + dir).r;
  float g = texture(tex, uv).g;
  float b = texture(tex, uv - dir).b;
  return vec3(r,g,b);
}

vec3 bloom(sampler2D tex, vec2 uv, float strength) {
  if (strength < 0.01) return texture(tex, uv).rgb;
  vec3 acc = vec3(0);
  vec2 ts = 1.0 / vec2(textureSize(tex, 0));
  float[9] weights = float[](0.0625,0.125,0.0625,0.125,0.25,0.125,0.0625,0.125,0.0625);
  int k = 0;
  for (int x=-1;x<=1;x++) for (int y=-1;y<=1;y++) {
    vec3 s = texture(tex, uv + vec2(float(x),float(y))*ts*4.0).rgb;
    vec3 bright = max(s - 0.5, 0.0);
    acc += bright * weights[k++];
  }
  return texture(tex, uv).rgb + acc * strength * 3.0;
}

void main() {
  vec3 col = chromaShift(u_tex, vUv, u_chromatic);
  col = col * 0.5 + bloom(u_tex, vUv, u_bloom) * 0.5;
  col += bloom(u_tex, vUv, u_bloom) * 0.5;
  // Vignette
  float d = length(vUv - 0.5) * 1.4;
  col *= 1.0 - d * d * u_vignette;
  // Gamma
  col = pow(max(col, vec3(0)), vec3(0.88));
  fragColor = vec4(col, 1);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function link(gl, vsSrc, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
  }
  return p;
}

const floretProg = link(gl, VS, FS);
const postProg = link(gl, POST_VS, POST_FS);

// Offscreen FBO for post-processing
function makeFBO(gl, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fbo, tex, w, h };
}

let offscreen = makeFBO(gl, canvas.width, canvas.height);

// Quad for post
const quadBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

// Dummy VAO (instanced, no vertex buffer needed — position from instance ID in VS)
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.bindVertexArray(null);

paletteTex = buildRamp(gl, REGIMES['sunflower_classic'].colors);

let frameCount = 0, lastFPSTime = performance.now();
const fpsEl = document.getElementById('fps');

function u(prog, name) { return gl.getUniformLocation(prog, name); }

function render(now) {
  requestAnimationFrame(render);
  const t = now * 0.001;

  // Angle sweep
  if (params.sweep) {
    sweepAngle += sweepDir * 0.003;
    if (sweepAngle > 139.5) sweepDir = -1;
    if (sweepAngle < 133.0) sweepDir = 1;
    const el = document.getElementById('divergence_angle');
    el.value = sweepAngle;
    document.getElementById('v-divergence_angle').textContent = sweepAngle.toFixed(3);
    updateFibLabel(sweepAngle);
  }

  // Grow animation
  if (params.grow_speed > 0) {
    growTimer += params.grow_speed * 0.5;
    if (growTimer > params.point_count) growTimer = 0;
  }
  const growN = params.grow_speed > 0 ? growTimer : params.point_count;

  // FPS
  frameCount++;
  if (now - lastFPSTime > 1000) {
    fpsEl.textContent = frameCount + ' fps';
    frameCount = 0; lastFPSTime = now;
  }

  const W = canvas.width, H = canvas.height;
  const aspect = W / H;

  // --- Pass 1: render florets to offscreen FBO ---
  gl.bindFramebuffer(gl.FRAMEBUFFER, offscreen.fbo);
  gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(floretProg);
  gl.bindVertexArray(vao);

  gl.uniform1f(u(floretProg,'u_divergence_angle'), params.divergence_angle + (params.sweep ? sweepAngle - params.divergence_angle : 0));
  gl.uniform1f(u(floretProg,'u_radius_scale'), params.radius_scale);
  gl.uniform1f(u(floretProg,'u_floret_size'), params.floret_size);
  gl.uniform1f(u(floretProg,'u_aspect'), aspect);
  gl.uniform1f(u(floretProg,'u_time'), t + params.rotation_speed * t * 5.0);
  gl.uniform1f(u(floretProg,'u_point_count'), params.point_count);
  gl.uniform1i(u(floretProg,'u_mode'), params.mode);
  gl.uniform1f(u(floretProg,'u_grow_n'), growN);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, paletteTex);
  gl.uniform1i(u(floretProg,'u_palette'), 0);

  gl.drawArraysInstanced(gl.POINTS, 0, 1, params.point_count);

  // --- Pass 2: post-process to screen ---
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, W, H);
  gl.disable(gl.BLEND);

  gl.useProgram(postProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const posLoc = gl.getAttribLocation(postProg, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, offscreen.tex);
  gl.uniform1i(u(postProg,'u_tex'), 0);
  gl.uniform1f(u(postProg,'u_bloom'), params.bloom);
  gl.uniform1f(u(postProg,'u_chromatic'), params.chromatic);
  gl.uniform1f(u(postProg,'u_vignette'), params.vignette);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.enable(gl.BLEND);
}

requestAnimationFrame(render);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (offscreen.fbo) gl.deleteFramebuffer(offscreen.fbo);
  if (offscreen.tex) gl.deleteTexture(offscreen.tex);
  offscreen = makeFBO(gl, canvas.width, canvas.height);
});
