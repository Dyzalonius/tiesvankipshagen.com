////////////////////////////////////////
//       Variables & Game loop        //
////////////////////////////////////////

// Settings
var bulletMaxTimeAlive = 30; // in seconds
var bulletSpeed = 1000; // in pixels per second
var bulletSize = {x:10, y:10};
var gunBarrelSize = {x:100, y:25};
var gunFireDelay = 0.02; // in seconds
var gunFireBloomMin = 0; // in degrees
var gunFireBloomMax = 20; // in degrees
var gunFireBloomCurrentStep = 0.1; // in percentages
var gunFireBloomIncrease = 1; // in degrees per bullet
var gunFireBloomDecrease = 30; // in degrees per second
var gunReloadTimeMax = 1.5; // in seconds
var gunAngleMin = -89; // in degrees
var gunAngleMax = -8; // in degrees
var bulletCapacity = 90; // in bullets
var gravity = 350; // in pixels per second per second

// References
var canvas;
var ctx;
var canvasSize = {x:0, y:0};
var mousePos = {x:0, y:0};
var mouseDown = false;
var oldTimeStamp = 0;
var deltaTime = 0;

var behaviours = [];
var bullets = [];
var enemies = [];
var crosshair;

$(document).ready(function () {
    Start();
});

function Start() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    document.addEventListener('mousemove', MouseMove);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mouseup", MouseUp);

    var turret = new Turret({x:130, y:500}, {x:-90, y:0}, 50, bulletCapacity, 'black', true);
    crosshair = new Crosshair(turret);
    new Enemy({x: 700, y: 200}, {x:100, y:100}, 'red');
    new Enemy({x: 1300, y: 700}, {x:100, y:100}, 'red');
    new Enemy({x: 1400, y: 300}, {x:100, y:100}, 'red');

    Update(0);
}

function Update(timeStamp) {
    CalculateDeltaTime(timeStamp);
    UpdateCanvasSize();
    for (var i = behaviours.length - 1; i >= 0; i--) {
        behaviours[i].Update();
    }

    for (var i = behaviours.length - 1; i >= 0; i--) {
        behaviours[i].Draw();
    }

    CheckCollision();

    // Recursive call Update()
    requestAnimationFrame(Update);
}

function CalculateDeltaTime(timeStamp) {
    deltaTime = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
}

function UpdateCanvasSize() {
    canvasSize = {x:$('#gameCanvas').width(), y:$('#gameCanvas').height()};
    $('#gameCanvas').attr({
        width: canvasSize.x,
        height: canvasSize.y
    });
}

function CheckCollision() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        var enemy = enemies[i];
        for (var j = bullets.length - 1; j >= 0; j--) {
            var bullet = bullets[j];

            if (enemy != null && enemy.collider.IntersectsWith(bullet.collider)) {
                bullet.Destroy();
                enemy.Hit(1);
            }
        }
    }
}

////////////////////////////////////////
//              Classes               //
////////////////////////////////////////

/*class Sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function () {
            this.sound.pause();
        };
    }
}*/

class Behaviour {
    constructor() {
        behaviours.push(this);
    }

    Update() {

    }

    Draw() {

    }

    Destroy() {
        var index = behaviours.indexOf(this);
        if (index != -1) {
            behaviours.splice(index, 1);
        }
    }
}

class GameObject extends Behaviour {
    constructor(pos, velocity, enableGravity = false) {
        super();
        this.pos = pos;
        this.velocity = velocity;
        this.enableGravity = enableGravity;
    }

    Update() {
        super.Update();
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;

        if (this.enableGravity) {
            this.velocity.y += gravity * deltaTime;
        }
    }

    Draw() {
        super.Draw();
    }

    Destroy() {
        super.Destroy();
    }
}

class Bullet extends GameObject {
    constructor(pos, velocity, size, color, maxTimeAlive, angle = 0, src = '') {
        super(pos, velocity, true);
        this.size = size; // Only x is used for circle
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
        this.timeAlive = 0;
        this.color = color;
        this.angle = angle; // Only used for image
        this.src = src; // Only used for image
        this.image; // Only used for image
        this.maxTimeAlive = maxTimeAlive;
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
        bullets.push(this);
    }

    Update() {
        super.Update();
        this.timeAlive += deltaTime;
        this.collider.pos = this.pos;

        // Destroy bullet if over maxTimeAlive or off-canvas
        if (this.timeAlive > this.maxTimeAlive || IsOffCanvas(this.pos, this.size)) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        if (this.src != '') {
            DrawImage(this.pos, this.size, this.angle, this.image);
        }
        else {
            DrawCircle(this.pos, this.size.x / 2, this.color);
        }
    }

    Destroy() {
        var index = bullets.indexOf(this);
        if (index != -1) {
            bullets.splice(index, 1);
        }
        super.Destroy();
    }
}

class Enemy extends GameObject {
    constructor(pos, size, color) {
        super(pos, {x:0, y:0});
        this.pos = pos;
        this.size = size;
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
        this.color = color;
        this.healthBarSize = {x:60, y:5};
        this.healthPointsMax = 25;
        this.healthPoints = this.healthPointsMax;
        enemies.push(this);
    }

    Update() {
        super.Update();
        this.collider.pos = this.pos;
    }

    Draw() {
        super.Draw();
        DrawCircle(this.pos, this.size.x / 2, this.color);
        DrawCircle(this.pos, this.size.x / 2 * 0.8, 'rgb(230,230,230)');
        DrawCircle(this.pos, this.size.x / 2 * 0.6, this.color);
        DrawCircle(this.pos, this.size.x / 2 * 0.4, 'rgb(230,230,230)');
        DrawCircle(this.pos, this.size.x / 2 * 0.2, this.color);
        var healthPos = { x: this.pos.x + 0, y: this.pos.y - this.size.x / 2 - 10 };
        DrawRect(healthPos, { x:this.healthBarSize.x * this.healthPoints / this.healthPointsMax, y:this.healthBarSize.y }, 'green', 0);
    }

    Destroy() {
        var index = enemies.indexOf(this);
        if (index != -1) {
            enemies.splice(index, 1);
        }
        super.Destroy();
    }

    Hit(damagePoints) {
        this.healthPoints -= damagePoints;
        if (this.healthPoints <= 0) {
            this.Destroy();
        }
    }
}

class Turret extends GameObject {
    constructor(pos, hopperOffset, hopperWidth, bulletCapacity, color, stickToBottomOfCanvas = false) {
        super(pos, {x:0, y:0});
        this.color = color;
        this.hopperOffset = hopperOffset;
        this.bulletCapacity = bulletCapacity;
        this.bulletsRemaining = this.bulletCapacity;
        this.hopper = new Hopper(hopperWidth, color, this);
        this.fireDelay = 0;
        this.reloadTime = 0;
        this.currentBloom = 0;
        this.currentBloomMax = 0;
        this.barrelAngle = 0;
        this.stickToBottomOfCanvas = stickToBottomOfCanvas;
    }

    Update() {
        super.Update();
        if (this.stickToBottomOfCanvas) {
            this.pos.y = canvasSize.y;
        }
        this.hopper.SetPos({ x: this.pos.x + this.hopperOffset.x, y: this.pos.y + this.hopperOffset.y });
        this.CheckFire();
    }

    Draw() {
        super.Draw();
        this.hopper.Draw();
        var gunDomeRadius = 50;
        // Calculate angle based on mouse input
        var vector = {x: mousePos.x - this.pos.x, y:mousePos.y - this.pos.y};
        // Calculate barrel angle
        this.barrelAngle = ToDeg(Math.atan2(vector.y, vector.x));
        this.barrelAngle = Clamp(this.barrelAngle, gunAngleMin, gunAngleMax);
        this.barrelAngle += this.currentBloom;
        this.barrelAngle = Clamp(this.barrelAngle, gunAngleMin, gunAngleMax);
        // draw
        DrawCircle(this.pos, gunDomeRadius, 'black');
        DrawRect(this.pos, gunBarrelSize, 'black', this.barrelAngle, {x:0, y:0.5});
    }

    CheckFire() {
        if (mouseDown && this.bulletsRemaining > 0) {
            // Fire
            if (this.fireDelay == 0) {
                var pos = { x: this.pos.x + (gunBarrelSize.x - bulletSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
                this.Fire(this.barrelAngle, pos);
                this.fireDelay = gunFireDelay;
                this.bulletsRemaining--;
                this.currentBloomMax += gunFireBloomIncrease;
                if (this.currentBloomMax >= gunFireBloomMax) {
                    this.currentBloomMax = gunFireBloomMax;
                }
                // Calculate current bloom
                this.currentBloom += this.currentBloomMax * gunFireBloomCurrentStep * (Math.random() * 2 - 1);
                if (this.currentBloom > this.currentBloomMax) {
                    this.currentBloom = this.currentBloomMax;
                }
                if (this.currentBloom < -this.currentBloomMax) {
                    this.currentBloom = -this.currentBloomMax;
                }
            }
        }
        else {
            // Reduce bloom
            this.currentBloomMax -= gunFireBloomDecrease * deltaTime;
            if (this.currentBloomMax <= gunFireBloomMin) {
                this.currentBloomMax = gunFireBloomMin;
            }
            this.currentBloom -= this.currentBloom / 10;
        }
        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelay > 0) {
            this.fireDelay -= deltaTime;
            if (this.fireDelay < 0) {
                this.fireDelay = 0;
            }
        }
        // Reload if empty magazine
        if (this.bulletsRemaining == 0) {
            this.reloadTime += deltaTime;
            if (this.reloadTime >= gunReloadTimeMax) {
                this.bulletsRemaining = this.bulletCapacity;
                this.reloadTime = 0;
            }
        }
    }

    Fire(angle, pos) {
        var color = 'rgb(0, 0, 0'; //GetRandomColor();
        var finalAngle = angle;
        var velocity = { x: Math.cos(ToRad(finalAngle)) * bulletSpeed, y: Math.sin(ToRad(finalAngle)) * bulletSpeed };
        var size = { x: bulletSize.x, y: bulletSize.y };
        new Bullet(pos, velocity, size, color, bulletMaxTimeAlive); //new Bullet(pos, velocity, size, color, 0, './assets/img/game/face.png');
    }
}

class Hopper extends GameObject {
    constructor(width, color, turret) {
        super({x:0, y:0}, {x:0, y:0});
        this.color = color;
        this.columnCount = 6;
        this.turret = turret;
        this.rowCount = Math.ceil(turret.bulletCapacity / this.columnCount);
        this.ammoRadius = 2;
        this.spacing = { x: 6, y: 6 };
        this.size = { x: width, y: this.spacing.y * (this.rowCount + 1) };
    }

    Draw() {
        super.Draw();
        DrawRect(this.pos, this.size, 'black', 0, { x: 0.5, y: 1 });
        for (var i = 0; i < this.turret.bulletsRemaining; i++) {
            var rowN = Math.floor(i / this.columnCount);
            var columnN = i % this.columnCount;
            var strangevarthing = columnN + 0.5 - this.columnCount / 2;
            var pos = { x: this.pos.x - strangevarthing * this.spacing.x, y: this.pos.y - (rowN + 1) * this.spacing.y };
            DrawCircle(pos, this.ammoRadius, 'white');
        }
    }

    SetPos(newPos) {
        this.pos = newPos;
    }
}

class Crosshair extends GameObject {
    constructor(turret) {
        super(mousePos, {x:0, y:0});
        this.pos = mousePos;
        this.dotRadius = 3;
        this.lineThickness = 3;
        this.lineLength = 20;
        this.lineOffset = 10;
        this.lineOffsetBloomFactor = 3;
        this.showDot = false;
        this.showLines = true;
        this.color = 'black';
        this.turret = turret;
    }

    Update() {
        super.Update();
        this.pos = mousePos;
    }

    Draw() {
        super.Draw();
        if (this.showDot) {
            DrawCircle(this.pos, this.dotRadius, this.color);
        }
        if (this.showLines) {
            var lineOffsets = this.lineOffset + this.lineOffsetBloomFactor * this.turret.currentBloomMax;
            DrawRect({ x: this.pos.x - lineOffsets, y: this.pos.y }, { x: this.lineLength, y: this.lineThickness }, this.color, 0, { x: 1, y: 0.5 });
            DrawRect({ x: this.pos.x + lineOffsets, y: this.pos.y }, { x: this.lineLength, y: this.lineThickness }, this.color, 0, { x: 0, y: 0.5 });
            DrawRect({ x: this.pos.x, y: this.pos.y - lineOffsets }, { x: this.lineThickness, y: this.lineLength }, this.color, 0, { x: 0.5, y: 1 });
            DrawRect({ x: this.pos.x, y: this.pos.y + lineOffsets }, { x: this.lineThickness, y: this.lineLength }, this.color, 0, { x: 0.5, y: 0 });
        }
    }
}

class CircleCollider {
    constructor(pos, radius) {
        this.pos = pos;
        this.radius = radius;
        this.colliderType = 1; // 1 = circle
    }

    IntersectsWith(collider) {
        if (collider.colliderType == 0) {
            return true; // CircleRect
        }
        else {
            var distance = Math.sqrt(Math.pow(this.pos.x - collider.pos.x, 2) + Math.pow(this.pos.y - collider.pos.y, 2));
            return distance < this.radius + collider.radius; // CircleCircle
        }
    }
}

// NOT USED
class BoxCollider {
    constructor(pos, size, angle, anchor) {
        this.pos = pos; // calc using anchor & angle
        this.size = size;
        this.angle = angle;
        this.colliderType = 0; // 0 = box
    }

    IntersectsWith(collider) {
        if (collider.colliderType == 0) {
            return true; // RectRect
        }
        else {
            return true; // RectCircle
        }
    }
}

// NOT USED
class Bucket {
    constructor(pos, widthBottom, widthTop, height, thickness, color, angle = 0) {
        this.pos = pos;
        this.widthBottom = widthBottom;
        this.widthTop = widthTop;
        this.thickness = thickness;
        this.height = height;
        this.color = color;
        this.angle = angle;
    }

    Draw() {
        ctx.fillStyle = this.color;
        var angle = ToDeg(Math.atan2(((this.widthTop - this.widthBottom) / 2), this.height));
        var posBottomLeft = { x: this.pos.x + (this.widthBottom / 2) * -Math.cos(ToRad(this.angle)), y: this.pos.y + (this.widthBottom / 2) * -Math.sin(ToRad(this.angle)) };
        var posBottomRight = { x: this.pos.x + (this.widthBottom / 2) * Math.cos(ToRad(this.angle)), y: this.pos.y + (this.widthBottom / 2) * Math.sin(ToRad(this.angle)) };
        DrawRect(posBottomLeft, { x: this.thickness, y: this.height }, 'black', this.angle - angle, { x: 0, y: 1 });
        DrawRect(this.pos, { x: this.widthBottom, y: this.thickness }, 'black', this.angle, { x: 0.5, y: 1 });
        DrawRect(posBottomRight, { x: this.thickness, y: this.height }, 'black', this.angle + angle, { x: 1, y: 1 });
    }

    UpdateData(angle, widthTop) {
        this.angle = parseInt(angle);
        this.widthTop = widthTop;
    }
}

////////////////////////////////////////
//         Utility functions          //
////////////////////////////////////////

function DrawCircle(pos, radius, color) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawImage(pos, size, angle, image, anchor={x:0.5, y:0.5}) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.drawImage(image, pos.x - size.x * anchor.x, pos.y - size.y * anchor.y, size.x, size.y);

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawRect(pos, size, color, angle, anchor={x:0.5, y:0.5}) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.fillStyle = color;
    ctx.fillRect(pos.x - size.x * anchor.x, pos.y - size.y * anchor.y, size.x, size.y);

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function GetRandomColor() {
    var r = Math.random() * 255;
    var g = Math.random() * 255;
    var b = Math.random() * 255;
    return 'rgb('+r+','+g+','+b+')';
}

function IsOffCanvas(pos, ignoreUp = true, size = {x:0, y:0}) {
    var isOffCanvas = pos.x + size.x < 0 || pos.x - size.x > canvasSize.x || pos.y - size.y > canvasSize.y || (!ignoreUp && pos.y + size.y < 0);
    return isOffCanvas;
}

function IntersectCircleRectangle(circleCenter, circleRadius, rectanglePos, rectangleSize, rectangleAngleCircle) {
    var vertex1 = {x:0, y:0}; //TODO: Calculate
    var vertex2 = {x:0, y:0};
    var vertex3 = {x:0, y:0};
    var vertex4 = {x:0, y:0};
    return (pointInRectangle(P, Rectangle(A, B, C, D)) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex1, vertex2) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex2, vertex3) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex3, vertex4) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex4, vertex1));
}

function pointInRectangle(circleCenter, circleRadius, vertex1, vertex2, vertex3, vertex4) {
    return true; //TODO: Calculate
    //0 ≤ AP·AB ≤ AB·AB and 0 ≤ AP·AD ≤ AD·AD
}

function IntersectCircleLine(circleCenter, circleRadius, lineStart, lineEnd) {
    return true; //TODO: Calculate
}

function MouseDown() {
    mouseDown = true;
}

function MouseUp() {
    mouseDown = false;
}

function MouseMove() {
    mousePos = GetMousePos(canvas, event);
}

function GetMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function ToRad(degrees) {
    return degrees * Math.PI / 180;
}

function ToDeg(radians) {
    return radians / Math.PI * 180;
}

function Clamp(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}
