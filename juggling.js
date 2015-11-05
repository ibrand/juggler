// A juggling game.
// Assumes a webpage with a canvas element IDed 'canvas', and either mouse
// or touch interaction.

'use strict';

var FORCE = 1;
var GRAVITY = 0.15;
var HAND_RADIUS = 80;
var BALL_RADIUS = 20;
var STIFFNESS = GRAVITY / FORCE;

var startTime;

function onLoad() {
    canvas.addEventListener('mousemove', onMousemove);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);
    redisplay();
    scheduleNextFrame();
    startTime = Date.now();
    changeGravity();
}


// The canvas

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var width        = window.innerWidth;
var height       = window.innerHeight - 100;

var SPEED_LIMIT = Math.sqrt(1*height*GRAVITY); // speed limit is dependent on height

canvas.width = width;
canvas.height = height;

function mouseCoords(event) {
    var canvasBounds = canvas.getBoundingClientRect();
    return {x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top};
}

function touchCoords(touch) {
    var canvasBounds = canvas.getBoundingClientRect();
    return {x: touch.pageX - canvasBounds.left,
            y: touch.pageY - canvasBounds.top};
}


// The main loop

function scheduleNextFrame() {
    window.requestAnimationFrame(onFrame);
}

var frameNumber = 0;

var frameInterval = 1/30 * 1000;       // 30fps target

function onFrame() {
    var now = Date.now();
    var didUpdate = false;
    while (startTime + (frameNumber+1) * frameInterval <= now) {
        frameNumber++;
//        if (frameNumber % 30 === 0) console.log("fps", frameNumber / ((now - startTime) / 1000));
        updateState();
        didUpdate = true;
        if (gameOver()) {
            break;
        }
    }
    if (didUpdate) {
        redisplay();
    }
    if (!gameOver()) {
        scheduleNextFrame();
    }
}

function redisplay() {
    ctx.clearRect(0, 0, width, height);
    balls.forEach(drawBall);
    hands.forEach(drawHand);
}


// The hands
// They head toward the (mouse or touch) pointers, but can only
// go so fast.

var hands = [];

var invisibleHand = makeHand({x:-1000, y:-1000}); // the invisible hand of god

function makeHand(position){
    return {
        target: position,
        position: position,
        velocity: {
            x:0, y:0
        },
    };
}

function drawHand(hand){
    ctx.beginPath();
    ctx.arc(hand.position.x, hand.position.y, HAND_RADIUS, 0, 2*Math.PI, false);
    ctx.stroke();
}

function onMousemove(event) {
    var at = mouseCoords(event);
    if (0 === hands.length) {
        hands.push(makeHand(at));
    }
    onDrag(at, hands[0]);
}

function onTouchStart(event) {
    // so here we'll grab the array and assign/make hands
    event.preventDefault();
    for (var i = 0; i < event.touches.length; i++){
        var position = touchCoords(event.touches[i]);
        if (hands[i] !== undefined){
            onDrag(position, hands[i]);
        } else {
            hands.push(makeHand(position));
        }
    }
}

function onTouchMove(event) {
    for (var i = 0; i < event.touches.length; i++){
        onDrag(touchCoords(event.touches[i]), hands[i]);
    }
}

function onTouchEnd(event) {
    onTouchMove(event);
    for (var i = hands.length - event.touches.length; 0 < i; --i) {
        hands.pop();
    }
}

var maxHandSpeed = 20;           // XXX tweak

function moveHand(hand) {
    var v = vector.subtract(hand.target, hand.position);
    var magnitude = vector.computeDistance(v, {x: 0, y: 0});
    if (maxHandSpeed < magnitude) {
        v = vector.multiply(maxHandSpeed/magnitude, v);
    }
    hand.velocity = v;
    hand.position = vector.add(hand.position, v);
}

function onDrag(position, hand) {
    hand.target = position;
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
            x:0.5, y:-15
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
    return false;
    return balls.reduce(function (over, ball){
        return over || ball.position.y > height;
    }, false);
}

function updateState() {
    hands.forEach(moveHand);
    balls.forEach(function (ball){
        ball.position = vector.add(ball.position, ball.velocity);

        if (ball.position.y <= height-5) ball.velocity.y += GRAVITY;
        else{ball.velocity.y = -2}

        var hand = findClosestHand(ball);

        if (collidesWithHand(ball, hand)) {
            var vRelativeToBallY = hand.velocity.y - ball.velocity.y;
            if (vRelativeToBallY < 0) {
                spring(ball,hand);
            }
        }
        if (collidesWithWall(ball)){
            ball.velocity.x *= -1;
        }
    });
    for(var i = 0; i < balls.length; i++){
        for(var j = i+1; j<balls.length; j++){
            ballBounce(balls[i], balls[j]);
        }
    }
}

var BALL_STIFFNESS = 0.005;

function ballBounce(ball1, ball2) {
    var d = vector.subtract(ball1.position, ball2.position);
    var springPosition = Math.sqrt(vector.dot(d, d)) - 2*BALL_RADIUS;
    if (springPosition < 0) {
        var acceleration = vector.multiply(-BALL_STIFFNESS * springPosition, d);
        ball1.velocity = vector.add(ball1.velocity, acceleration);
        ball2.velocity = vector.subtract(ball2.velocity, acceleration);
    }
}

function spring(ball, hand) {
    if (-ball.velocity.y >= SPEED_LIMIT) {
        return;
    }

    // start point should be right above the hand
    var base = {x: hand.position.x, 
                y: hand.position.y};
    var ballTop = vector.subtract(ball.position, {x: 0, y: BALL_RADIUS});

    // computeDistance of the base and the ball
    var separation = vector.subtract(ball.position, base);

    var acceleration = vector.multiply(-STIFFNESS, separation);

    var damping = 0.3;
    acceleration = vector.subtract(acceleration,
                                   vector.multiply(damping, vector.subtract(ball.velocity,
                                                                            hand.velocity)));
    ball.velocity = vector.add(ball.velocity, acceleration);

}

function findClosestHand(ball) {
    var bestDistance = Infinity;
    var bestHand = invisibleHand;
    hands.forEach(function (hand){
        var distance = vector.computeDistance(ball.position, hand.position);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestHand = hand;
        }
    });
    return bestHand;
}

function collidesWithHand(ball, hand) {
    var d = vector.computeDistance(ball.position, hand.position);
    return d <= HAND_RADIUS + BALL_RADIUS;
}

function collidesWithWall(ball) {
    return ball.position.x < 0 || ball.position.x > width; // to include y
}

// control panel

function changeGravity() {
    var gInput = document.getElementById('gravity-toggle');
    gInput.value = GRAVITY;
    console.log(gInput);
    gInput.oninput = function() {
        GRAVITY = parseFloat(gInput.value);
        STIFFNESS = GRAVITY / FORCE;
        SPEED_LIMIT = Math.sqrt(2*height*GRAVITY);
    }
}

