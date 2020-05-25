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
var bulletCapacity = 90; // in bullets
var gravity = 350; // in pixels per second per second
var debugMode = false;

// References
var canvas;
var ctx;
var canvasSize = {x:0, y:0};
var mousePos = {x:500, y:-100};
var mouseDown = false;
var oldTimeStamp = 0;
var deltaTime = 0;
var levelID = 0;

var behaviours = [];
var bullets = [];
var enemies = [];
var projectiles = [];
var levels = [];
var crosshair;
var turret;

$(document).ready(function () {
    Start();
});

function Start() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    turret = new Turret({x:130, y:500}, {min:-60, max:-8}, 100, {x:-90, y:0}, 50, bulletCapacity, 'black', 1, true);
    crosshair = new Crosshair(turret);
    $("#gameCanvas").addClass("noCursor");
    document.addEventListener('mousemove', MouseMove);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mouseup", MouseUp);

    Update(0);

    new Intro(2);
    var level = new Level();
    level.AddShootingTarget({x:700, y:200});
    level = new Level();
    level.AddPlane({x: 1800, y:300});
    level = new Level();
    level.AddFlyingMortar({x: 1500, y:200});
    level = new Level();
    level.AddPlane({x:1800, y:300});
    level.AddFlyingMortar({x:1500, y:200});
    level = new Level();
    level.AddPlane({x:1800, y:300});
    level.AddFlyingMortar({x:1200, y:100});
    level.AddFlyingMortar({x:1500, y:200});
    level = new Level();
    level.AddPlane({x:1800, y:300});
    level.AddFlyingMortar({x:1200, y:100});
    level.AddFlyingMortar({x:1800, y:200});
    level.AddFlyingMortar({x:1500, y:400});
}

function Update(timeStamp) {
    CalculateDeltaTime(timeStamp);
    UpdateCanvasSize();
    if (levels.length > 0) {
        levels[0].Update();
    }

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
    for (var i = projectiles.length - 1; i >= 0; i--) {
        var rocket = projectiles[i];

        if (turret != null && turret.collider.IntersectsWith(rocket.collider)) {
            rocket.Destroy();
            turret.Hit(1);
        }
    }
}

function NextLevel() {
    levels.shift();
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

class Intro {
    constructor(timeLimit) {
        this.tempGunFireBloomMax = gunFireBloomMax;
        this.tempbulletSpeed = bulletSpeed;
        this.tempGravity = gravity;
        this.tempGunFireDelay = gunFireDelay;
        this.tempAngleMinMax = {min:-89, max:-8};
        gunFireBloomMax = 0;
        bulletSpeed = 600;
        gravity = 250;
        gunFireDelay = 0.05;
        this.timeLimit = timeLimit;
        this.timeCurrent = 0;
        this.text = 'Welcome to my websit e!'
        turret.bulletsRemaining = this.text.length;
        levels.push(this);
    }

    Update() {
        this.timeCurrent += deltaTime;

        if (this.text.length > 0) {
            if (turret.CheckFire(this.text.charAt(this.text.length - 1))) {
                this.text = this.text.substring(0, this.text.length - 1);
            }
        }

        if (this.timeCurrent >= this.timeLimit) {
            this.Destroy();
        }
    }

    Destroy() {
        gunFireBloomMax = this.tempGunFireBloomMax;
        bulletSpeed = this.tempbulletSpeed;
        gravity = this.tempGravity;
        gunFireDelay = this.tempGunFireDelay;
        turret.angleMinMax = this.tempAngleMinMax;
        NextLevel();
    }
}

class Level {
    constructor() {
        this.textTimeLength = 3;
        levelID++;
        this.id = levelID;
        levels.push(this);
        this.shootingTargets = [];
        this.flyingMortars = [];
        this.planes = [];
    }

    Update() {
        // spawn level text, when over spawn enemies
        if (this.textTimeLength > 0) {
            this.textTimeLength -= deltaTime;

            if (this.textTimeLength <= 0) {
                this.SpawnEnemies();
            }
        }

        this.Draw();

        if (this.textTimeLength <= 0 && enemies.length <= 0) {
            this.Destroy();
        }
    }

    AddShootingTarget(pos) {
        this.shootingTargets.push(pos);
    }

    AddFlyingMortar(pos) {
        this.flyingMortars.push(pos);
    }

    AddPlane(pos) {
        this.planes.push(pos);
    }

    SpawnEnemies() {
        for (var i = 0; i < this.shootingTargets.length; i++) {
            new ShootingTarget(this.shootingTargets[i], {x:100, y:100}, 25, 'red', 'rgb(230,230,230)');
        }
        for (var i = 0; i < this.flyingMortars.length; i++) {
            new FlyingMortar(this.flyingMortars[i], {x:100, y:100}, 100, 'black');
        }
        for (var i = 0; i < this.planes.length; i++) {
            new Plane(this.planes[i], {x:200, y:50}, 100, 'black');
        }
    }

    Draw() {
        if (this.textTimeLength > 0) {
            DrawText({x:canvasSize.x / 2, y:canvasSize.y / 2}, 'bold 30px Arial', 0, 'Level ' + this.id, 'black');
        }
    }

    Destroy() {
        NextLevel();
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
    constructor(pos, velocity, size, color, maxTimeAlive, angle = 0, src = '', text = '', font = '30px Arial') {
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
        this.text = text;
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
        if (this.text != '') {
            DrawText(this.pos, 'bold 30px Arial', VectorToAngle(this.velocity, {x:0, y:0}), this.text, this.color);
        }
        else if (this.src != '') {
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
        this.collider.Destroy();
        super.Destroy();
    }
}

class Entity extends GameObject {
    constructor(pos, velocity, enableGravity, size, healthPointsMax) {
        super(pos, velocity, enableGravity);
        this.size = size;
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
        this.healthBarSize = {x:60, y:5};
        this.healthPointsMax = healthPointsMax;
        this.healthPoints = this.healthPointsMax;
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();
    }

    Destroy() {
        this.collider.Destroy();
        super.Destroy();
    }

    Hit(damagePoints) {
        this.healthPoints -= damagePoints;
        if (this.healthPoints <= 0) {
            this.Destroy();
        }
    }
}

class Enemy extends Entity {
    constructor(pos, velocity, enableGravity, size, healthPointsMax) {
        super(pos, velocity, enableGravity, size, healthPointsMax);
        enemies.push(this);
    }

    Update() {
        super.Update();
        this.collider.pos = this.pos;
    }

    Draw() {
        super.Draw();

        // Only draw health bar if health is not at max
        if (this.healthPoints < this.healthPointsMax) {
            var healthPos = { x: this.pos.x + 0, y: this.pos.y - this.size.x / 2 - 10 };
            DrawRect(healthPos, { x:this.healthBarSize.x * this.healthPoints / this.healthPointsMax, y:this.healthBarSize.y }, 'green', 0);
        }
    }

    Destroy() {
        var index = enemies.indexOf(this);
        if (index != -1) {
            enemies.splice(index, 1);
        }
        super.Destroy();
    }
}

class ShootingTarget extends Enemy {
    constructor(pos, size, healthPointsMax, color1, color2) {
        super(pos, {x:0, y:0}, false, size, healthPointsMax);
        this.color1 = color1;
        this.color2 = color2;
    }

    Update() {
        super.Update();
    }

    Draw() {
        DrawCircle(this.pos, this.size.x / 2, this.color1);
        DrawCircle(this.pos, this.size.x / 2 * 0.8, this.color2);
        DrawCircle(this.pos, this.size.x / 2 * 0.6, this.color1);
        DrawCircle(this.pos, this.size.x / 2 * 0.4, this.color2);
        DrawCircle(this.pos, this.size.x / 2 * 0.2, this.color1);

        super.Draw();
    }
}

class FlyingMortar extends Enemy {
    constructor(pos, size, healthPointsMax, color) {
        super(pos, {x:0, y:0}, false, size, healthPointsMax);
        this.color = color;
        this.barrelAngle = 190;
        this.rotorWidthMax = 100;
        this.rotorWidthMin = 40;
        this.rotorWidthTime = 1;
        this.rotorWidth = this.rotorWidthMax;
        this.fireDelay = 3;
        this.fireDelayCurrent = this.fireDelay;
        this.barrelSize = {x:65, y:50};
        this.bombSize = {x:50, y:50};
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin(oldTimeStamp / 100)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.velocity = {x:-50, y:0};

        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelayCurrent > 0) {
            this.fireDelayCurrent -= deltaTime;
            if (this.fireDelayCurrent < 0) {
                this.fireDelayCurrent = 0;
                this.Fire();
            }
        }

        // Destroy rocket if off-canvas
        if (IsOffCanvas(this.pos, this.size)) {
            this.Destroy();
        }
    }

    Fire() {
        var projectilePos = { x: this.pos.x + (this.barrelSize.x - this.bombSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (this.barrelSize.x - this.bombSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        //new Bomb(projectilePos, this.barrelAngle, 250, 180, this.bombSize, 10, 'black', './assets/img/game/bomb.png');
        new Rocket(projectilePos, this.barrelAngle, turret, 500, 120, this.bombSize, 10, 'blue', './assets/img/game/missile.png');

        this.fireDelayCurrent = this.fireDelay;
    }

    Draw() {
        DrawCircle(this.pos, this.size.x / 2, this.color);
        DrawRect(this.pos, this.barrelSize, this.color, this.barrelAngle, {x:0, y:0.5});
        DrawRect(this.pos, {x:10, y:60}, this.color, 0, {x:0.5, y:1});
        DrawRect({x:this.pos.x, y:this.pos.y - 60}, {x:this.rotorWidth, y:10}, this.color, 0, {x:0.5, y:1});

        super.Draw();
    }
}

class Plane extends Enemy {
    constructor(pos, size, healthPointsMax, color) {
        super(pos, {x:0, y:0}, false, size, healthPointsMax);
        this.color = color;
        this.angle = 0;
        this.barrelAngle = 90;
        this.rotorWidthMax = 40;
        this.rotorWidthMin = 10;
        this.rotorWidthTime = 1;
        this.rotorWidth = this.rotorWidthMax;
        this.fireDelay = 1;
        this.fireDelayCurrent = this.fireDelay;
        this.barrelSize = {x:30, y:50};
        this.bombSize = {x:50, y:50};
        this.src = './assets/img/game/plane.png'; // Only used for image
        this.image; // Only used for image
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin(oldTimeStamp / 100)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.velocity = {x:-200, y:0};

        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelayCurrent > 0) {
            this.fireDelayCurrent -= deltaTime;
            if (this.fireDelayCurrent < 0) {
                this.fireDelayCurrent = 0;
                this.Fire();
            }
        }

        // Destroy rocket if off-canvas
        if (IsOffCanvas(this.pos, this.size)) {
            this.Destroy();
        }
    }

    Fire() {
        var projectilePos = { x: this.pos.x + (this.barrelSize.x - this.bombSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (this.barrelSize.x - this.bombSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        new Bomb(projectilePos, 180, 190, 180, this.bombSize, 10, 'black', './assets/img/game/bomb.png');
        //new Rocket(projectilePos, this.barrelAngle, turret, 500, 120, this.bombSize, 10, 'blue', './assets/img/game/missile.png');

        this.fireDelayCurrent = this.fireDelay;
    }

    Draw() {
        DrawImage(this.pos, {x:this.size.x, y:this.size.x}, this.angle, this.image);
        DrawRect(this.pos, this.barrelSize, this.color, this.barrelAngle, {x:0, y:0.5});
        var nosePos = {x:this.pos.x - this.size.x / 2, y: this.pos.y};
        DrawRect(nosePos, {x:10, y:5}, this.color, 0, {x:1, y:0.5});
        var propellerPos = {x:nosePos.x - 10, y:nosePos.y};
        DrawRect(propellerPos, {x:5, y:this.rotorWidth}, this.color, 0, {x:1, y:0.5});

        super.Draw();
    }
}

class Projectile extends Enemy {
    constructor(pos, velocity, enableGravity, size, healthPointsMax) {
        super(pos, velocity, enableGravity, size, healthPointsMax);
        projectiles.push(this);
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();
    }

    Destroy() {
        var index = projectiles.indexOf(this);
        if (index != -1) {
            projectiles.splice(index, 1);
        }
        super.Destroy();
    }
}

class Rocket extends Projectile {
    constructor(pos, angle, target, speed, steeringSpeed, size, healthPointsMax, color, src = '') {
        super(pos, AngleToVector(angle, speed), false, size, healthPointsMax);
        this.angle = angle;
        this.size = size;
        this.speed = speed;
        this.target = target;
        this.steeringSpeed = steeringSpeed;
        this.color = color;
        this.src = src; // Only used for image
        this.image; // Only used for image
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
    }

    Update() {
        super.Update();

        // steer the rocket towards the target
        var angleToTarget = VectorToAngle(this.target.pos, this.pos);
        var angleDelta = this.angle - angleToTarget;
        var rotation = this.steeringSpeed * (angleDelta < 0 ? -1 : 1) * deltaTime;

        this.angle -= rotation;
        this.velocity = AngleToVector(this.angle, this.speed);

        // Destroy rocket if off-canvas
        if (IsOffCanvas(this.pos, this.size)) {
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
}

class Bomb extends Projectile {
    constructor(pos, angle, speed, rotationSpeed, size, healthPointsMax, color, src = '') {
        super(pos, AngleToVector(angle, speed), true, size, healthPointsMax);
        this.angle = angle;
        this.size = size;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.rotation = 0;
        this.color = color;
        this.src = src; // Only used for image
        this.image; // Only used for image
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
    }

    Update() {
        super.Update();

        // Rotate bomb
        this.rotation += this.rotationSpeed * deltaTime;

        // Destroy rocket if off-canvas
        if (IsOffCanvas(this.pos, this.size)) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        if (this.src != '') {
            DrawImage(this.pos, this.size, this.rotation, this.image);
        }
        else {
            DrawCircle(this.pos, this.size.x / 2, this.color);
        }
    }
}

class Turret extends Entity {
    constructor(pos, angleMinMax, turretDiameter, hopperOffset, hopperWidth, bulletCapacity, color, healthPointsMax, stickToBottomOfCanvas = false) {
        super(pos, {x:0, y:0}, false, {x:turretDiameter, y:turretDiameter}, healthPointsMax);
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
        this.angleMinMax = angleMinMax;
        this.stickToBottomOfCanvas = stickToBottomOfCanvas;
    }

    Update() {
        super.Update();
        if (this.stickToBottomOfCanvas) {
            this.pos.y = canvasSize.y;
        }
        this.hopper.SetPos({ x: this.pos.x + this.hopperOffset.x, y: this.pos.y + this.hopperOffset.y });

        if (mouseDown) {
            this.CheckFire();
        }

        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelay > 0) {
            this.fireDelay -= deltaTime;
            if (this.fireDelay < 0) {
                this.fireDelay = 0;
            }
        }
        // Reload if empty magazine
        if (this.bulletsRemaining <= 0) {
            this.reloadTime += deltaTime;
            if (this.reloadTime >= gunReloadTimeMax) {
                this.bulletsRemaining = this.bulletCapacity;
                this.reloadTime = 0;
            }
        }
        // Reduce bloom
        if (!mouseDown || this.bulletsRemaining <= 0) {
            this.currentBloomMax -= gunFireBloomDecrease * deltaTime;
            if (this.currentBloomMax <= gunFireBloomMin) {
                this.currentBloomMax = gunFireBloomMin;
            }
            this.currentBloom -= this.currentBloom / 10;
        }
    }

    Draw() {
        super.Draw();
        this.hopper.Draw();
        // Calculate barrel angle
        this.barrelAngle = VectorToAngle(mousePos, this.pos);
        this.barrelAngle = Clamp(this.barrelAngle, this.angleMinMax.min, this.angleMinMax.max);
        this.barrelAngle += this.currentBloom;
        this.barrelAngle = Clamp(this.barrelAngle, this.angleMinMax.min, this.angleMinMax.max);
        // draw
        if (debugMode) {
            var maxBloomMax = VectorToAngle(mousePos, this.pos) + this.currentBloomMax;
            var minBloomMax = VectorToAngle(mousePos, this.pos) - this.currentBloomMax;
            DrawRect(this.pos, {x:10000, y:2}, 'orange', Math.min(this.barrelAngle + this.currentBloomMax * gunFireBloomCurrentStep, maxBloomMax), {x:0, y:0.5});
            DrawRect(this.pos, {x:10000, y:2}, 'orange', Math.max(this.barrelAngle - this.currentBloomMax * gunFireBloomCurrentStep, minBloomMax), {x:0, y:0.5});
            DrawRect(this.pos, {x:10000, y:2}, 'red', maxBloomMax, {x:0, y:0.5});
            DrawRect(this.pos, {x:10000, y:2}, 'red', minBloomMax, {x:0, y:0.5});
            DrawRect(this.pos, {x:10000, y:2}, 'blue', this.barrelAngle, {x:0, y:0.5});
        }
        DrawCircle(this.pos, this.size.x / 2, 'black');
        DrawRect(this.pos, gunBarrelSize, 'black', this.barrelAngle, {x:0, y:0.5});
    }

    CheckFire(text = '') {
        if (this.bulletsRemaining > 0 && this.fireDelay == 0) {
            var pos = { x: this.pos.x + (gunBarrelSize.x - bulletSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
            this.Fire(this.barrelAngle, pos, text);
            return true;
        }
        return false;
    }

    Fire(angle, pos, text) {
        var color = 'rgb(0, 0, 0'; //GetRandomColor();
        var finalAngle = angle;
        var velocity = AngleToVector(finalAngle, bulletSpeed);
        var size = { x: bulletSize.x, y: bulletSize.y };

        if (text != '') {
            new Bullet(pos, velocity, size, color, bulletMaxTimeAlive, finalAngle, '', text);
        }
        else {
            new Bullet(pos, velocity, size, color, bulletMaxTimeAlive); //new Bullet(pos, velocity, size, color, 0, './assets/img/game/face.png');
        }

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

class CircleCollider extends Behaviour {
    constructor(pos, radius) {
        super();
        this.pos = pos;
        this.radius = radius;
        this.colliderType = 1; // 1 = circle
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();

        if (debugMode) {
            DrawCircle(this.pos, this.radius, 'blue');
        }
    }

    Destroy() {
        super.Destroy();
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

function DrawText(pos, font, angle, text, color, textAlign = 'center', textBaseline = 'middle') {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(text, pos.x, pos.y);

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function GetRandomColor() {
    var r = Math.random() * 255;
    var g = Math.random() * 255;
    var b = Math.random() * 255;
    return 'rgb('+r+','+g+','+b+')';
}

function IsOffCanvas(pos, size = {x:0, y:0}, ignoreUp = true) {
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

function AngleToVector(angle, magnitude = 1) {
    return {x:Math.cos(ToRad(angle)) * magnitude, y:Math.sin(ToRad(angle)) * magnitude};
}

function VectorToAngle(vector1, vector2) {
    return ToDeg(Math.atan2(vector1.y - vector2.y,vector1.x - vector2.x));
}
