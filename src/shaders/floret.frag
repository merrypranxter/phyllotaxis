#version 300 es
// floret.frag — color a floret disc by palette ramp + subtle inner glow
precision highp float;

in float v_t;
in float v_angle;
in float v_radius;
in float v_alpha;

uniform sampler2D u_palette;
uniform float     u_time;

out vec4 fragColor;

void main() {
    if (v_alpha < 0.5) discard;

    // Disc clip
    vec2  c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    float edge = 1.0 - smoothstep(0.55, 1.0, d);

    // Sample palette by t + slow time drift
    float drift = sin(u_time * 0.25 + v_angle * 0.0008) * 0.06;
    vec3  col   = texture(u_palette, vec2(clamp(v_t + drift, 0.0, 1.0), 0.5)).rgb;

    // Brightness gradient: brighter at center
    float brightness = mix(1.3, 0.65, v_t);
    col *= brightness;

    // Small inner glow near center
    float glow = max(0.0, 1.0 - v_radius * 2.8);
    col += col * glow * 0.5;

    // Edge softness + fade out toward edge of disc
    float alpha = edge * mix(0.95, 0.35, v_t * 0.8);
    fragColor   = vec4(col, alpha);
}
