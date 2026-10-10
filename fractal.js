// ============================================================
// fractal.js —— 选做 E2：Mandelbrot / Julia 集交互探索器
// 用一个铺满屏幕的三角形 + 片元着色器逐像素迭代复数映射 z = z² + c，
// 支持缩放、平移，以及 3 套配色映射；按 j 切换 Mandelbrot / Julia。
// ============================================================

// ---- E2 着色器（GLSL 300 es）----
const fractalVS = `#version 300 es
in vec2 aPosition;            // 铺满屏幕的三角形顶点（裁剪空间坐标）
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fractalFS = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uResolution;   // 画布像素尺寸
uniform vec2  uCenter;       // 视野中心（复平面坐标）
uniform float uScale;        // 视野高度（复平面跨度）
uniform int   uIter;         // 最大迭代次数
uniform int   uJulia;        // 0=Mandelbrot, 1=Julia
uniform vec2  uJuliaC;       // Julia 集的参数 c
uniform int   uColorScheme;  // 配色方案 0/1/2

// 把归一化迭代次数 t 映射为颜色（三套平滑渐变配色）
vec3 palette(float t, int s) {
    if (s == 0) return 0.5 + 0.5 * cos(6.28318 * (vec3(0.00,0.10,0.20) * t + vec3(0.00,0.33,0.67)));
    if (s == 1) return 0.5 + 0.5 * cos(6.28318 * (vec3(0.10,0.00,0.20) * t + vec3(0.67,0.00,0.33)));
    return        0.5 + 0.5 * cos(6.28318 * (vec3(0.20,0.10,0.00) * t + vec3(0.00,0.33,0.67)));
}

void main() {
    // 像素坐标 -> 归一化 [-1,1]，再乘纵横比与视野，映射到复平面
    vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;
    vec2 p = uCenter + uv * uScale;

    vec2 z, c;
    if (uJulia == 1) { z = p;  c = uJuliaC; }  // Julia：z 随像素，c 固定
    else             { z = vec2(0.0); c = p; } // Mandelbrot：z0=0，c 随像素

    int i = 0;
    for (i = 0; i < uIter; i++) {
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        if (dot(z, z) > 4.0) break;           // 模长 > 2 判定逃逸
    }

    if (i == uIter) {                          // 未逃逸（集合内）-> 黑色
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // 平滑着色：对逃逸次数做对数平滑，再取配色
        float m = float(i) + 1.0 - log2(log2(length(z)));
        float t = m / float(uIter);
        fragColor = vec4(palette(t, uColorScheme), 1.0);
    }
}`;

// ---- E2 运行时（创建程序 / 缓冲，暴露 draw）----
function setupFractal(gl) {
    const prog = initShaders(gl, fractalVS, fractalFS);
    if (!prog) return null;

    const uResolution = gl.getUniformLocation(prog, "uResolution");
    const uCenter     = gl.getUniformLocation(prog, "uCenter");
    const uScale      = gl.getUniformLocation(prog, "uScale");
    const uIter       = gl.getUniformLocation(prog, "uIter");
    const uJulia      = gl.getUniformLocation(prog, "uJulia");
    const uJuliaC     = gl.getUniformLocation(prog, "uJuliaC");
    const uColorScheme= gl.getUniformLocation(prog, "uColorScheme");
    const aPosition   = gl.getAttribLocation(prog, "aPosition");

    // 一个铺满裁剪空间的三角形
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1, -1,   3, -1,   -1, 3]),
        gl.STATIC_DRAW);

    return {
        draw(state, width, height) {
            gl.useProgram(prog);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosition);

            gl.uniform2f(uResolution, width, height);
            gl.uniform2f(uCenter, state.fractCenter[0], state.fractCenter[1]);
            gl.uniform1f(uScale, state.fractScale);
            gl.uniform1i(uIter, state.fractIter);
            gl.uniform1i(uJulia, state.isJulia ? 1 : 0);
            gl.uniform2f(uJuliaC, state.juliaC[0], state.juliaC[1]);
            gl.uniform1i(uColorScheme, state.colorScheme);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    };
}
