// parametric-angle.glsl — sweepable divergence angle
// Identical to vogel-disk but the angle is a runtime uniform.
// Sweep 130° → 145° to show why 137.507° is special:
//   - At most rational fractions of 360° you get radial spokes / gaps.
//   - Only the irrational golden angle produces maximally dense, gap-free packing.
//
// This is the interactive heart of the piece.

vec2 parametricAngle(float n, float total, float angle_deg, float radius_scale) {
    float a = n * angle_deg * 3.14159265 / 180.0;
    float r = sqrt(n / total) * radius_scale;
    return vec2(cos(a), sin(a)) * r;
}

// Live sweep: animate u_divergence_angle uniform from JS
// Fibonacci parastichies (spiral arm counts) jump at each
// Farey approximant: 137.14° (8/7), 135° (3/8), 138.46° (5/13) etc.
