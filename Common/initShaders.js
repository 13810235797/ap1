//
//  initShaders.js
//
function initShaders( gl, vertexShaderSource, fragmentShaderSource )
{
    var vshader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vshader, vertexShaderSource );
    gl.compileShader( vshader );
    if ( !gl.getShaderParameter(vshader, gl.COMPILE_STATUS) ) {
        alert( "Vertex shader failed to compile: " + gl.getShaderInfoLog(vshader) );
        gl.deleteShader(vshader);
        return null;
    }

    var fshader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fshader, fragmentShaderSource );
    gl.compileShader( fshader );
    if ( !gl.getShaderParameter(fshader, gl.COMPILE_STATUS) ) {
        alert( "Fragment shader failed to compile: " + gl.getShaderInfoLog(fshader) );
        gl.deleteShader(fshader);
        return null;
    }

    var program = gl.createProgram();
    gl.attachShader( program, vshader );
    gl.attachShader( program, fshader );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        alert( "Shader program failed to link: " + gl.getProgramInfoLog(program) );
        gl.deleteProgram(program);
        return null;
    }
    return program;
}
