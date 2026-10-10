//
// MV.js
// 矩阵、向量工具库
//
function vec2(x,y) {
    if (Array.isArray(x)) return [x[0], x[1]];
    return [x, y];
}
function vec3(x,y,z) {
    if (Array.isArray(x)) return [x[0], x[1], x[2]];
    return [x,y,z];
}
function vec4(x,y,z,w) {
    if (Array.isArray(x)) {
        if(x.length===2) return [x[0],x[1],0,1];
        if(x.length===3) return [x[0],x[1],x[2],1];
        return [x[0],x[1],x[2],x[3]];
    }
    return [x,y,z,w];
}

function mat4() {
    var m = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
    if(arguments.length===1 && Array.isArray(arguments[0])){
        var a = arguments[0];
        return [a[0],a[1],a[2],a[3], a[4],a[5],a[6],a[7], a[8],a[9],a[10],a[11], a[12],a[13],a[14],a[15]];
    }
    return m;
}

function flatten(a) {
    return new Float32Array(a);
}

function mult(a,b) {
    var res = mat4();
    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
            res[i*4+j] = a[i*4+0]*b[0*4+j] + a[i*4+1]*b[1*4+j] + a[i*4+2]*b[2*4+j] + a[i*4+3]*b[3*4+j];
        }
    }
    return res;
}

function translate(x,y,z) {
    if(Array.isArray(x)){
        z = x[2]; y=x[1]; x=x[0];
    }
    return [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1
    ];
}

function scale(x,y,z) {
    if(Array.isArray(x)){
        z = x[2]; y=x[1]; x=x[0];
    }
    return [
        x,0,0,0,
        0,y,0,0,
        0,0,z,0,
        0,0,0,1
    ];
}

function rotate(angle, x,y,z) {
    var rad = angle * Math.PI / 180.0;
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var len = Math.sqrt(x*x+y*y+z*z);
    x /= len; y /= len; z /= len;
    var xx = x*x, yy=y*y, zz=z*z;
    var xy = x*y, xz=x*z, yz=y*z;
    var xs = x*s, ys=y*s, zs=z*s;
    var oc = 1-c;
    return [
        c+oc*xx, oc*xy+zs, oc*xz-ys, 0,
        oc*xy-zs, c+oc*yy, oc*yz+xs, 0,
        oc*xz+ys, oc*yz-xs, c+oc*zz, 0,
        0,0,0,1
    ];
}
