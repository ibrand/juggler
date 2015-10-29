// A juggling game.
// Currently, just toss and catch one ball.
// Assumes a webpage with a canvas element IDed 'canvas', and mouse
// interaction. We'll want to do multitouch too.

var GRAVITY = 0.2;
var HAND_RADIUS = 80;
var BALL_RADIUS = 20;
var STIFFNESS = 0.02;

function onLoad() {
    canvas.addEventListener('mousemove', onMousemove);
    redisplay();
    scheduleNextFrame();
}


// The canvas

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canvasBounds = canvas.getBoundingClientRect();
var width        = canvas.width;
var height       = canvas.height;

function mouseCoords(event) {
    return {x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top};
}


// The main loop

function scheduleNextFrame() {
    window.requestAnimationFrame(onFrame);
}

var frameNumber = 0;

function onFrame() {
    frameNumber++;
    updateState();
    redisplay();
    if (!gameOver()) {
        scheduleNextFrame();
    }
}

function redisplay() {
    ctx.clearRect(0, 0, width, height);
    balls.forEach(drawBall);
    drawHand();
}


// The hand

var hand =
{
    position: {
        x:50, y:50
    },
    velocity:{
        x:0, y:0
    }
};

var previousPosition = hand.position;
var previousTime = 0;

function drawHand(){
    ctx.beginPath();
    ctx.arc(hand.position.x, hand.position.y, HAND_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hand.position.x, hand.position.y);
    ctx.lineTo(hand.position.x, hand.position.y + hand.velocity.y * 5);    
    ctx.stroke();
}

function onMousemove(event) {
    hand.position = mouseCoords(event);
    // d = v*t
    // where d = hand.position.y - previousPosition.y
    //       t = frameNumber - previousTime
    // so v = d/t
    if (frameNumber !== previousTime) {
        hand.velocity = {
                x: 0,// not really
                y: (hand.position.y - previousPosition.y) / (frameNumber - previousTime)
        }; 
    }  
    previousPosition = hand.position;
    previousTime = frameNumber;
}

// The balls

var balls = [
    {
        position: {
            x:width/2, y:0
        },
        velocity:{
            x:0, y:0
        }
    },
    {
        position: {
            x:width/2, y:height
        },
        velocity:{
            x:0, y:-20
        }
    }
];

function drawBall(ball) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
}

function gameOver() {
    return balls.reduce(function (over, ball){
        return over || ball.position.y > height;
    }, false);
}

function updateState() {
    hand.velocity = multiply(0.85, hand.velocity);
    balls.forEach(function (ball){
        ball.position = add(ball.position, ball.velocity);
        ball.velocity.y += GRAVITY;

        if (collidesWithHand(ball)) {
            var vRelativeToBallY = hand.velocity.y - ball.velocity.y;
            if (vRelativeToBallY < 0) {
                spring(ball);
            }
        }
        if (collidesWithWall(ball)){
            ball.velocity.x *= -1;
        }
    });
}

function spring(ball) {
    // start point should be right above the hand
    var base = {x: hand.position.x, 
                y: hand.position.y - HAND_RADIUS - 5};
    var ballTop = subtract(ball.position, {x: 0, y: BALL_RADIUS});

    // computeDistance of the base and the ball
    var separation = subtract(ball.position, base);

    var acceleration = multiply(-STIFFNESS, separation);

    var dampening = 0.95;
    ball.velocity = multiply(dampening, ball.velocity);
    ball.velocity = add(ball.velocity, acceleration);

}

function collidesWithHand(ball) {
    var d = computeDistance(ball.position, hand.position);
    return d <= HAND_RADIUS + BALL_RADIUS;
}

function collidesWithWall(ball) {
    return ball.position.x < 0 || ball.position.x > width;
}

// Vectors

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

