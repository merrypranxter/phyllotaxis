# Phyllotaxis

A WebGL2 creative coding project exploring **phyllotaxis** — the spiral packing of seeds, scales, and florets governed by the golden angle **137.507°**.

> *137.507° — the number that makes the spirals count themselves.*

Vogel's model places point n at angle `n × 137.5°` and radius `c√n`. The Fibonacci numbers fall out of the visible spiral arms (parastichies) automatically — no code tells them to, they emerge from the irrational geometry.

## What Is Phyllotaxis?

The arrangement of repeated units (seeds, leaves, florets) on a plant. The golden angle ≈ 137.507° produces the densest possible packing. Detune the angle by even 0.5° and the spiral arms dissolve into radial spokes — the **angle sweep** regime makes this viscerally visible.

**Distinct from `botanical_illustration`:** this is the math of arrangement, not plant rendering.

## Running

```bash
# Serve over HTTP (required for ES modules)
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Project Structure

```
src/
  js/
    main.js           — WebGL2 setup, render loop, parameter UI
    color-maps.js     — 256px DataTexture ramps + regime presets
    source.js         — optional image/webcam source texture
  shaders/
    floret.vert       — instance n → position from golden angle formula
    floret.frag       — palette ramp color + inner glow
    post-process.frag — bloom, chromatic aberration, vignette, gamma
    arrangements/
      vogel-disk.glsl        — θ = n·137.507°, r = c√n
      fibonacci-sphere.glsl  — even sphere distribution
      conical.glsl           — pinecone / cylindrical
      parametric-angle.glsl  — sweepable divergence (interactive heart)
docs/
    math-reference.md  — equations, Fibonacci table, references
    visual-targets.md  — aesthetic regime descriptions
```

## Aesthetic Regimes

| Regime | Mode | Look |
|--------|------|------|
| **sunflower_classic** | disk | Warm amber-gold, 1597 seeds, botanical |
| **angle_sweep** | parametric | Neon, live sweep 133°→139.5°, spirals reorganize |
| **succulent_jewel** | conical | Teal iridescent scales, 3D cone |
| **fibonacci_sphere_swarm** | sphere | Blue-white glowing points, rotating |

## The Math

The golden angle `α = 360°(1 − 1/φ²) ≈ 137.508°` is maximally irrational — the hardest number for any rational fraction to approximate. This is exactly why it produces uniform packing: it avoids every periodic clustering.

At N = 1597 seeds (a Fibonacci number) you see **34 and 55** counter-rotating spiral arms. Those are consecutive Fibonacci numbers, always.

See [`docs/math-reference.md`](docs/math-reference.md) for the full equation set.

## Ecosystem

- **Cousin:** `botanical_illustration` (plant rendering, not arrangement math)
- **Pairs with:** `sacred_geometry` (golden ratio), `fractals`, `structural_color` (iridescence)
