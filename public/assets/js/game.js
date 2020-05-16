////////////////////////////////////////
//       Variables & Game loop        //
////////////////////////////////////////

// Settings
var bulletMaxTimeAlive = 1200;
var bulletSpeed = 8;
var bulletSize = {x:20, y:20};
var gunOrigin = {x:130, y:500};
var gunBarrelSize = {x:100, y:25};
var gunBarrelAngle = 0;
var gunFireDelay = 4;
var gunFireDelayCurrent = 0;
var gunFireBloomMin = 0;
var gunFireBloomMax = 20;
var gunFireBloomCurrentMax = 0;
var gunFireBloomCurrent = 0;
var gunFireBloomCurrentStep = 0.15;
var gunFireBloomIncrease = 0.5;
var gunFireBloomDecrease = 0.07;
var gravity = 0.02;
var gunMagMax = 60;
var gunMagCurrent = gunMagMax;
var gunReloadTimeMax = 200;
var gunReloadTimeCurrent = 0;
var gunAngleMin = -89;
var gunAngleMax = -8;

// References
var canvas;
var ctx;
var canvasSize = {x:0, y:0};
var mousePos = {x:0, y:0};
var mouseDown = false;
var bullets = [];
var enemies = [];
var gameObjects = [];
var turret;
var crosshair;
var aimAngle = 0;

$(document).ready(function () {
    Start();
    Update();
});

function Start() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    document.addEventListener('mousemove', MouseMove);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mouseup", MouseUp);

    turret = new Turret('black', {x:-90, y:0}, 50);
    crosshair = new Crosshair();
    new Enemy({x: 700, y: 200}, {x:100, y:100}, 'red');
    new Enemy({x: 1300, y: 700}, {x:100, y:100}, 'red');
    new Enemy({x: 1400, y: 300}, {x:100, y:100}, 'red');
}

function Update() {
    UpdateCanvasSize();
    for (var i = gameObjects.length - 1; i >= 0; i--) {
        gameObjects[i].Update();
    }

    for (var i = gameObjects.length - 1; i >= 0; i--) {
        gameObjects[i].Draw();
    }

    CheckCollision();

    // Recursive call Update()
    requestAnimationFrame(Update);
}

function UpdateCanvasSize() {
    canvasSize = {x:$('#gameCanvas').width() ,y:$('#gameCanvas').height()};
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

            if (enemy.collider.IntersectsWith(bullet.collider)) {
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

class GameObject {
    constructor() {
        gameObjects.push(this);
    }

    Update() {

    }

    Draw() {

    }

    Destroy() {
        gameObjects.splice(gameObjects.indexOf(this), 1);
    }
}

class Bullet extends GameObject {
    constructor(pos, velocity, size, color, angle = 0, src = '') {
        super();
        this.pos = pos;
        this.velocity = velocity;
        this.size = size; // Only x is used for circle
        this.timeAlive = 0;
        this.color = color;
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
        this.angle = angle; // Only used for image
        this.src = src; // Only used for image
        this.image; // Only used for image
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
        bullets.push(this);
    }

    Update() {
        super.Update();
        this.timeAlive++;
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        this.velocity.y += gravity;
        this.collider.pos = this.pos;

        // Destroy bullet if over maxTimeAlive or off-canvas
        if (this.timeAlive > bulletMaxTimeAlive || IsOffCanvas(this.pos, this.size)) {
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
        super.Destroy();
        bullets.splice(bullets.indexOf(this), 1);
    }
}

class Enemy extends GameObject {
    constructor(pos, size, color) {
        super();
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.healthBarSize = {x:60, y:5};
        this.healthPointsMax = 25;
        this.healthPoints = this.healthPointsMax;
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
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
        super.Destroy();
        enemies.splice(enemies.indexOf(this), 1);
    }

    Hit(damagePoints) {
        this.healthPoints -= damagePoints;
        if (this.healthPoints <= 0) {
            this.Destroy();
        }
    }
}

class Turret extends GameObject {
    constructor(color, hopperOffset, hopperWidth) {
        super();
        this.color = color;
        this.hopperOffset = hopperOffset;
        this.pos = { x: 0, y: 0 };
        this.hopper = new Hopper(hopperWidth, color);
    }

    Update() {
        super.Update();
        this.pos = gunOrigin;
        this.hopper.SetPos({ x: this.pos.x + this.hopperOffset.x, y: this.pos.y + this.hopperOffset.y });
        this.CheckFire();
    }

    Draw() {
        super.Draw();
        this.hopper.Draw();
        gunOrigin.y = canvasSize.y;
        var gunDomeRadius = 50;
        // Calculate angle based on mouse input
        var vector = { x: mousePos.x - gunOrigin.x, y: mousePos.y - gunOrigin.y };
        aimAngle = ToDeg(Math.atan2(vector.y, vector.x));
        // Calculate barrel angle
        gunBarrelAngle = aimAngle;
        gunBarrelAngle = Clamp(gunBarrelAngle, gunAngleMin, gunAngleMax);
        gunBarrelAngle += gunFireBloomCurrent;
        gunBarrelAngle = Clamp(gunBarrelAngle, gunAngleMin, gunAngleMax);
        // draw
        DrawCircle(gunOrigin, gunDomeRadius, 'black');
        DrawRect(gunOrigin, gunBarrelSize, 'black', gunBarrelAngle, { x: 0, y: 0.5 });
    }

    CheckFire() {
        if (mouseDown && gunMagCurrent > 0) {
            // Fire
            if (gunFireDelayCurrent == 0) {
                var pos = { x: gunOrigin.x + (gunBarrelSize.x - bulletSize.x / 2) * Math.cos(ToRad(gunBarrelAngle)), y: gunOrigin.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(gunBarrelAngle)) };
                this.Fire(gunBarrelAngle, pos);
                gunFireDelayCurrent = gunFireDelay;
                gunMagCurrent--;
                gunFireBloomCurrentMax += gunFireBloomIncrease;
                if (gunFireBloomCurrentMax >= gunFireBloomMax) {
                    gunFireBloomCurrentMax = gunFireBloomMax;
                }
                // Calculate current bloom
                gunFireBloomCurrent += gunFireBloomCurrentMax * gunFireBloomCurrentStep * (Math.random() * 2 - 1);
                if (gunFireBloomCurrent > gunFireBloomCurrentMax) {
                    gunFireBloomCurrent = gunFireBloomCurrentMax;
                }
                if (gunFireBloomCurrent < -gunFireBloomCurrentMax) {
                    gunFireBloomCurrent = -gunFireBloomCurrentMax;
                }
            }
        }
        else {
            // Reduce bloom
            gunFireBloomCurrentMax -= gunFireBloomDecrease;
            if (gunFireBloomCurrentMax <= gunFireBloomMin) {
                gunFireBloomCurrentMax = gunFireBloomMin;
            }
            gunFireBloomCurrent -= gunFireBloomCurrent / 10;
        }
        // Reduce fire delay if delay is bigger than 0
        if (gunFireDelayCurrent > 0) {
            gunFireDelayCurrent--;
        }
        // Reload if empty magazine
        if (gunMagCurrent == 0) {
            gunReloadTimeCurrent++;
            if (gunReloadTimeCurrent >= gunReloadTimeMax) {
                gunMagCurrent = gunMagMax;
                gunReloadTimeCurrent = 0;
            }
        }
    }

    Fire(angle, pos) {
        var color = 'rgb(0, 0, 0'; //GetRandomColor();
        var finalAngle = angle;
        var velocity = { x: Math.cos(ToRad(finalAngle)) * bulletSpeed, y: Math.sin(ToRad(finalAngle)) * bulletSpeed };
        var size = { x: bulletSize.x, y: bulletSize.y };
        new Bullet(pos, velocity, size, color); //new Bullet(pos, velocity, size, color, 0, './assets/img/game/face.png');
    }
}

class Hopper extends GameObject {
    constructor(width, color) {
        super();
        this.pos = { x: 0, y: 0 };
        this.color = color;
        this.columnCount = 4;
        this.rowCount = Math.ceil(gunMagCurrent / this.columnCount);
        this.ammoRadius = 3;
        this.spacing = { x: 10, y: 10 };
        this.size = { x: width, y: this.spacing.y * (this.rowCount + 1) };
    }

    Draw() {
        super.Draw();
        DrawRect(this.pos, this.size, 'black', 0, { x: 0.5, y: 1 });
        for (var i = 0; i < gunMagCurrent; i++) {
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
    constructor() {
        super();
        this.pos = mousePos;
        this.dotRadius = 3;
        this.lineThickness = 3;
        this.lineLength = 20;
        this.lineOffset = 10;
        this.lineOffsetBloomFactor = 5;
        this.showDot = false;
        this.showLines = true;
        this.color = 'black';
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
            var lineOffsets = this.lineOffset + this.lineOffsetBloomFactor * gunFireBloomCurrentMax;
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
