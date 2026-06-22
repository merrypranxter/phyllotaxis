#version 300 es
// floret.vert — Vogel disk instanced vertex shader
// Position driven entirely from gl_InstanceID via golden angle formula
// theta = n * divergence_angle, r = c * sqrt(n/N)
precision highp float;

uniform float u_divergence_angle;
uniform float u_radius_scale;
uniform float u_floret_size;
uniform float u_aspect;
uniform float u_time;
uniform float u_point_count;
uniform int   u_mode;   // 0=disk 1=sphere 2=cone 3=parametric
uniform float u_grow_n;

out float v_t;
out float v_angle;
out float v_radius;
out float v_alpha;

const float PI    = 3.14159265359;
const float GOLDEN = 137.50776405003;

vec2 vogelDisk(float n, float angle_deg) {
    float a = n * angle_deg * PI / 180.0;
    float r = sqrt(n / u_point_count) * u_radius_scale;
    return vec2(cos(a), sin(a)) * r;
}

vec2 fibSphere(float n) {
    float theta = acos(1.0 - 2.0*(n+0.5)/u_point_count);
    float phi   = n * GOLDEN * PI / 180.0 + u_time * 0.18;
    return vec2(sin(theta)*cos(phi), cos(theta)) * u_radius_scale * 0.88;
}

vec2 conical(float n) {
    float t = n / u_point_count;
    float a = n * GOLDEN * PI / 180.0;
    float r = t * u_radius_scale * 0.85;
    return vec2(cos(a)*r, sin(a)*r*0.45 + (t-0.5)*u_radius_scale*0.72);
}

vec2 parametric(float n, float angle_deg) {
    return vogelDisk(n, angle_deg);
}

void main() {
    float n       = float(gl_InstanceID);
    float visible = step(n, u_grow_n);

    vec2 pos;
    if      (u_mode == 0) pos = vogelDisk(n, u_divergence_angle);
    else if (u_mode == 1) pos = fibSphere(n);
    else if (u_mode == 2) pos = conical(n);
    else                  pos = parametric(n, u_divergence_angle);

    // Global slow rotation
    float rot = u_time * 0.008;
    float cs = cos(rot), sn = sin(rot);
    pos = vec2(cs*pos.x - sn*pos.y, sn*pos.x + cs*pos.y);

    pos.x /= u_aspect;

    float t   = n / u_point_count;
    v_t       = t;
    v_angle   = n * u_divergence_angle;
    v_radius  = sqrt(n / u_point_count);
    v_alpha   = visible;

    // Point size: large at center, smaller toward edge, scaled by u_floret_size
    float ptsz = u_floret_size * (4.0 + 8.0*(1.0 - t));
    gl_Position  = vec4(pos, 0.0, 1.0);
    gl_PointSize = clamp(ptsz, 1.0, 64.0);
}
