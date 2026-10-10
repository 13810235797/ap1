// ============================================================
// main.js —— WebGL 初始化、全局状态、渲染与动画主循环
// 几何 / 交互 / UI 分别放在 geometry.js / interaction.js / ui.js
// ============================================================
const canvas = document.getElementById('webgl');
const gl = canvas.getContext('webgl2');
if (!gl) {
    alert('浏览器不支持 WebGL2！请使用最新版 Chrome / Edge / Firefox。');
    throw new Error('WebGL2 not supported');
}

// ---- 编译链接着色器（2D 分形主程序）----
const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

const uModelMatrixLoc = gl.getUniformLocation(program, 'uModelMatrix');
const uPointSizeLoc   = gl.getUniformLocation(program, 'uPointSize');
const aPositionLoc    = gl.getAttribLocation(program, 'aPosition');
const aColorLoc       = gl.getAttribLocation(program, 'aColor');

// ---- 全局状态（集中管理，避免散落的全局变量）----
const state = {
    renderMode: 0,        // 0 POINTS(混沌游戏) / 1 LINES(细分线框) / 2 TRIANGLES(细分实体)
    chaosPointCount: 8000,// 混沌游戏目标点数（>=5000）
    subdivDepth: 4,       // 递归细分深度 0~6
    pointSize: 2.0,       // 点大小
    colorScheme: 0,       // 配色 0/1/2
    nSides: 3,            // E1：混沌游戏多边形边数 3~6

    // 2D 视图变换（鼠标平移 / 缩放）
    translate: [0, 0],
    scale: 1.0,

    // 动画：逐点生长
    isAnimating: true,
    animCount: 0,

    // E2：Mandelbrot / Julia 探索器
    fractalMode: false,
    isJulia: false,
    juliaC: [-0.7, 0.27015],   // 经典 Julia 参数
    fractIter: 180,            // 迭代次数
    fractCenter: [-0.5, 0],    // 复平面视野中心
    fractScale: 3.5            // 复平面视野高度
};

// ---- 顶点缓冲 ----
const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

// ---- E2 探索器 ----
let fractal = null;
try { fractal = setupFractal(gl); } catch (e) { console.warn('E2 fractal init failed:', e); }

// ============================================================
// 渲染：根据当前模式分发到 2D 分形 或 E2 探索器
// ============================================================
function render() {
    const w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (state.fractalMode && fractal) {   // E2 全屏分形
        fractal.draw(state, w, h);
        return;
    }

    // ---- 2D 分形主程序 ----
    gl.useProgram(program);
    const colors = colorSchemes[state.colorScheme];

    let vertexData, colorData;
    if (state.renderMode === 0) {
        // 点云：混沌游戏（逐点生长，使用 animCount）
        vertexData = chaosGame(state.nSides, state.animCount);
        colorData = [];
        for (let i = 0; i < vertexData.length / 2; i++) {
            colorData.push(...colors[i % 3]);
        }
    } else {
        // 线框 / 实体：递归细分（共用同一组三角形，几何数据不同）
        const built = buildSubdivision(state.subdivDepth, state.renderMode, state.colorScheme);
        vertexData = built.vertexData;
        colorData = built.colorData;
    }

    // 模型矩阵：先缩放再平移（列主序 mat3）
    const m = [
        state.scale, 0, 0,
        0, state.scale, 0,
        state.translate[0], state.translate[1], 1
    ];
    gl.uniformMatrix3fv(uModelMatrixLoc, false, new Float32Array(m));
    gl.uniform1f(uPointSizeLoc, state.pointSize);

    // 顶点缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    // 颜色缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColorLoc);

    const count = vertexData.length / 2;
    if (state.renderMode === 0)      gl.drawArrays(gl.POINTS, 0, count);
    else if (state.renderMode === 1) gl.drawArrays(gl.LINES, 0, count);
    else                             gl.drawArrays(gl.TRIANGLES, 0, count);
}

// ============================================================
// 动画主循环：点云"逐点生长"
// ============================================================
function animateLoop() {
    if (!state.fractalMode && state.isAnimating && state.renderMode === 0) {
        if (state.animCount < state.chaosPointCount) {
            state.animCount += 20;                       // 每帧新增 20 个点
            if (state.animCount > state.chaosPointCount) state.animCount = state.chaosPointCount;
            render();
        }
    }
    requestAnimationFrame(animateLoop);
}
