# Math Reference

## Core Equations

### Vogel's Model (disk)
```
theta_n = n * alpha           where alpha = 137.507...deg (golden angle)
r_n     = c * sqrt(n)         c = spacing constant; sqrt(n) keeps density uniform
```
The golden angle is `alpha = 360 * (1 - 1/phi^2) = 360 * (2 - phi) = 137.50776...deg`  
where `phi = (1 + sqrt(5)) / 2` is the golden ratio.

### Why 137.507 is Special
The golden angle is maximally irrational — it cannot be well-approximated by any ratio p/q with small q. Every rational fraction of 360° creates periodic clusters (spokes). The golden angle avoids all of them, distributing points as uniformly as possible.

Farey approximants (rational angles that produce visible spokes):
| Angle | Fraction | Arms visible |
|-------|----------|--------------|
| 120°   | 1/3      | 3            |
| 135°   | 3/8      | 8            |
| 138.46°| 5/13     | 13           |
| 137.14°| 8/21     | 21           |
| 137.65°| 13/34    | 34           |
| 137.507°| golden  | Fibonacci    |

### Fibonacci Parastichies
At the golden angle, the number of visible clockwise and counter-clockwise spiral arms are always consecutive Fibonacci numbers: (1,1,2,3,5,8,13,21,34,55,89,144...)  
At N=1597 seeds (itself a Fibonacci number) you see **34 and 55** spiral families.

### Fibonacci Sphere
```
theta_i = arccos(1 - 2*(i+0.5)/N)
phi_i   = i * alpha_radians
(x,y,z) = (sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta))
```
This places N points evenly on a unit sphere; the same golden angle drives uniform coverage in 3D.

### Conical (Pinecone)
```
r(t) = t * scale             t = n/N, linear growth
y(t) = (t - 0.5) * h_scale  centered vertically
theta = n * alpha
```

## Shader Snippets

### Vogel Position (GLSL)
```glsl
float a = float(n) * 137.507 * PI / 180.0;
float r = sqrt(float(n) / float(N)) * radius_scale;
vec2  pos = vec2(cos(a), sin(a)) * r;
```

### Area-uniform density check
`r ∝ sqrt(n)` means the area of the disk per point is constant: each point "owns" the same annular area π*c².

## References
- Vogel, H. (1979). A better way to construct the sunflower head. *Mathematical Biosciences*, 44(3-4), 179-189.
- Prusinkiewicz, P. & Lindenmayer, A. (1990). *The Algorithmic Beauty of Plants*, ch. 4.
- Naylor, M. (2002). Golden, sqrt(2) and pi flowers: A spiral story. *Mathematics Magazine*, 75(3), 163-172.
