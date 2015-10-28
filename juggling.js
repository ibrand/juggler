var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canvasBounds = canvas.getBoundingClientRect();
var width        = canvas.width;
var height       = canvas.height;
var balls = [
    {
        position: {
            x:width/2, y:0
        },
        velocity:{
            x:0, y:0
        }
    }
];
var GRAVITY = 0.05;
var HAND_RADIUS = 80;
var BALL_RADIUS = 20;
var GAME_OVER = false;

function mouseCoords(event) {
    return {x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top};
}


function onMousemove(event) {
    handAt = mouseCoords(event);
   // redisplay();
}

canvas.addEventListener('mousemove', onMousemove);

var handAt = {x: 50, y: 50}

function updateState() {
    balls.forEach(function (ball){
        ball.velocity.y += GRAVITY;
        ball.position.y += ball.velocity.y;
    });
}

function redisplay() {
    ctx.clearRect(0, 0, width, height);
    drawBall(balls[0]);
    drawHand();
}

function drawHand(){
    ctx.beginPath();
    ctx.arc(handAt.x, handAt.y, HAND_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
}

function drawBall(ball) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
}

function scheduleNextFrame() {
    window.requestAnimationFrame(onFrame);
}

function onFrame() {
    updateState();
    redisplay();
    if (balls[0].position.y > height){
        return;
    }
    scheduleNextFrame();
}

function onLoad() {
    redisplay();
    scheduleNextFrame();
}


// collision occurs when d <= r1 + r2
