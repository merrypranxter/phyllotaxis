// conical.glsl — cylindrical / pinecone phyllotaxis
// Same golden angle but the height (Y) is parametric in t = n/N.
// r    = t * scale           (grows linearly with index)
// y    = (t - 0.5) * h_scale (centred in frame)
// This mimics how scales on a pinecone or seeds on an ear of corn are placed.

vec2 conical(float n, float total, float angle_deg, float radius_scale) {
    float t  = n / total;
    float a  = n * angle_deg * 3.14159265 / 180.0;
    float r  = t * radius_scale * 0.85;
    float x  = cos(a) * r;
    float y  = sin(a) * r * 0.45 + (t - 0.5) * radius_scale * 0.72;
    return vec2(x, y);
}
