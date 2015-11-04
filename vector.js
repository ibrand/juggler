var vector = (function(){

function computeDistance(p1, p2){
    var d = subtract(p1,p2);
    return Math.sqrt(dot(d, d));
}

function dot(v1, v2){
    return v1.x * v2.x + v1.y * v2.y;
}

function add(v1, v2){
    return {x: v1.x + v2.x, y:v1.y+v2.y};
}

function subtract(v1, v2){
    return {x: v1.x - v2.x, y:v1.y - v2.y};
}

function multiply(multiplier, v1){
    return {x: multiplier * v1.x, y: multiplier * v1.y};
}

var module = typeof exports !== 'undefined' ? exports : {};

module.computeDistance = computeDistance;
module.subtract = subtract;
module.add = add;
module.dot = dot;
module.multiply = multiply;

return module;

})();