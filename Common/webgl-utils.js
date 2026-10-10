//
// webgl-utils.js
//
window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(callback){ return window.setTimeout(callback,1000/60); };
})();

window.cancelAnimationFrame = (function(){
    return window.cancelAnimationFrame ||
           window.webkitCancelAnimationFrame ||
           window.mozCancelAnimationFrame ||
           window.oCancelAnimationFrame ||
           window.msCancelAnimationFrame ||
           function(id){ window.clearTimeout(id); };
})();

function getWebGLContext(canvas, opt_attribs) {
    var names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var i = 0; i < names.length; ++i) {
        try {
            context = canvas.getContext(names[i], opt_attribs);
        } catch(e) {}
        if (context) break;
    }
    return context;
}
