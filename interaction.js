// ============================================================
// interaction.js —— 鼠标 / 键盘交互（事件驱动）
// 左键拖拽平移、滚轮缩放；键盘 1/2/3 切换模式、空格暂停生长、
// m 进入/退出 E2 探索器、j 切换 Mandelbrot/Julia、Esc 退出。
// ============================================================

// ---- 鼠标：左键拖拽平移，滚轮缩放 ----
let isDrag = false;
let lastMouse = [0, 0];

canvas.addEventListener('mousedown', e => {
    isDrag = true;
    const rect = canvas.getBoundingClientRect();
    lastMouse = [e.clientX - rect.left, e.clientY - rect.top];
});

canvas.addEventListener('mousemove', e => {
    if (!isDrag) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = (mx - lastMouse[0]) / canvas.width;
    const dy = -(my - lastMouse[1]) / canvas.height;

    if (state.fractalMode) {
        // E2：平移复平面视野
        state.fractCenter[0] -= dx * state.fractScale;
        state.fractCenter[1] -= dy * state.fractScale;
    } else {
        // 2D：平移模型视图（除以 scale 使移动量与视图一致）
        state.translate[0] += dx * 2 / state.scale;
        state.translate[1] += dy * 2 / state.scale;
    }
    lastMouse = [mx, my];
    render();
});

canvas.addEventListener('mouseup', () => isDrag = false);
canvas.addEventListener('mouseleave', () => isDrag = false);

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (state.fractalMode) {
        // E2：缩放复平面视野
        const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
        state.fractScale *= factor;
    } else {
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        state.scale *= factor;
    }
    render();
}, { passive: false });

// ---- 键盘 ----
document.addEventListener('keydown', e => {
    if (e.key === '1') { state.renderMode = 0; updateModeTip(); state.animCount = 0; }
    if (e.key === '2') { state.renderMode = 1; updateModeTip(); }
    if (e.key === '3') { state.renderMode = 2; updateModeTip(); }
    if (e.key === ' ') {           // 空格：暂停 / 继续逐点生长
        e.preventDefault();
        state.isAnimating = !state.isAnimating;
    }
    if (e.key === 'm' || e.key === 'M') {   // E2 进入 / 退出探索器
        toggleFractal();
        return;
    }
    if (e.key === 'j' || e.key === 'J') {   // E2 切换 Mandelbrot / Julia
        toggleJulia();
        return;
    }
    if (e.key === 'Escape') {               // 退出 E2
        if (state.fractalMode) toggleFractal();
        return;
    }
    render();
});
