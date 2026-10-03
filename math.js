// math.js - Funções de álgebra matricial 4x4 (Column-Major)

export function mat4Identity() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

export function mat4Translation(tx, ty, tz) {
  return new Float32Array([
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1
  ]);
}

export function mat4RotationZ(rad) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new Float32Array([
    c,  s,  0, 0,
    -s, c,  0, 0,
    0,  0,  1, 0,
    0,  0,  0, 1
  ]);
}

export function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row + k * 4] * b[k + col * 4];
      }
      out[row + col * 4] = sum;
    }
  }
  return out;
}

export function mat4Ortho(left, right, bottom, top, near, far) {
  const rl = right - left;
  const tb = top - bottom;
  const fn = far - near;
  return new Float32Array([
    2 / rl,               0,                    0,          0,
    0,                    2 / tb,               0,          0,
    0,                    0,                    1 / fn,     0,
    -(right + left) / rl, -(top + bottom) / tb, -near / fn,   1
  ]);
}

export function mat4LookAt(eyeY) {
  return mat4Translation(0, -eyeY, 0);
}