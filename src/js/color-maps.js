// color-maps.js — palette ramps + regime presets for phyllotaxis

export const REGIMES = {
  sunflower_classic: {
    colors: ['#0a0800','#3d1f00','#8b4513','#cd8500','#ffd700','#fffacd'],
    point_count: 1597,
    divergence_angle: 137.507,
    radius_scale: 1.0,
    floret_size: 1.1,
    rotation_speed: 0.05,
    grow_speed: 0.0,
    bloom: 0.25,
    chromatic: 0.1,
    vignette: 0.5,
    mode: 0,  // disk
  },
  angle_sweep: {
    colors: ['#000000','#4400ff','#ff00cc','#00ffcc','#ffff00','#ffffff'],
    point_count: 2584,
    divergence_angle: 137.507,
    radius_scale: 1.0,
    floret_size: 0.7,
    rotation_speed: 0.0,
    grow_speed: 0.0,
    bloom: 0.5,
    chromatic: 0.4,
    vignette: 0.35,
    mode: 3,  // parametric (sweep mode)
    sweep: true,
  },
  succulent_jewel: {
    colors: ['#000a08','#003320','#006644','#00cc88','#88ffcc','#e0fff5'],
    point_count: 987,
    divergence_angle: 137.507,
    radius_scale: 1.2,
    floret_size: 2.2,
    rotation_speed: 0.12,
    grow_speed: 0.0,
    bloom: 0.4,
    chromatic: 0.3,
    vignette: 0.6,
    mode: 2,  // conical
  },
  fibonacci_sphere_swarm: {
    colors: ['#000000','#001133','#0033aa','#0088ff','#88ccff','#ffffff'],
    point_count: 3000,
    divergence_angle: 137.507,
    radius_scale: 0.9,
    floret_size: 0.6,
    rotation_speed: 0.3,
    grow_speed: 0.0,
    bloom: 0.6,
    chromatic: 0.2,
    vignette: 0.3,
    mode: 1,  // sphere
  },
};

export function buildRamp(gl, hexColors) {
  const N = 256;
  const data = new Uint8Array(N * 4);
  const stops = hexColors.map(h => [
    parseInt(h.slice(1,3),16),
    parseInt(h.slice(3,5),16),
    parseInt(h.slice(5,7),16)
  ]);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const seg = t * (stops.length - 1);
    const lo = Math.floor(seg);
    const hi = Math.min(lo + 1, stops.length - 1);
    const f = seg - lo;
    data[i*4+0] = Math.round(stops[lo][0]*(1-f)+stops[hi][0]*f);
    data[i*4+1] = Math.round(stops[lo][1]*(1-f)+stops[hi][1]*f);
    data[i*4+2] = Math.round(stops[lo][2]*(1-f)+stops[hi][2]*f);
    data[i*4+3] = 255;
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}
