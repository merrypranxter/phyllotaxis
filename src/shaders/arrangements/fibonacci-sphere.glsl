// fibonacci-sphere.glsl — even distribution of N points on a unit sphere
// via golden angle. Projects orthographically to 2D for display.
//
// Usage: branched from floret.vert via u_mode == 1
//
// Formula (Fibonacci sphere):
//   theta_i = arccos(1 - 2*(i+0.5)/N)
//   phi_i   = i * golden_angle (radians)
//   (x,y,z) = (sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta))
// Orthographic: project XZ plane for a "top view" swarm.

vec2 fibSphere(float n, float total, float angle_deg, float radius_scale, float time) {
    float theta = acos(1.0 - 2.0*(n+0.5)/total);
    float phi   = n * angle_deg * 3.14159265 / 180.0 + time * 0.18;
    return vec2(sin(theta)*cos(phi), cos(theta)) * radius_scale * 0.88;
}
