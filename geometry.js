// ============================================================
// geometry.js —— 几何数据与两种分形生成算法（纯计算，无 DOM/GL）
//  1) 混沌游戏（随机迭代）生成 Sierpiński / N 边形垫片 —— E1
//  2) 递归细分（subdivide）生成 Sierpiński 垫片
// ============================================================

// ---- 配色方案（3 套，供点云 / 三角形 / 线框共用）----
const colorSchemes = [
    [ [1, 0.6, 0],   [0, 0.8, 1],   [1, 0.2, 0.8] ], // 配色A：橙 / 青 / 品红
    [ [0.2, 1, 0.4], [0.9, 0.9, 0.2], [0.1, 0.5, 1] ], // 配色B：绿 / 黄 / 蓝
    [ [1, 1, 1],     [0.8, 0.3, 0.3], [0.3, 0.3, 0.9] ]  // 配色C：白 / 红 / 蓝
];

// ---- 混沌游戏（Chaos Game）----
// 原理：以 n 边形顶点为固定吸引子，从一个随机初始点开始，
//       反复执行 p = (p + 随机顶点) / 2，点轨迹收敛到 Sierpiński 垫片结构。
// 返回：{ points: [x0,y0, x1,y1, ...] }，渲染时以 gl.POINTS 绘制。
function chaosGame(n, totalPoints) {
    const verts = [];            // n 边形顶点
    for (let i = 0; i < n; i++) {
        const ang = 2 * Math.PI * i / n - Math.PI / 2;
        verts.push([Math.cos(ang) * 0.8, Math.sin(ang) * 0.8]);
    }
    let p = [Math.random() * 2 - 1, Math.random() * 2 - 1]; // 随机初始点
    const points = [];
    for (let i = 0; i < totalPoints; i++) {
        const vid = Math.floor(Math.random() * n);           // 随机选一个顶点
        p[0] = (p[0] + verts[vid][0]) / 2;                   // p = (p + 顶点)/2
        p[1] = (p[1] + verts[vid][1]) / 2;
        points.push(p[0], p[1]);
    }
    return points;
}

// ---- 递归细分（Recursive Subdivision）----
// 原理：对一个初始三角形，把三条边的中点相连，挖去中间的小三角形，
//       得到 3 个更小的三角形；对每个小三角形递归重复 depth 次。
//       最终保留的是 Sierpiński 垫片的"实心"三角集合。
// 输出：把每个最终三角形 3 个顶点 [a,b,c] 展平为 [x,y,...] 追加到 out。
function subdivideTriangle(tri, depth, out) {
    if (depth === 0) {
        out.push(tri[0][0], tri[0][1],
                 tri[1][0], tri[1][1],
                 tri[2][0], tri[2][1]);
        return;
    }
    const [a, b, c] = tri;
    const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
    const ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
    subdivideTriangle([a, ab, ca], depth - 1, out);
    subdivideTriangle([ab, b, bc], depth - 1, out);
    subdivideTriangle([ca, bc, c], depth - 1, out);
}

// 把三角形顶点数据转换为线段数据（gl.LINES 逐对成线）。
// 每个三角形 [a,b,c] 需要 3 条边：(a,b)、(b,c)、(c,a)，
// 否则直接用原始三角形顶点会被 gl.LINES 错误地跨三角形连线。
function trianglesToEdges(triFlat) {
    const edges = [];
    for (let i = 0; i < triFlat.length; i += 6) {
        const ax = triFlat[i],     ay = triFlat[i + 1];
        const bx = triFlat[i + 2], by = triFlat[i + 3];
        const cx = triFlat[i + 4], cy = triFlat[i + 5];
        edges.push(ax, ay, bx, by);   // 边 a-b
        edges.push(bx, by, cx, cy);   // 边 b-c
        edges.push(cx, cy, ax, ay);   // 边 c-a
    }
    return edges;
}

// 按渲染模式生成"递归细分"一族的顶点与颜色数据。
// mode = 1 -> 线框(LINES)；mode = 2 -> 实体(TRIANGLES)。
// 每个三角形分配一种颜色（在 3 套配色间循环），使垫片层次清晰。
function buildSubdivision(depth, mode, schemeIndex) {
    const root = [[-0.8, -0.6], [0.8, -0.6], [0, 0.7]]; // 初始大三角形
    const triFlat = [];
    subdivideTriangle(root, depth, triFlat);

    const nTris = triFlat.length / 6;
    let vertexData;
    let perTri;   // 每个三角形展开出的顶点数
    if (mode === 1) { vertexData = trianglesToEdges(triFlat); perTri = 6; }
    else            { vertexData = triFlat;                   perTri = 3; }

    const colors = colorSchemes[schemeIndex % colorSchemes.length];
    const colorData = [];
    for (let t = 0; t < nTris; t++) {
        const col = colors[t % 3];
        for (let k = 0; k < perTri; k++) colorData.push(col[0], col[1], col[2]);
    }
    return { vertexData, colorData };
}
