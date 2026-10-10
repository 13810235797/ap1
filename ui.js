// ============================================================
// ui.js —— 控制面板回调、滑块绑定与页面初始化
// ============================================================

// 渲染模式切换（点云 / 线框 / 实体）
function setMode(m) {
    state.renderMode = m;
    if (m === 0) state.animCount = 0;      // 切回点云时重新开始逐点生长
    updateModeTip();
    render();
}

// 更新模式提示与多边形滑块的可用状态
function updateModeTip() {
    const tip = document.getElementById('modeTip');
    const nSlider = document.getElementById('nSlider');
    if (state.fractalMode) {
        tip.innerText = state.isJulia ? 'E2 · Julia 集（j 切换，m 退出）' : 'E2 · Mandelbrot 集（j 切换，m 退出）';
        nSlider.disabled = true; nSlider.style.opacity = '0.4';
        return;
    }
    if (state.renderMode === 0) {
        tip.innerText = '当前：混沌游戏点云，可切换多边形边数 3~6';
        nSlider.disabled = false; nSlider.style.opacity = '1';
    } else if (state.renderMode === 1) {
        tip.innerText = '当前：递归细分线框，只受递归深度控制';
        nSlider.disabled = true; nSlider.style.opacity = '0.4';
    } else {
        tip.innerText = '当前：递归细分实体，只受递归深度控制';
        nSlider.disabled = true; nSlider.style.opacity = '0.4';
    }
}

// 暂停 / 继续动画
function toggleAnim() { state.isAnimating = !state.isAnimating; }

// 切换配色方案
function changeColor(idx) { state.colorScheme = idx; render(); }

// ---- E2：Mandelbrot / Julia 探索器 ----
function toggleFractal() {
    state.fractalMode = !state.fractalMode;
    document.getElementById('fractBtn').textContent =
        state.fractalMode ? '退出探索器 (Esc / m)' : 'Mandelbrot/Julia 探索器 (m)';
    const iterSlider = document.getElementById('iterSlider');
    iterSlider.disabled = !state.fractalMode;
    iterSlider.style.opacity = state.fractalMode ? '1' : '0.4';
    updateModeTip();
    render();
}

function toggleJulia() {
    if (!state.fractalMode) return;
    state.isJulia = !state.isJulia;
    updateModeTip();
    render();
}

// ============================================================
// 滑块绑定
// ============================================================
function bindSlider(id, valId, onInput) {
    const s = document.getElementById(id);
    const v = document.getElementById(valId);
    s.oninput = () => { v.innerText = s.value; onInput(s.value); };
}

bindSlider('nSlider', 'nVal', v => {
    state.nSides = parseInt(v);
    state.animCount = 0;          // 改变边数后重新生长
    render();
});
bindSlider('subSlider', 'subVal', v => { state.subdivDepth = parseInt(v); render(); });
bindSlider('pointSlider', 'pointVal', v => { state.pointSize = parseFloat(v); render(); });
bindSlider('pointCountSlider', 'pointCountVal', v => {
    state.chaosPointCount = parseInt(v);
    state.animCount = 0;
    render();
});
bindSlider('iterSlider', 'iterVal', v => { state.fractIter = parseInt(v); render(); });

// ============================================================
// 页面初始化（放在所有脚本之后调用）
// 注意：这里不调用 setMode(0)，否则会覆盖 URL 参数预设的渲染模式；
// 直接根据当前 state 同步 UI 并开启动画。
// ============================================================
function init() {
    updateModeTip();
    document.getElementById('fractBtn').textContent =
        state.fractalMode ? '退出探索器 (Esc / m)' : 'Mandelbrot/Julia 探索器 (m)';
    const iterSlider = document.getElementById('iterSlider');
    iterSlider.disabled = !state.fractalMode;
    iterSlider.style.opacity = state.fractalMode ? '1' : '0.4';
    render();
    animateLoop();
}

// 支持通过 URL 参数 ?mode=0/1/2&color=0/1/2 预设初始状态（便于演示与截图）
(function applyUrlParams() {
    const q = new URLSearchParams(location.search);
    if (q.has('mode'))  state.renderMode = Math.min(2, Math.max(0, parseInt(q.get('mode'))));
    if (q.has('color')) state.colorScheme = Math.min(2, Math.max(0, parseInt(q.get('color'))));
    if (q.has('depth')) state.subdivDepth = Math.min(6, Math.max(0, parseInt(q.get('depth'))));
    if (q.has('n'))     state.nSides = Math.min(6, Math.max(3, parseInt(q.get('n'))));
    if (q.has('fract')) state.fractalMode = true;
    if (q.has('julia')) state.isJulia = true;

    // 同步滑块显示，保证 URL 参数与面板一致
    const setSlider = (id, valId, value) => {
        const s = document.getElementById(id);
        const v = document.getElementById(valId);
        if (s && v) { s.value = value; v.innerText = value; }
    };
    if (q.has('n'))     setSlider('nSlider', 'nVal', state.nSides);
    if (q.has('depth')) setSlider('subSlider', 'subVal', state.subdivDepth);
})();

init();
