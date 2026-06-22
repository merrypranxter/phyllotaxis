# Visual Targets

## Aesthetic Regimes

### sunflower_classic
- **Look:** Warm amber-gold florets on deep brown-black. Rich, botanical, painterly.
- **Feel:** Meditative. The spirals are unmistakably real — this is what a sunflower *is*.
- **Parameters:** 1,597 seeds (Fibonacci), angle exactly 137.507°, slow 5rpm rotation, brownish-gold palette.
- **Post:** Gentle vignette, very slight bloom, minimal chromatic ab.
- **Wow moment:** Zoom into the center — the counter-rotating spirals are perfectly interlocked.

### angle_sweep
- **Look:** Electric neon on black. Spirals reorganize in real-time as angle sweeps 133°→139.5°.
- **Feel:** Hypnotic, mathematical, almost alien.
- **Parameters:** 2,584 seeds, auto-sweep enabled, high bloom, high chroma shift.
- **Post:** Heavy bloom, strong chromatic aberration for electric feel.
- **Wow moment:** Watch the integer-spoke patterns (135°, 138.46°) snap into view and dissolve as the angle passes through.

### succulent_jewel
- **Look:** Deep teal-green iridescent scales arranged in a 3D cone. Wet and fleshy.
- **Feel:** Like looking into a perfectly formed succulent or artichoke heart.
- **Parameters:** 987 seeds, conical mode, large florets, slow rotation.
- **Post:** Chromatic aberration creates the iridescent effect; bloom adds bioluminescent glow.
- **Wow moment:** The overlapping scales at the cone tip pack with the same golden-angle logic as the 2D disc.

### fibonacci_sphere_swarm
- **Look:** Blue-white glowing points on a rotating sphere. Cool, cosmic, precise.
- **Feel:** Like a star cluster or evenly spaced satellite constellation.
- **Parameters:** 3,000 points, sphere mode, fast rotation, strong bloom.
- **Post:** Heavy bloom, minimal vignette, subtle chroma.
- **Wow moment:** Stop the rotation — every point is equidistant from its neighbors. The same golden angle that packs a sunflower distributes points on a sphere.

## Output Checklist

- [x] Engine 0: vogel-disk renders correctly (sunflower/angle_sweep)
- [x] Engine 1: fibonacci-sphere renders correctly (sphere swarm)
- [x] Engine 2: conical renders correctly (succulent)
- [x] Engine 3: parametric-angle renders correctly (auto-sweep)
- [x] Post-finisher: bloom, chromatic aberration, vignette
- [x] Parameters interactive: all sliders live-update
- [x] Regime switching applies palette + parameters
- [x] Fibonacci arm label updates as angle changes
