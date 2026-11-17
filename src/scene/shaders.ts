export const vertexShader = `
attribute vec3 aGlyph;
attribute vec3 aTraits;
uniform float uTime;
uniform float uMorph;
uniform float uBurst;
uniform float uArrival;
uniform float uDpr;
uniform float uDensity;
uniform vec3 uPointer;
varying vec3 vColor;
varying float vOpacity;

void main() {
  float kind = aTraits.x;
  float seed = aTraits.y;
  float phase = aTraits.z;
  float ribbon = step(0.67, kind) * (1.0 - step(0.94, kind));
  float satellite = step(0.94, kind);
  float sway = sin(position.y * 4.5 + position.z * 3.5 + uTime * 0.86);
  vec3 fine = vec3(
    sway,
    sin(position.x * 5.0 - position.z * 3.0 + uTime * 0.7),
    cos(position.y * 4.0 + position.x * 4.0 - uTime * 0.8)
  );
  vec3 body = position * (1.0 + 0.026 * sin(uTime * 1.25)) + fine * (0.038 + satellite * 0.045);
  vec4 viewBody = modelViewMatrix * vec4(body, 1.0);
  vec4 viewGlyph = viewMatrix * vec4(aGlyph, 1.0);
  vec4 point = mix(viewBody, viewGlyph, uMorph);
  float outward = uBurst * (0.24 + seed * seed * 1.35);
  point.xyz += normalize(body + vec3(0.001)) * outward;
  point.xy += vec2(cos(phase * 19.0), sin(phase * 19.0)) * (1.0 - uArrival) * (0.3 + 2.3 * seed);

  vec2 delta = point.xy - uPointer.xy;
  float field = exp(-dot(delta, delta) * 5.3) * uPointer.z;
  vec2 tangent = vec2(-delta.y, delta.x);
  point.xy += (delta * 0.52 + tangent * 0.43) * field;
  point.z += field * (0.08 + 0.25 * seed);

  float front = smoothstep(-1.5, 1.35, viewBody.z + 5.8);
  float vein = smoothstep(0.50, 0.96, sin(position.z * 8.0 + position.x * 7.0 - position.y * 6.0));
  vec3 mineral = mix(vec3(0.25, 0.42, 0.71), vec3(0.82, 0.91, 1.0), front * 0.72 + phase * 0.26);
  vec3 coral = mix(vec3(0.74, 0.24, 0.35), vec3(1.0, 0.67, 0.62), front * 0.68 + seed * 0.31);
  vColor = mix(mineral, coral, max(ribbon * (0.67 + phase * 0.33), vein * 0.38));
  vColor = mix(vColor, vec3(0.82, 0.91, 1.0), uMorph * 0.56 + field * 0.16);
  vOpacity = (0.25 + front * 0.57 + seed * 0.18) * mix(1.0, 0.62, satellite) * (0.80 + ribbon * 0.28) * mix(0.23, 1.0, uArrival);
  vOpacity *= 0.90 + 0.10 * sin(uTime * 1.7 + phase * 34.0);
  gl_Position = projectionMatrix * point;
  float spark = pow(seed, 16.0) * 2.4;
  gl_PointSize = uDpr * uDensity * (1.05 + seed * 0.69 + spark) * clamp(5.8 / -point.z, 0.65, 1.7);
}
`

export const fragmentShader = `
varying vec3 vColor;
varying float vOpacity;

void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  if (r > 1.0) discard;
  float core = 1.0 - smoothstep(0.12, 0.94, r);
  gl_FragColor = vec4(vColor, vOpacity * core);
}
`
