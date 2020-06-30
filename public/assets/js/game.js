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
var gunReloadTimeMax = 1; // in seconds
var bulletCapacity = 90; // in bullets
var gravity = 350; // in pixels per second per second
var debugMode = false;

// References
var canvasSize = {x:0, y:0};
var mousePos = {x:500, y:-100};
var mouseDown = false;

var canvas;
var ctx;
var behaviours;
var bullets;
var enemies;
var projectiles;
var explosions;
var obstacles;
var levels;
var levelID;
var crosshair;
var turret;
var loop;
var playing;
var oldTimeStamp;
var deltaTime;

$(document).ready(function () {
    // Exit if on mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Exit and enable alternative landing page
        $("#game").addClass('disabled');
        $("#homeMobile").removeClass('disabled');
        return;
    }

    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    $("#gameCanvas").addClass("noCursor");
    document.addEventListener('mousemove', MouseMove);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mouseup", MouseUp);
    loop = false;
    oldTimeStamp = 0;
    deltaTime = 0;

    Start();
});

function Start() {
    behaviours = [];
    bullets = [];
    enemies = [];
    projectiles = [];
    explosions = [];
    obstacles = [];
    levels = [];
    levelID = 0;
    turret = new Turret({x:130, y:500}, {min:-115, max:-8}, 100, {x:-90, y:0}, 50, bulletCapacity, 'black', 3, true);
    crosshair = new Crosshair(turret);
    new Obstacle({x:0, y:-9}, {x:10000, y:20}, 0, 0);
    playing = false;

    // Start update loop if not running
    if (loop == false) {
        loop = true;
        Update(0);
    }

    new Intro(0.5, 2.5);
    var level = new Level();
    level.AddShootingTarget({x:800, y:400});
    level = new Level();
    level.AddPlane({x:1800, y:300});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level = new Level();
    level.AddHelicopter({x:1500, y:200});
    level = new Level();
    level.AddHelicopter({x:1500, y:200});
    level.AddHelicopter({x:1600, y:300});
    level = new Level();
    level.AddHelicopter({x:1500, y:200});
    level.AddPlane({x:1800, y:300});
    level = new Level();
    level.AddPlane({x:1500, y:500});
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level.AddHelicopter({x:1500, y:200});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level.AddHelicopter({x:1500, y:100});
    level.AddHelicopter({x:1600, y:200});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddHelicopter({x:1500, y:100});
    level.AddHelicopter({x:1600, y:200});
    level.AddHelicopter({x:1800, y:300});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level.AddHelicopter({x:1500, y:100});
    level.AddHelicopter({x:1600, y:200});
    level.AddHelicopter({x:1800, y:300});
    level = new Level();
    level.AddPlane({x:1500, y:500});
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:300});
    level.AddHelicopter({x:1500, y:100});
    level.AddHelicopter({x:1600, y:200});
    level.AddHelicopter({x:1800, y:500});
    new Outro(5);
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
    if (loop) {
        requestAnimationFrame(Update);
    }
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
    // Collision between player bullets and enemies and obstacles
    for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];

        for (var j = enemies.length - 1; j >= 0; j--) {
            var enemy = enemies[j];

            if (enemy != null && enemy.collider.IntersectsWith(bullet.collider)) {
                bullet.Hit();
                enemy.Hit(1);
            }
        }

        for (var j = obstacles.length - 1; j >= 0; j--) {
            var obstacle = obstacles[j];

            if (obstacle != null && obstacle.collider.IntersectsWith(bullet.collider)) {
                bullet.Hit();
            }
        }
    }

    // Collision between projectiles and turret and obstacles
    for (var i = projectiles.length - 1; i >= 0; i--) {
        var projectile = projectiles[i];

        if (turret != null && turret.healthPoints > 0 && turret.collider.IntersectsWith(projectile.collider)) {
            projectile.Detonate();
        }

        for (var j = obstacles.length - 1; j >= 0; j--) {
            var obstacle = obstacles[j];

            if (obstacle != null && obstacle.collider.IntersectsWith(projectile.collider)) {
                projectile.Detonate();
            }
        }
    }

    // Collision between explosions and turret
    for (var i = explosions.length - 1; i >= 0; i--) {
        var explosion = explosions[i];

        if (turret != null && turret.healthPoints > 0 && turret.collider.IntersectsWith(explosion.collider) && !explosion.hasDamagedPlayer) {
            explosion.hasDamagedPlayer = true;
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
    constructor(timeBeforeStart, timeBeforeEnd) {
        this.tempGunFireBloomMax = gunFireBloomMax;
        this.tempbulletSpeed = bulletSpeed;
        this.tempGravity = gravity;
        this.tempGunFireDelay = gunFireDelay;
        this.tempAngleMinMax = turret.angleMinMax;
        this.tempGunReloadTimeMax = gunReloadTimeMax;
        gunFireBloomMax = 0;
        bulletSpeed = 600;
        gravity = 250;
        gunFireDelay = 0.05;
        turret.angleMinMax = {min:-60, max:-40};
        gunReloadTimeMax = 4;

        this.timeBeforeStart = timeBeforeStart;
        this.timeBeforeEnd = timeBeforeEnd;
        this.timeCurrent = 0;
        this.text = 'Welcome to my website!'
        turret.bulletsRemaining = this.text.length;
        levels.push(this);
    }

    Update() {
        this.timeCurrent += deltaTime;

        if (this.timeCurrent >= this.timeBeforeStart && this.text.length > 0) {
            if (turret.CheckFire(this.text.charAt(this.text.length - 1))) {
                this.text = this.text.substring(0, this.text.length - 1);
            }
        }

        if (this.timeCurrent >= this.timeBeforeEnd) {
            this.Destroy();
        }
    }

    Destroy() {
        gunFireBloomMax = this.tempGunFireBloomMax;
        bulletSpeed = this.tempbulletSpeed;
        gravity = this.tempGravity;
        gunFireDelay = this.tempGunFireDelay;
        turret.angleMinMax = this.tempAngleMinMax;
        gunReloadTimeMax = this.tempGunReloadTimeMax;
        playing = true;
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
        this.helicopters = [];
        this.megaHelicopters = [];
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

    AddHelicopter(pos) {
        this.helicopters.push(pos);
    }

    AddMegaHelicopter(pos) {
        this.megaHelicopters.push(pos);
    }

    AddPlane(pos) {
        this.planes.push(pos);
    }

    SpawnEnemies() {
        for (var i = 0; i < this.shootingTargets.length; i++) {
            new ShootingTarget(this.shootingTargets[i], {x:100, y:100}, 25, 'red', 'rgb(230,230,230)');
        }
        for (var i = 0; i < this.helicopters.length; i++) {
            new Helicopter(this.helicopters[i], 50, {x:0, y:30}, 'black');
        }
        for (var i = 0; i < this.megaHelicopters.length; i++) {
            new MegaHelicopter(this.megaHelicopters[i], 100, {x:0, y:50}, 'black');
        }
        for (var i = 0; i < this.planes.length; i++) {
            new Plane(this.planes[i], {x:120, y:30}, 50, {x:0, y:-30}, 'black');
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

class Outro {
    constructor(textTimeLengthMax) {
        this.textTimeLengthMax = textTimeLengthMax;
        this.textTimeLength = this.textTimeLengthMax;
        levels.push(this);
    }

    Update() {
        // spawn level text, when over spawn enemies
        if (this.textTimeLength > 0) {
            this.textTimeLength -= deltaTime;
        }

        this.Draw();

        if (this.textTimeLength <= 0) {
            this.Destroy();
        }
    }

    Draw() {
        if (this.textTimeLength > 0) {
            DrawText({x:canvasSize.x / 2, y:canvasSize.y / 2}, 'bold 30px Arial', 0, 'Game completed', 'black');
            DrawRing({x:canvasSize.x / 2, y:canvasSize.y / 2 + 40}, 12, 8, 'black', -this.textTimeLength / this.textTimeLengthMax);
        }
    }

    Destroy() {
        Start();
    }
}

class GameOver {
    constructor(textTimeLengthMax) {
        this.textTimeLengthMax = textTimeLengthMax;
        this.textTimeLength = this.textTimeLengthMax;
        levels = [];
        levels.push(this);
        playing = false;
    }

    Update() {
        // spawn level text, when over spawn enemies
        if (this.textTimeLength > 0) {
            this.textTimeLength -= deltaTime;
        }

        this.Draw();

        if (this.textTimeLength <= 0) {
            this.Destroy();
        }
    }

    Draw() {
        if (this.textTimeLength > 0) {
            DrawText({x:canvasSize.x / 2, y:canvasSize.y / 2}, 'bold 30px Arial', 0, 'Game over', 'black');
            DrawRing({x:canvasSize.x / 2, y:canvasSize.y / 2 + 40}, 12, 8, 'black', -this.textTimeLength / this.textTimeLengthMax);
        }
    }

    Destroy() {
        Start();
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

class Obstacle extends GameObject {
    constructor(pos, size, rotation, colliderType) {
        super(pos, {x:0, y:0}, false);
        this.offsetFromBottom = this.pos.y;
        this.size = size;
        this.rotation = rotation;
        this.collider = colliderType == 0 ? new BoxCollider(this.pos, this.size, this.rotation) : new CircleCollider(this.pos, this.size.x / 2);
        this.stickToBottomOfCanvas = true;
        obstacles.push(this);
    }

    Update() {
        super.Update();

        if (this.stickToBottomOfCanvas) {
            this.pos.y = canvasSize.y - this.offsetFromBottom;
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

    Hit() {
        this.Destroy();
        for (var i = 0; i < 1; i++) {
            var newVelocity = AngleToVector(VectorToAngle({x:0, y:0}, this.velocity) - 90 + Math.random() * 180, (GetMagnitude(this.velocity) / 4));
            new Particle({x:this.pos.x, y:this.pos.y}, newVelocity, {x:this.size.x/2, y:this.size.y/2}, 'black', 0.2, 1, true);
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

class Particle extends GameObject {
    constructor(pos, velocity, size, color, maxTimeAlive, startAlpha, enableGravity) {
        super(pos, velocity, enableGravity);
        this.size = size;
        this.color = color;
        this.maxTimeAlive = maxTimeAlive;
        this.timeAlive = 0;
        this.alphaMax = startAlpha;
    }

    Update() {
        super.Update();
        this.timeAlive += deltaTime;

        // Destroy fragment if over maxTimeAlive
        if (this.timeAlive > this.maxTimeAlive) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        DrawCircle(this.pos, this.size.x / 2, this.color, (1 - (this.timeAlive / this.maxTimeAlive)) * this.alphaMax);
    }

    Destroy() {
        super.Destroy();
    }
}

class Entity extends GameObject {
    constructor(pos, velocity, enableGravity, size, colliderType, healthPointsMax) {
        super(pos, velocity, enableGravity);
        this.size = size;
        this.collider = colliderType == 0 ? new BoxCollider(this.pos, this.size, 0) : new CircleCollider(this.pos, this.size.x / 2);
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
    constructor(pos, velocity, enableGravity, size, colliderType, healthPointsMax, healthPosOffset = {x:0, y:10}) {
        super(pos, velocity, enableGravity, size, colliderType, healthPointsMax);
        this.healthPosOffset = healthPosOffset;
        enemies.push(this);
    }

    Update() {
        super.Update();
        this.collider.pos = this.pos;

        if (IsOffCanvas(this.pos, this.size, true)) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();

        // Only draw health bar if health is not at max
        if (this.healthPoints < this.healthPointsMax) {
            var healthPos = { x: this.pos.x + this.healthPosOffset.x, y: this.pos.y - this.size.x / 2 - this.healthPosOffset.y };
            DrawRect(healthPos, { x:this.healthBarSize.x * this.healthPoints / this.healthPointsMax, y:this.healthBarSize.y }, 'green', 0);
        }
    }

    Hit(damagePoints) {
        super.Hit(damagePoints);
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
        super(pos, {x:0, y:0}, false, size, 1, healthPointsMax);
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

class Helicopter extends Enemy {
    constructor(pos, healthPointsMax, healthPosOffset, color) {
        super(pos, {x:0, y:0}, false, {x:80, y:80}, 1, healthPointsMax, healthPosOffset);
        this.color = color;
        this.barrelAngle = 90;
        this.barrelAngleMin = -20;
        this.barrelAngleMax = 200;
        this.barrelAngleNext = Math.random() * (this.barrelAngleMax - this.barrelAngleMin) + this.barrelAngleMin;
        this.rotorWidthMax = 80;
        this.rotorWidthMin = 10;
        this.rotorWidthTime = 60;
        this.rotorHeight = 50;
        this.rotorThickness = 10;
        this.moveSpeed = 100;
        this.rotorWidth = this.rotorWidthMax;
        this.fireDelay = 4;
        this.fireDelayCurrent = 1 + Math.random() * this.fireDelay;
        this.barrelSize = {x:60, y:40};
        this.bombSize = {x:50, y:50};
        this.minPos = {x:400, y:100};
        this.maxPosMargin = {x:100, y:400};
        this.maxPos = {x:canvasSize.x - this.maxPosMargin.x, y:canvasSize.y - this.maxPosMargin.y};
        this.waypoint = this.pos;
        this.verticalWiggleOffset = Math.random() * 100;
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin(oldTimeStamp / this.rotorWidthTime)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.Move();

        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelayCurrent > 0 && playing) {
            this.fireDelayCurrent -= deltaTime;
            this.barrelAngle += (this.barrelAngleNext - this.barrelAngle) * this.fireDelay * deltaTime;
            if (this.fireDelayCurrent < 0) {
                this.fireDelayCurrent = 0;
                this.Fire();
            }
        }
    }

    Fire() {
        var projectilePos = { x: this.pos.x + (this.barrelSize.x - this.bombSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (this.barrelSize.x - this.bombSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        new Rocket(projectilePos, this.barrelAngle, turret, 500, 120, this.bombSize, 6, 'blue', './assets/img/game/missile.png');

        this.fireDelayCurrent = this.fireDelay;
        this.barrelAngleNext = Math.random() * (this.barrelAngleMax - this.barrelAngleMin) + this.barrelAngleMin;
    }

    Move() {
        var vector = {x:this.waypoint.x - this.pos.x, y:this.waypoint.y - this.pos.y};
        var vectorMagnitude = 0;
        if (vector.x != 0 || vector.y != 0) {
            vectorMagnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        }

        if (vectorMagnitude <= this.size.x) {
            this.FindNewWaypoint();
        }
        else {
            var verticalWiggle = Math.sin(oldTimeStamp / 300 + this.verticalWiggleOffset) * 40;
            var targetVelocity = {x:vector.x / vectorMagnitude * this.moveSpeed, y:vector.y / vectorMagnitude * this.moveSpeed + verticalWiggle};
            var deltaX = Clamp(targetVelocity.x - this.velocity.x, -1, 1);
            var deltaY = Clamp(targetVelocity.y - this.velocity.y, -1, 1);
            this.velocity = {x:this.velocity.x + deltaX, y:this.velocity.y + deltaY};
        }
    }

    FindNewWaypoint() {
        this.maxPos = {x:canvasSize.x - this.maxPosMargin.x, y:canvasSize.y - this.maxPosMargin.y};
        this.waypoint = {x:this.minPos.x + Math.random() * (this.maxPos.x - this.minPos.x), y:this.minPos.y + Math.random() * (this.maxPos.y - this.minPos.y)};
    }

    Draw() {
        if (debugMode) {
            //var pos = {x:(this.maxPos.x - this.minPos.x) / 2 + this.minPos.x, y:(this.maxPos.y - this.minPos.y) / 2 + this.minPos.y};
            //var size = {x:this.maxPos.x - this.minPos.x, y:this.maxPos.y - this.minPos.y};
            //DrawRect(pos, size, 'green', 0);

            DrawCircle(this.waypoint, 25, 'red', 1);
        }

        DrawCircle(this.pos, this.size.x / 2, this.color);
        DrawRect(this.pos, this.barrelSize, this.color, this.barrelAngle, {x:0, y:0.5});
        DrawRect(this.pos, {x:this.rotorThickness, y:this.rotorHeight}, this.color, 0, {x:0.5, y:1});
        DrawRect({x:this.pos.x, y:this.pos.y - this.rotorHeight + 1}, {x:this.rotorWidth, y:this.rotorThickness}, this.color, 0, {x:0.5, y:1});

        super.Draw();
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 'black', 1);
        super.Destroy();
    }
}

class MegaHelicopter extends Helicopter {
    constructor(pos, healthPointsMax, healthPosOffset, color) {
        super(pos, healthPointsMax, healthPosOffset, color);
        this.size = {x:150, y:150};
        this.collider.radius = 75;
        this.barrelSize = {x:100, y:50};
        this.rotorWidthMax = 150;
        this.rotorWidthMin = Math.sqrt(Math.pow(this.rotorWidthMax, 2) / 2);
        this.rotorWidthTime = 45;
        this.rotorHeight = 85;
        this.rotorThickness = 15;
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();
    }
}

class Plane extends Enemy {
    constructor(pos, size, healthPointsMax, healthPosOffset, color) {
        super(pos, {x:0, y:0}, false, size, 0, healthPointsMax, healthPosOffset);
        this.color = color;
        this.angle = 180;
        this.barrelAngle = 90;
        this.rotorWidthMax = 30;
        this.rotorWidthMin = 5;
        this.rotorWidthTime = 40;
        this.rotorWidth = this.rotorWidthMax;
        this.fireDelay = 1;
        this.fireDelayCurrent = 1 + Math.random() * this.fireDelay;
        this.barrelSize = {x:30, y:50};
        this.bombSize = {x:50, y:50};
        this.rotationSpeed = 90; // degrees per second
        this.movementSpeed = 200;
        this.src = './assets/img/game/plane.png'; // Only used for image
        this.image; // Only used for image
        this.src2 = './assets/img/game/plane2.png'; // Only used for image2
        this.imageWings; // Only used for image2
        this.isTurning = false;
        if (this.src != '') {
            this.image = new Image();
            this.image.src = this.src;
        }
        if (this.src2 != '') {
            this.image2 = new Image();
            this.image2.src = this.src2;
        }
    }

    Update() {
        super.Update();
        this.collider.angle = this.angle;
        this.rotorWidth = Math.abs(Math.sin(oldTimeStamp / this.rotorWidthTime)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.velocity = AngleToVector(this.angle, this.movementSpeed);

        // Reduce fire delay if delay is bigger than 0
        if (this.fireDelayCurrent > 0 && playing && !this.isTurning && this.angle > 90 && this.angle < 270) {
            this.fireDelayCurrent -= deltaTime;
            if (this.fireDelayCurrent < 0) {
                this.fireDelayCurrent = 0;
                this.Fire();
            }
        }

        // Start turning when close to edge
        if ((this.pos.x < 300 && this.angle != 0) || (this.pos.x > canvasSize.x - 600 && this.angle != 180)) {
            this.isTurning = true;
            this.Turn();
        }
        else {
            this.isTurning = false;
        }
    }

    Fire() {
        var projectilePos = { x: this.pos.x + (this.barrelSize.x - this.bombSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (this.barrelSize.x - this.bombSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        new Bomb(projectilePos, this.angle, 190, 180, 90, this.bombSize, 5, 'black', './assets/img/game/bomb.png');
        //new Rocket(projectilePos, this.barrelAngle, turret, 500, 120, this.bombSize, 10, 'blue', './assets/img/game/missile.png');

        this.fireDelayCurrent = this.fireDelay;
    }

    Draw() {
        // Draw plane
        var scale = this.angle < 90 || this.angle > 270 ? {x:1, y:-1} : {x:1, y:1};
        var minAngle = Math.min(this.angle % 180, 180 - (this.angle % 180));
        var thicknessSide = Math.cos(minAngle / 90 * Math.PI / 2) * this.size.x;
        DrawImage(this.pos, {x:this.size.x, y:thicknessSide}, this.angle + 180, this.image, {x:0.5, y:0.5}, scale);
        var thicknessWings = Math.sin(minAngle / 90 * Math.PI / 2) * this.size.x;
        DrawImage(this.pos, {x:this.size.x, y:thicknessWings}, this.angle + 180, this.image2, {x:0.5, y:0.5}, scale);

        // Draw barrel
        var barrelThickness = Math.cos(minAngle / 90 * Math.PI / 2) * this.barrelSize.x;
        var barrelAngle = this.angle < 90 || this.angle > 270 ? this.angle + this.barrelAngle : this.angle - this.barrelAngle;
        DrawRect(this.pos, {x:barrelThickness, y:this.barrelSize.y}, this.color, barrelAngle, {x:0, y:0.5});

        // Draw propellor
        var nosePos = {x:this.pos.x + Math.cos(ToRad(this.angle)) * (this.size.x / 2), y:this.pos.y + Math.sin(ToRad(this.angle)) * (this.size.x / 2)};
        var propellerPos = {x:nosePos.x + Math.cos(ToRad(this.angle)) * 5, y:nosePos.y + Math.sin(ToRad(this.angle)) * 5};
        DrawRect(nosePos, {x:5, y:5}, this.color, this.angle, {x:0.5, y:0.5});
        DrawRect(propellerPos, {x:5, y:this.rotorWidth}, this.color, this.angle, {x:0.5, y:0.5});

        super.Draw();
    }

    Turn() {
        this.angle += this.rotationSpeed * deltaTime;
        this.angle = ClampAngle(this.angle);
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 'black', 1);
        super.Destroy();
    }
}

class Projectile extends Enemy {
    constructor(pos, velocity, enableGravity, size, healthPointsMax) {
        super(pos, velocity, enableGravity, size, 1, healthPointsMax);
        projectiles.push(this);
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();
    }

    Hit(damagePoints) {
        super.Hit(damagePoints);
    }

    Detonate() {
        var index = projectiles.indexOf(this);
        if (index != -1) {
            projectiles.splice(index, 1);
        }
        this.Destroy(false);
    }

    Destroy(spawnExplosion = true) {
        if (spawnExplosion) {
            new Explosion(this.pos, this.size.x / 2 + 10, 'black', 1);
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
        this.targetOffset = {x:0, y:-40};
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

        new Particle({x:this.pos.x, y:this.pos.y}, {x:0, y:0}, {x:15, y:15}, 'black', 0.5, 0.2, false);

        // steer the rocket towards the target
        var targetPos = {x:this.target.pos.x + this.targetOffset.x, y:this.target.pos.y + this.targetOffset.y};
        var angleToTarget = VectorToAngle(targetPos, this.pos);
        var angleDelta = this.angle - angleToTarget;
        var rotation = this.steeringSpeed * (angleDelta < 0 ? -1 : 1) * deltaTime;

        this.angle -= rotation;
        this.angle = ClampAngle(this.angle);
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

    Detonate() {
        new Explosion({x:this.pos.x, y:this.pos.y}, 50, 'black', 1);
        super.Detonate();
    }
}

class Bomb extends Projectile {
    constructor(pos, angle, speed, rotationSpeed, rotation, size, healthPointsMax, color, src = '') {
        super(pos, AngleToVector(angle, speed), true, size, healthPointsMax);
        this.angle = angle;
        this.size = size;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.rotation = rotation;
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

    Detonate() {
        new Explosion({x:this.pos.x, y:this.pos.y}, 80, 'black', 1);
        super.Detonate();
    }
}

class Explosion extends GameObject {
    constructor(pos, maxRadius, color, maxTimeAlive) {
        super(pos, {x:0, y:0}, false);
        this.maxRadius = maxRadius;
        this.radius = 0;
        this.color = color;
        this.timeToGrow = 0.1;
        this.maxTimeAlive = this.timeToGrow + maxTimeAlive;
        this.timeAlive = 0;
        this.collider = new CircleCollider(this.pos, this.radius);
        this.hasDamagedPlayer = false;
        explosions.push(this);
    }

    Update() {
        super.Update();
        this.timeAlive += deltaTime;

        this.radius = this.maxRadius * Math.sin(Clamp(this.timeAlive / this.timeToGrow, 0, 1) * Math.PI * 0.5);
        this.collider.radius = this.radius;

        // Destroy explosion if over maxTimeAlive
        if (this.timeAlive > this.maxTimeAlive) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        var alpha = Math.cos(this.timeAlive / this.maxTimeAlive * Math.PI * 0.5);
        DrawCircle(this.pos, this.radius, this.color, alpha);
    }

    Destroy() {
        var index = explosions.indexOf(this);
        if (index != -1) {
            explosions.splice(index, 1);
        }
        this.collider.Destroy();
        super.Destroy();
    }
}

class Turret extends Entity {
    constructor(pos, angleMinMax, turretDiameter, hopperOffset, hopperWidth, bulletCapacity, color, healthPointsMax, stickToBottomOfCanvas = false) {
        super(pos, {x:0, y:0}, false, {x:turretDiameter, y:turretDiameter}, 1, healthPointsMax);
        this.color = color;
        this.bulletCapacity = bulletCapacity;
        this.bulletsRemaining = this.bulletCapacity;
        this.hitInvulnerabilityDurationMax = 2;
        this.hitInvulnerabilityBlinkInterval = 0.1;
        this.hitInvulnerabilityDuration = 0;
        this.hopper = new Hopper(hopperWidth, hopperOffset, color, this);
        this.healthBar = new HealthBar({x:hopperWidth, y:15}, {x:0, y:0}, this, this.hopper);
        this.fireDelay = 0;
        this.reloadTime = 0;
        this.currentBloom = 0;
        this.currentBloomMax = 0;
        this.barrelAngle = 0;
        this.angleMinMax = angleMinMax;
        this.stickToBottomOfCanvas = stickToBottomOfCanvas;
        this.alpha = 1;
    }

    Update() {
        super.Update();
        if (this.stickToBottomOfCanvas) {
            this.pos.y = canvasSize.y;
        }

        if (mouseDown && playing) {
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

        // Blink if hit
        if (this.hitInvulnerabilityDuration > 0) {
            this.hitInvulnerabilityDuration -= deltaTime;
            this.alpha = Math.sin(this.hitInvulnerabilityDuration * Math.PI / this.hitInvulnerabilityBlinkInterval) > 0.3 ? 1 : 0;
        }
        if (this.hitInvulnerabilityDuration < 0) {
            this.hitInvulnerabilityDuration = 0;
            this.alpha = 1;
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
        DrawCircle(this.pos, this.size.x / 2, 'black', this.alpha);
        DrawRect(this.pos, gunBarrelSize, 'black', this.barrelAngle, {x:0, y:0.5}, this.alpha);
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
        var color = 'rgb(0, 0, 0)'; //GetRandomColor();
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

    Destroy() {
        new GameOver(5);
        new Explosion({x:this.pos.x, y:this.pos.y}, 100, 'black', 1);
        super.Destroy();
    }

    Hit(damagePoints) {
        // Only get hit if we didn't get hit in the last 2 seconds
        if (this.hitInvulnerabilityDuration <= 0) {
            super.Hit(damagePoints);
            this.hitInvulnerabilityDuration = this.hitInvulnerabilityDurationMax;
        }
    }
}

class Hopper extends GameObject {
    constructor(width, offsetFromTurret, color, turret) {
        super({x:0, y:0}, {x:0, y:0});
        this.color = color;
        this.columnCount = 6;
        this.turret = turret;
        this.offsetFromTurret = offsetFromTurret;
        this.rowCount = Math.ceil(turret.bulletCapacity / this.columnCount);
        this.ammoRadius = 2;
        this.spacing = { x: 6, y: 6 };
        this.size = { x: width, y: this.spacing.y * (this.rowCount + 1) };
    }

    Update() {
        super.Update();
        this.pos = {x:this.turret.pos.x + this.offsetFromTurret.x, y:this.turret.pos.y - this.offsetFromTurret.y};
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

class HealthBar extends GameObject {
    constructor(size, offsetFromHopper, turret, hopper) {
        super({x:0, y:0}, {x:0, y:0});
        this.size = size;
        this.offsetFromHopper = offsetFromHopper;
        this.margin = 5;
        this.padding = 1;
        this.turret = turret;
        this.hopper = hopper;
    }

    Update() {
        super.Update();
        this.pos = {x:this.hopper.pos.x + this.offsetFromHopper.x, y:this.hopper.pos.y - this.hopper.size.y + this.offsetFromHopper.y};
    }

    Draw() {
        super.Draw();
        DrawRect(this.pos, this.size, 'black', 0, {x:0.5, y:1});
        var healthBarStartPos = {x:this.pos.x - this.size.x / 2 + this.margin, y:this.pos.y};
        var healthBarWidth = this.size.x - 2 * this.margin;
        var healthBlobWidth = (healthBarWidth - (this.padding * (this.turret.healthPointsMax - 1))) / this.turret.healthPointsMax; // single health blob

        for (var i = 0; i < this.turret.healthPointsMax; i++) {
            var color = i < this.turret.healthPoints ? 'white' : 'rgb(51, 51, 51)';
            var posX = healthBarStartPos.x + (i * (healthBlobWidth + this.padding));
            DrawRect({x:posX, y:healthBarStartPos.y}, {x:healthBlobWidth, y:this.size.y - this.margin}, color, 0, {x:0, y:1});
        }
    }
}

class Crosshair extends GameObject {
    constructor(turret) {
        super(mousePos, {x:0, y:0});
        this.pos = mousePos;
        this.dotRadius = 3;
        this.lineThickness = 3;
        this.lineLength = 20;
        this.lineOffset = 16;
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
        if (this.turret.reloadTime > 0 && playing) {
            DrawRing(this.pos, this.lineOffset - this.lineThickness * 2, this.lineThickness, 'black', this.turret.reloadTime / gunReloadTimeMax);
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
            return IntersectCircleRectangle(this.pos, this.radius, collider.pos, collider.size, collider.angle); // CircleRect
        }
        else {
            var distance = Math.sqrt(Math.pow(this.pos.x - collider.pos.x, 2) + Math.pow(this.pos.y - collider.pos.y, 2));
            return distance < this.radius + collider.radius; // CircleCircle
        }
    }
}

class BoxCollider extends Behaviour {
    constructor(pos, size, angle, anchor = {x:0.5, y:0.5}) {
        super();
        this.pos = pos; // calc using anchor & angle
        this.size = size;
        this.angle = angle;
        this.colliderType = 0; // 0 = box
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();

        if (debugMode) {
            DrawRect(this.pos, this.size, 'blue', this.angle);
        }
    }

    Destroy() {
        super.Destroy();
    }

    IntersectsWith(collider) {
        if (collider.colliderType == 0) {
            return false; // RectRect
        }
        else {
            return IntersectCircleRectangle(collider.pos, collider.radius, this.pos, this.size, this.angle); // CircleRect
        }
    }
}

////////////////////////////////////////
//         Utility functions          //
////////////////////////////////////////

function DrawRing(pos, radius, lineWidth, color, percentage = 1) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.arc(pos.x, pos.y, radius, -0.5 * Math.PI, (-0.5 + (percentage * 2)) * Math.PI);
    ctx.stroke();

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawCircle(pos, radius, color, alpha = 1) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.beginPath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawImage(pos, size, angle, image, anchor={x:0.5, y:0.5}, scale={x:1, y:1}, alpha = 1) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.scale(scale.x, scale.y);
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, pos.x - size.x * anchor.x, pos.y - size.y * anchor.y, size.x, size.y);
    ctx.globalAlpha = 1;

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawRect(pos, size, color, angle, anchor={x:0.5, y:0.5}, alpha = 1) {
    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(pos.x - size.x * anchor.x, pos.y - size.y * anchor.y, size.x, size.y);
    ctx.globalAlpha = 1;

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

// Return if given circle and given rectangle intersect
function IntersectCircleRectangle(circleCenter, circleRadius, rectPos, rectSize, rectAngleCircle) {
    var angleInRad = ToRad(rectAngleCircle);
    var vertex1 = {x:-rectSize.x / 2, y:-rectSize.y / 2};
    var vertex2 = {x:rectSize.x / 2, y:-rectSize.y / 2};
    var vertex3 = {x:rectSize.x / 2, y:rectSize.y / 2};
    var vertex4 = {x:-rectSize.x / 2, y:rectSize.y / 2};
    vertex1 = {x:rectPos.x + vertex1.x * Math.cos(angleInRad) - vertex1.y * Math.sin(angleInRad), y:rectPos.y + vertex1.x * Math.sin(angleInRad) + vertex1.y * Math.cos(angleInRad)};
    vertex2 = {x:rectPos.x + vertex2.x * Math.cos(angleInRad) - vertex2.y * Math.sin(angleInRad), y:rectPos.y + vertex2.x * Math.sin(angleInRad) + vertex2.y * Math.cos(angleInRad)};
    vertex3 = {x:rectPos.x + vertex3.x * Math.cos(angleInRad) - vertex3.y * Math.sin(angleInRad), y:rectPos.y + vertex3.x * Math.sin(angleInRad) + vertex3.y * Math.cos(angleInRad)};
    vertex4 = {x:rectPos.x + vertex4.x * Math.cos(angleInRad) - vertex4.y * Math.sin(angleInRad), y:rectPos.y + vertex4.x * Math.sin(angleInRad) + vertex4.y * Math.cos(angleInRad)};

    return (pointInRectangle(circleCenter, vertex1, vertex2, vertex3, vertex4) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex1, vertex2) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex2, vertex3) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex3, vertex4) ||
            IntersectCircleLine(circleCenter, circleRadius, vertex4, vertex1));
}

// Return if given point is in the area of the rectangle of given 4 vertices
function pointInRectangle(point, vertex1, vertex2, vertex3, vertex4) {
	return pointInTriangle(vertex1, vertex2, vertex3, point) || pointInTriangle(vertex3, vertex4, vertex1, point);
}

// Return if given point is in the area of the triangle of given 3 vertices
function pointInTriangle(vertex1, vertex2, vertex3, point) {
    var side1 = onSameSide(point,vertex1, vertex2,vertex3);
    var side2 = onSameSide(point,vertex2, vertex1,vertex3);
    var side3 = onSameSide(point,vertex3, vertex1,vertex2);
    return side1 && side2 && side3;
}

// Return if given points 1 and 2 are on the same side of given line
function onSameSide(point1, point2, lineStart, lineEnd) {
    var px = lineEnd.x-lineStart.x;
    var py = lineEnd.y-lineStart.y;
	var l = Crossproduct(px,py,  point1.x-lineStart.x, point1.y-lineStart.y);
    var m = Crossproduct(px,py,  point2.x-lineStart.x, point2.y-lineStart.y);

    return l * m >= 0;
}

// Return if given circle C with radius R intersects with given line from A to B
function IntersectCircleLine(C, R, A, B) {
    // Calculate distance AB
    var lengthAB = Math.sqrt( Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2) );

    // Calculate Vector AB normalized called D
    var D = {x:(B.x - A.x) / lengthAB, y:(B.y - A.y) / lengthAB};

    // t is 'x' in function of line AB: ax+b
    var t = D.x * (C.x - A.x) + D.y * (C.y - A.y);

    // Calculate vector AE called E (E is the point of AB closest the circle center (Cx, Cy))
    var E = {x:t * D.x + A.x, y:t * D.y + A.y};

    // Calculate distances EC, AE and BE
    var lengthEC = Math.sqrt( Math.pow(E.x - C.x, 2) + Math.pow(E.y - C.y, 2) );
    var lengthAE = Math.sqrt( Math.pow(A.x - E.x, 2) + Math.pow(A.y - E.y, 2) );
    var lengthBE = Math.sqrt( Math.pow(B.x - E.x, 2) + Math.pow(B.y - E.y, 2) );

    // E is outside of AB on B side, and shortest distance is BC
    if (lengthAE > lengthAB) {
        var lengthBC = Math.sqrt( Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2) );
        return lengthBC <= R;
    }
    // E is outside of AB on A side, and shortest distance is AC
    else if (lengthBE > lengthAB) {
        var lengthAC = Math.sqrt( Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2) );
        return lengthAC <= R;
    }
    // E is inside AB, and shortest distance is EC
    else {
        return lengthEC <= R;
    }
}

// Convert angle from degrees to radians
function ToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Convert angle from radians to degrees
function ToDeg(radians) {
    return radians / Math.PI * 180;
}

// Clamp value between min and max
function Clamp(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}

// Clamp angle to value between 0 360
function ClampAngle(angle) {
    if (angle < 0) {
        angle += 360;
    }
    if (angle > 360) {
        angle -= 360;
    }
    return angle;
}

// Convert angle to vector with given magnitude
function AngleToVector(angle, magnitude = 1) {
    return {x:Math.cos(ToRad(angle)) * magnitude, y:Math.sin(ToRad(angle)) * magnitude};
}

// Return angle between two given vectors
function VectorToAngle(vector1, vector2) {
    return ToDeg(Math.atan2(vector1.y - vector2.y,vector1.x - vector2.x));
}

function GetMagnitude(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

// Return dot product of given two vectors
function Dot(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
}

// Return cross product of given two vectors
function Crossproduct(x1,y1, x2,y2) {
    return x1*y2 - y1*x2;
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
