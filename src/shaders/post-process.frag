#version 300 es
// post-process.frag — bloom, chromatic aberration, vignette, gamma
precision highp float;

in  vec2      vUv;
uniform sampler2D u_tex;
uniform float u_bloom;
uniform float u_chromatic;
uniform float u_vignette;

out vec4 fragColor;

vec3 chromaticAberration(sampler2D tex, vec2 uv, float strength) {
    vec2 dir = (uv - 0.5) * strength * 0.018;
    float r  = texture(tex, uv + dir        ).r;
    float g  = texture(tex, uv              ).g;
    float b  = texture(tex, uv - dir        ).b;
    return vec3(r, g, b);
}

vec3 bloom(sampler2D tex, vec2 uv, float strength) {
    if (strength < 0.01) return texture(tex, uv).rgb;
    vec2 ts   = 1.0 / vec2(textureSize(tex, 0));
    vec3 base = texture(tex, uv).rgb;
    vec3 acc  = vec3(0);
    // 5x5 box, accumulate only bright regions
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec3 s = texture(tex, uv + vec2(float(x), float(y)) * ts * 3.5).rgb;
            acc   += max(s - 0.4, vec3(0));
        }
    }
    acc /= 25.0;
    return base + acc * strength * 4.0;
}

void main() {
    vec3 col = chromaticAberration(u_tex, vUv, u_chromatic);
    col      = mix(col, bloom(u_tex, vUv, u_bloom), 0.6);

    // Vignette
    float dist = length(vUv - 0.5);
    col       *= 1.0 - pow(dist * 1.35, 2.2) * u_vignette;

    // Subtle scanlines for texture
    // float line = sin(vUv.y * float(textureSize(u_tex,0).y) * 3.14) * 0.015;
    // col -= line;

    // Gamma correction
    col = pow(max(col, vec3(0)), vec3(1.0 / 1.15));
    fragColor = vec4(col, 1.0);
}
