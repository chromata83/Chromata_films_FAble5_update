/* ============================================================
   CHROMATA FILMS — noise-threshold dissolve shader
   Day dissolves into night like ink in water: a perlin-noise
   mask driven by scroll progress (smoothstep threshold), used
   by the metamorphosis section. Raw WebGL — no dependencies.
   Exposes: ChromataDissolve.init(canvas, srcA, srcB) -> setProgress(p)
   ============================================================ */
window.ChromataDissolve = (() => {
  const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress;
uniform vec2 uPlane;   // canvas size
uniform vec2 uSizeA;   // texture A natural size
uniform vec2 uSizeB;   // texture B natural size

/* classic 2D value-noise w/ smooth interpolation */
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
  return v;
}

/* cover-fit UVs */
vec2 coverUv(vec2 uv, vec2 plane, vec2 tex) {
  float pr = plane.x / plane.y, tr = tex.x / tex.y;
  vec2 s = (pr > tr) ? vec2(1.0, tr / pr) : vec2(pr / tr, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec4 colA = texture2D(uTexA, coverUv(vUv, uPlane, uSizeA));
  vec4 colB = texture2D(uTexB, coverUv(vUv, uPlane, uSizeB));
  float n = fbm(vUv * 4.0);
  float t = smoothstep(uProgress - 0.18, uProgress + 0.18, n);
  /* gold ink bleed at the dissolve edge */
  float edge = smoothstep(uProgress - 0.2, uProgress, n) - smoothstep(uProgress, uProgress + 0.2, n);
  vec3 col = mix(colB.rgb, colA.rgb, t);
  col += vec3(0.90, 0.72, 0.28) * edge * 0.22;
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("ChromataDissolve shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function init(canvas, srcA, srcB) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return null;

    const prog = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uProgress = gl.getUniformLocation(prog, "uProgress");
    const uPlane = gl.getUniformLocation(prog, "uPlane");
    const uSizeA = gl.getUniformLocation(prog, "uSizeA");
    const uSizeB = gl.getUniformLocation(prog, "uSizeB");

    const mkTex = (unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([32, 28, 24, 255]));
      return t;
    };
    mkTex(0); mkTex(1);
    gl.uniform1i(gl.getUniformLocation(prog, "uTexA"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "uTexB"), 1);
    gl.uniform2f(uSizeA, 1, 1);
    gl.uniform2f(uSizeB, 1, 1);

    let progress = 0, dirty = true;

    const loadInto = (unit, src, sizeUniform) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform2f(sizeUniform, img.naturalWidth, img.naturalHeight);
        dirty = true;
      };
      img.src = src;
    };
    loadInto(0, srcA, uSizeA);
    loadInto(1, srcB, uSizeB);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uPlane, w, h);
        dirty = true;
      }
    };
    addEventListener("resize", resize);
    resize();

    const render = () => {
      if (dirty) {
        resize();
        gl.uniform1f(uProgress, progress);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        dirty = false;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return (p) => { progress = Math.min(Math.max(p, 0), 1); dirty = true; };
  }

  return { init };
})();
