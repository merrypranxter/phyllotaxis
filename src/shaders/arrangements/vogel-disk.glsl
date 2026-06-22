// vogel-disk.glsl — the canonical sunflower arrangement
// theta = n * divergence_angle_deg (radians)
// r     = c * sqrt(n/N)   → keeps area-density uniform
//
// Usage: included / branched from floret.vert via u_mode == 0
//
// Math reference:
//   Vogel, H. (1979). A better way to construct the sunflower head.
//   Mathematical Biosciences, 44(3-4), 179-189.

vec2 vogelDisk(float n, float total, float angle_deg, float radius_scale) {
    float a = n * angle_deg * 3.14159265 / 180.0;
    float r = sqrt(n / total) * radius_scale;
    return vec2(cos(a), sin(a)) * r;
}

// Parastichy count: nearest Fibonacci numbers visible at golden angle.
// At N = 1597 seeds and angle 137.507° you get 34 and 55 spiral arms.
// Detune angle by > 0.5° and both families dissolve.
