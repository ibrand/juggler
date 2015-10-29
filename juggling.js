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
var hand =
{
    position: {
        x:50, y:50
    },
    velocity:{
        x:0, y:0
    }
};

var GRAVITY = 0.2;
var HAND_RADIUS = 80;
var BALL_RADIUS = 20;
var GAME_OVER = false;

var previousPosition = hand.position;
var previousTime = 0;

var frameNumber = 0;

function mouseCoords(event) {
    return {x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top};
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

canvas.addEventListener('mousemove', onMousemove);

function updateState() {
    frameNumber++;
    hand.velocity.y *= 0.85;
    balls.forEach(function (ball){
        ball.position.y += ball.velocity.y;
        ball.velocity.y += GRAVITY;

        if (collidesWithHand(ball)) {
            spring(ball);
        }
    });
}

function spring(ball) {
    // start point should be right above the hand
    var base = hand.position.y - HAND_RADIUS - 5;
    // computeDistance of the base and the ball
    var separation = ball.position.y - BALL_RADIUS - base;
    var stiffness = 0.05;

    var acceleration = -separation * stiffness;

    var dampening = 0.95;
    ball.velocity.y *= dampening;
    ball.velocity.y += acceleration;

}

function collidesWithHand(ball) {
    var d = computeDistance(ball.position, hand.position);
    console.log("d", d);
    return d <= HAND_RADIUS + BALL_RADIUS;
}

function computeDistance(p1, p2){
    var xd = p1.x - p2.x;
    var yd = p1.y - p2.y;
    return Math.sqrt((xd*xd)+ (yd*yd));
}

function redisplay() {
    ctx.clearRect(0, 0, width, height);
    drawBall(balls[0]);
    drawHand();
}

function drawHand(){
    ctx.beginPath();
    ctx.arc(hand.position.x, hand.position.y, HAND_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hand.position.x, hand.position.y);
    ctx.lineTo(hand.position.x, hand.position.y + hand.velocity.y * 5);    
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
