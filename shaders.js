// shaders.js 着色器源码
const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 aPosition;
in vec3 aColor;
uniform mat3 uModelMatrix;
uniform float uPointSize;
out vec3 vColor;

void main() {
    vec3 pos = uModelMatrix * vec3(aPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = uPointSize;
    vColor = aColor;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 fragColor;

void main() {
    fragColor = vec4(vColor, 1.0);
}`;
