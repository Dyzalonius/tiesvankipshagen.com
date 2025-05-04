////////////////////////////////////////
//       Variables & Game loop        //
////////////////////////////////////////

// Settings
var bulletMaxTimeAlive = 30; // in seconds
var bulletSpeed = 1000; // in pixels per second
var bulletSize = {x:10, y:10};
var gunBarrelSize = {x:100, y:25};
var gunFireDelay = 0.01; // in seconds
var gunFireBloomMin = 0; // in degrees
var gunFireBloomMax = 20; // in degrees
var gunFireBloomCurrentStep = 0.04; // in percentages
var gunFireBloomIncrease = 1; // in degrees per bullet
var gunFireBloomDecrease = 30; // in degrees per second
var gunReloadTimeMax = 1; // in seconds
var bulletCapacity = 120; // in bullets
var gravity = 350; // in pixels per second per second
var introDuration = 1;
var debugMode = false;
var enemySpawnAnimationDuration = .5;
var enemySpawnAnimationDelayStep = .05;
var firstLevelStartDelay = .5;
var levelEndDelay = 1.5;
var layerTop = 2;
var layerDefault = 1;
var layerBottom = 0;
var primaryColor = '#111111';
var secondaryColor = '#EFEFEF';
var imageAlpha = 1;

// References
var canvasSize = {x:0, y:0};
var mousePos = {x:130, y:2000};
var mouseDocPos = {x: 130, y:2000};
var scrollPos = {x:0, y:0};
var scrollPosAtLastMouseMove = {x:0, y:0};
var mouseDown = false;
var enableCursor = false;

var canvas;
var ctx;
var computedStyle;
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
    computedStyle = getComputedStyle(document.body);
    document.addEventListener('mousemove', OnMouseMove);
    document.addEventListener('scroll', OnMouseScroll);
    canvas.addEventListener("mousedown", MouseDown);
    canvas.addEventListener("mouseup", MouseUp);
    document.addEventListener('keydown',KeyDown,false);
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
    turret = new Turret({x:130, y:0}, {min:8, max:115}, 100, {x:-90, y:0}, 50, bulletCapacity, 3);
    crosshair = new Crosshair(turret);
    new Obstacle({x:0, y:-9}, {x:10000, y:20}, 0, 0);
    playing = true;

    // Start update loop if not running
    if (loop == false) {
        loop = true;
        Update(0);
    }

    var level = new Level(firstLevelStartDelay);
    var startX = 300;
    var deltaX = 80;
    level.AddImageCopter({x:900 , y:500}, './assets/img/img_portrait.png');
    level.AddLettercopter({x:1200, y: 525}, "Ties van Kipshagen", "Game designer");
    var word = "HELLO!";
    for (var i = 0; i < word.length; i++) {
        level.AddLettercopter({x:startX + deltaX * i, y:500}, word[i]);
    }
    level = new Level();
    level.AddPlane({x:1800, y:500});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level = new Level();
    level.AddHelicopter({x:1500, y:600});
    level = new Level();
    level.AddHelicopter({x:1500, y:600});
    level.AddHelicopter({x:1600, y:500});
    level = new Level();
    level.AddHelicopter({x:1500, y:600});
    level.AddPlane({x:1800, y:500});
    level = new Level();
    level.AddPlane({x:1500, y:300});
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level.AddHelicopter({x:1500, y:600});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level.AddHelicopter({x:1500, y:700});
    level.AddHelicopter({x:1600, y:500});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddHelicopter({x:1500, y:700});
    level.AddHelicopter({x:1600, y:600});
    level.AddHelicopter({x:1800, y:500});
    level = new Level();
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level.AddHelicopter({x:1500, y:700});
    level.AddHelicopter({x:1600, y:600});
    level.AddHelicopter({x:1800, y:500});
    level = new Level();
    level.AddPlane({x:1500, y:300});
    level.AddPlane({x:1700, y:400});
    level.AddPlane({x:1900, y:500});
    level.AddHelicopter({x:1500, y:700});
    level.AddHelicopter({x:1600, y:600});
    level.AddHelicopter({x:1800, y:300});
    new Outro(5);
}

function Update(timeStamp) {
    CalculateDeltaTime(timeStamp);
    UpdateCanvasSize();
    UpdateColors();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (levels.length > 0) {
        levels[0].Update();
    }

    // Update and draw
    for (var i = behaviours.length - 1; i >= 0; i--) {
        behaviours[i].Update();
    }
    for (var layer = 0; layer < 3; layer++) {
        for (var i = behaviours.length - 1; i >= 0; i--) {
            if (behaviours[i].layer == layer) {
                behaviours[i].Draw();
            }
        }
    }

    CheckCollision();

    // Recursive call Update()
    if (loop) {
        requestAnimationFrame(Update);
    }
}

function CalculateDeltaTime(timeStamp) {
    deltaTime = (timeStamp - oldTimeStamp) / 1000;
    if (deltaTime > 0.1) {
        deltaTime = 0.1;
    }
    oldTimeStamp = timeStamp;
}

function UpdateCanvasSize() {
    if (canvasSize.x > 0 && canvasSize.y > 0 && canvasSize.x == $('#gameCanvas').width() && canvasSize.y == $('#gameCanvas').height()) { return; }
    canvasSize = {x:$('#gameCanvas').width(), y:$('#gameCanvas').height()};
    $('#gameCanvas').attr({
        width: canvasSize.x,
        height: canvasSize.y
    });
}

function UpdateColors() {
    primaryColor = computedStyle.getPropertyValue('--color-game-primary');
    secondaryColor = computedStyle.getPropertyValue('--color-game-secondary');
    imageAlpha = computedStyle.getPropertyValue('--image-alpha')
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

class Behaviour {
    constructor() {
        behaviours.push(this);
        this.layer = layerDefault;
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

class Level {
    constructor(startDelay = 0) {
        levelID++;
        this.id = levelID;
        levels.push(this);
        this.lettercopters = [];
        this.lettercopterwords = [];
        this.lettercopterwords2 = [];
        this.imagecopters = [];
        this.imagecoptersources = [];
        this.helicopters = [];
        this.planes = [];
        this.enemiesHaveSpawned = false;
        this.lifeTime = 0;
        this.startDelay = startDelay;
        this.endDelay = levelEndDelay;
        this.endTimer = 0;
    }

    Update() {
        this.lifeTime += deltaTime;
        if (this.lifeTime >= this.startDelay && !this.enemiesHaveSpawned) {
            this.SpawnEnemies();
        }
        if (this.enemiesHaveSpawned && enemies.length <= 0) {
            this.endTimer += deltaTime;
            if (this.endTimer > this.endDelay) {
                this.Destroy();
            }
        }

        this.Draw();
    }

    Draw() {
        var alpha = this.id == 1 ? Clamp((this.lifeTime - firstLevelStartDelay * 2) / .2, 0, 1) * .1 : .1;
        DrawRect({x:40, y:canvasSize.y - 40}, {x:50,y:50}, primaryColor, 0, {x:0.5, y:0.5}, alpha);
        DrawText({x:40, y:canvasSize.y - 30}, 'bold 15px Trebuchet MS', 0, "LVL", secondaryColor);
        DrawText({x:40, y:canvasSize.y - 50}, 'bold 15px Trebuchet MS', 0, this.id + "/" + levelID, secondaryColor);
    }

    AddLettercopter(pos, word, word2 = '') {
        this.lettercopters.push(pos);
        this.lettercopterwords.push(word);
        this.lettercopterwords2.push(word2);
    }

    AddImageCopter(pos, src) {
        this.imagecopters.push(pos);
        this.imagecoptersources.push(src);
    }

    AddHelicopter(pos) {
        this.helicopters.push(pos);
    }

    AddPlane(pos) {
        this.planes.push(pos);
    }

    SpawnEnemies() {
        var enemyCount = this.lettercopters.length + this.helicopters.length + this.planes.length + this.imagecopters.length;
        var enemyIndices = [];
        for (var i = 0; i < enemyCount; i++) {
            enemyIndices.push(i);
        }

        for (var i = 0; i < this.lettercopters.length; i++) {
            new Lettercopter(this.lettercopters[i], 5 + this.lettercopterwords[i].length, {x:0, y:40}, RemoveRandom(enemyIndices), this.lettercopterwords[i], this.lettercopterwords2[i]);
        }
        for (var i = 0; i < this.imagecopters.length; i++) {
            new Imagecopter(this.imagecopters[i], 50, {x:0, y:40}, RemoveRandom(enemyIndices), this.imagecoptersources[i]);
        }
        for (var i = 0; i < this.helicopters.length; i++) {
            new Helicopter(this.helicopters[i], 50, {x:0, y:30}, RemoveRandom(enemyIndices));
        }
        for (var i = 0; i < this.planes.length; i++) {
            new Plane(this.planes[i], {x:120, y:30}, 50, {x:0, y:20}, RemoveRandom(enemyIndices));
        }
        this.enemiesHaveSpawned = true;
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
            DrawText({x:canvasSize.x / 2, y:canvasSize.y / 2}, 'bold 30px Trebuchet MS', 0, 'You win!', this.color);
            DrawRing({x:canvasSize.x / 2, y:canvasSize.y / 2 + 40}, 12, 8, this.color, -this.textTimeLength / this.textTimeLengthMax);
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
            DrawText({x:canvasSize.x / 2, y:canvasSize.y / 2}, 'bold 30px Trebuchet MS', 0, 'Game over', this.color);
            DrawRing({x:canvasSize.x / 2, y:canvasSize.y / 2 + 40}, 12, 8, this.color, -this.textTimeLength / this.textTimeLengthMax);
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
        this.lifeTime = 0;
        this.pauseMovement = false;
    }

    Update() {
        super.Update();

        this.lifeTime += deltaTime;

        if (this.pauseMovement) { return; }
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;
        if (this.enableGravity) {
            this.velocity.y -= gravity * deltaTime;
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
        obstacles.push(this);
    }

    Update() {
        super.Update();
    }

    Draw() {
        super.Draw();
    }

    Destroy() {
        super.Destroy();
    }
}

class Bullet extends GameObject {
    constructor(pos, velocity, size, maxTimeAlive) {
        super(pos, velocity, true);
        this.size = size; // Only x is used for circle
        this.collider = new CircleCollider(this.pos, this.size.x / 2);
        this.timeAlive = 0;
        this.maxTimeAlive = maxTimeAlive;
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
        DrawCircle(this.pos, {x:this.size.x / 2, y:this.size.y / 2}, primaryColor);
    }

    Hit() {
        this.Destroy();
        for (var i = 0; i < 1; i++) {
            var newVelocity = AngleToVector(VectorToAngle({x:0, y:0}, this.velocity) - 90 + Math.random() * 180, (GetMagnitude(this.velocity) / 4));
            new Particle({x:this.pos.x, y:this.pos.y}, newVelocity, {x:this.size.x/2, y:this.size.y/2}, 0.2, 1, true);
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
    constructor(pos, velocity, size, maxTimeAlive, startAlpha, enableGravity, nerfXVelocity = false) {
        super(pos, velocity, enableGravity);
        this.size = size;
        this.maxTimeAlive = maxTimeAlive;
        this.timeAlive = 0;
        this.alphaMax = startAlpha;
        this.nerfXVelocity = nerfXVelocity;
    }

    Update() {
        super.Update();
        this.timeAlive += deltaTime;

        if (this.nerfXVelocity) {
            this.velocity.x = Lerp(this.velocity.x, 0, 0.1);
        }

        // Destroy fragment if over maxTimeAlive
        if (this.timeAlive > this.maxTimeAlive) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        DrawCircle(this.pos, {x:this.size.x / 2, y:this.size.y / 2}, primaryColor, (1 - (this.timeAlive / this.maxTimeAlive)) * this.alphaMax);
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
    constructor(pos, velocity, enableGravity, size, colliderType, hasSpawnAnimation, enemyIndex, healthPointsMax, healthPosOffset = {x:0, y:10}) {
        super(pos, velocity, enableGravity, size, colliderType, healthPointsMax);
        this.healthPosOffset = healthPosOffset;
        this.enemyIndex = enemyIndex;
        enemies.push(this);

        this.isSpawning = hasSpawnAnimation;
        if (hasSpawnAnimation) {
            this.pauseMovement = true;
            new SpawnAnimation({x:this.pos.x, y:this.pos.y}, enemySpawnAnimationDuration, enemyIndex * enemySpawnAnimationDelayStep, this.size.x * 0.75);
        }
    }

    Update() {
        super.Update();
        this.collider.pos = this.pos;

        if (this.isSpawning && this.lifeTime >= enemySpawnAnimationDuration + this.enemyIndex * enemySpawnAnimationDelayStep) {
            this.isSpawning = false;
            this.pauseMovement = false;
        }
    }

    Draw() {
        super.Draw();

        if (this.isSpawning) { return; }
        // Only draw health bar if health is not at max
        if (this.healthPoints < this.healthPointsMax) {
            var healthPos = { x: this.pos.x + this.healthPosOffset.x, y: this.pos.y + this.size.y / 2 + this.healthPosOffset.y };
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

class Helicopter extends Enemy {
    constructor(pos, healthPointsMax, healthPosOffset, enemyIndex) {
        super(pos, {x:0, y:0}, false, {x:80, y:80}, 1, true, enemyIndex, healthPointsMax, healthPosOffset);
        this.angle = 0;
        this.angleMax = 8;
        this.angleVelocityMax = 100;
        this.barrelAngle = -90;
        this.barrelAngleMin = -200;
        this.barrelAngleMax = 20;
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
        this.minPos = {x:400, y:400};
        this.maxPos = {x:1800, y:700};
        this.waypoint = this.pos;
        this.verticalWiggleOffset = Math.random() * Math.PI * 2;
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin(oldTimeStamp / this.rotorWidthTime)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.Move();
        this.angle = Clamp(-this.velocity.x / this.angleVelocityMax, -1, 1) * this.angleMax;

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
        new Rocket(projectilePos, this.barrelAngle + this.angle, turret, 500, 120, this.bombSize, 6);

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
            var verticalWiggle = Math.sin(oldTimeStamp / 300 + this.verticalWiggleOffset) * 30;
            var targetVelocity = {x:vector.x / vectorMagnitude * this.moveSpeed, y:vector.y / vectorMagnitude * this.moveSpeed + verticalWiggle};
            var deltaX = Clamp(targetVelocity.x - this.velocity.x, -1, 1);
            var deltaY = Clamp(targetVelocity.y - this.velocity.y, -1, 1);
            this.velocity = {x:this.velocity.x + deltaX, y:this.velocity.y + deltaY};
        }
    }

    FindNewWaypoint() {
        this.waypoint = {x:this.minPos.x + Math.random() * (this.maxPos.x - this.minPos.x), y:this.minPos.y + Math.random() * (this.maxPos.y - this.minPos.y)};
    }

    Draw() {
        if (this.isSpawning) { return; }
        if (debugMode) {
            var pos = {x:(this.maxPos.x - this.minPos.x) / 2 + this.minPos.x, y:(this.maxPos.y - this.minPos.y) / 2 + this.minPos.y};
            var size = {x:this.maxPos.x - this.minPos.x, y:this.maxPos.y - this.minPos.y};
            DrawRect(pos, size, 'green', 0);

            DrawCircle(this.waypoint, {x:25, y:25}, 'red', 1);
        }

        DrawCircle(this.pos, {x:this.size.x / 2, y:this.size.y / 2}, primaryColor);
        DrawRect(this.pos, this.barrelSize, primaryColor, this.angle + this.barrelAngle, {x:0, y:0.5});

        // Rotor
        DrawRect(this.pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, this.angle, {x:0.5, y:1});
        var rotorPos = {x:this.pos.x + Math.sin(ToRad(-this.angle)) * (this.rotorHeight - 1), y:this.pos.y + Math.cos(ToRad(-this.angle)) * (this.rotorHeight - 1)};
        DrawRect(rotorPos, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, this.angle, {x:0.5, y:.5});

        super.Draw();
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 1);
        super.Destroy();
    }
}

class Lettercopter extends Enemy {
    constructor(pos, healthPointsMax, healthPosOffset, enemyIndex, word, word2) {
        var size = {x: 50 + word.length * 15, y: 60};
        super(pos, {x:0, y:0}, false, size, 0, true, enemyIndex, healthPointsMax, healthPosOffset);
        this.word = word;
        this.rotorWidthMax = 80;
        this.rotorWidthMin = 10;
        this.rotorWidthTime = 60;
        this.rotorHeight = 50;
        this.rotorThickness = 10;
        this.rotorWidth = this.rotorWidthMax;
        this.sinOffset = Math.random() * 5000;
        this.word2 = word2;
        this.sling = null;
        if (this.word2 != '') {
            this.sling = new Lettercoptersling({x: this.pos.x, y: this.pos.y - 70}, 5 + this.word2.length, {x: 0, y: 5}, this.enemyIndex, this.word2, this);
        }
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin((oldTimeStamp + this.sinOffset) / this.rotorWidthTime)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.Move();
    }

    Move() {
        var verticalWiggle = Math.sin((oldTimeStamp + this.sinOffset) / 300) * 30;
        var targetVelocity = {x:0, y:verticalWiggle};
        var deltaX = Clamp(targetVelocity.x - this.velocity.x, -1, 1);
        var deltaY = Clamp(targetVelocity.y - this.velocity.y, -1, 1);
        this.velocity = {x:this.velocity.x + deltaX, y:this.velocity.y + deltaY};
    }

    Draw() {
        if (this.isSpawning) { return; }

        if (this.word2 == '') {
            //rotor
            DrawRect(this.pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, 0, {x:0.5, y:1});
            DrawRect({x:this.pos.x, y:this.pos.y + this.rotorHeight - 1}, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, 0, {x:0.5, y:1});
        } else {
            //rotor1
            var rotor1Pos = {x:this.pos.x - this.size.x / 2 * 0.8, y:this.pos.y};
            DrawRect(rotor1Pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, 0, {x:0.5, y:1});
            DrawRect({x:rotor1Pos.x, y:rotor1Pos.y + this.rotorHeight - 1}, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, 0, {x:0.5, y:1});

            //rotor2
            var rotor2Pos = {x:this.pos.x + this.size.x / 2 * 0.8, y:this.pos.y};
            DrawRect(rotor2Pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, 0, {x:0.5, y:1});
            DrawRect({x:rotor2Pos.x, y:rotor2Pos.y + this.rotorHeight - 1}, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, 0, {x:0.5, y:1});
        }
        DrawRect(this.pos, {x:this.size.x, y:this.size.y}, primaryColor, 0);
        DrawRect(this.pos, {x:this.size.x - 5, y:this.size.y - 5}, secondaryColor, 0);
        DrawText(this.pos, 'bold 30px Trebuchet MS', 0, this.word, primaryColor);

        super.Draw();
    }

    Destroy() {
        if (this.sling != null) {
            this.sling.Detach();
        }
        new Explosion(this.pos, this.size.x / 2 + 40, 1);
        super.Destroy();
    }
}

class Lettercoptersling extends Enemy {
    constructor(pos, healthPointsMax, healthPosOffset, enemyIndex, word, lettercopter) {
        var size = {x: 50 + word.length * 15, y: 60};
        super(pos, {x:0, y:0}, false, size, 0, true, enemyIndex, healthPointsMax, healthPosOffset);
        this.word = word;
        this.lettercopter = lettercopter;
        this.sinOffset = lettercopter.sinOffset;
        projectiles.push(this);
    }

    Update() {
        super.Update();
        this.Move();
    }

    Move() {
        if (this.lettercopter != null) {
            var verticalWiggle = Math.sin((oldTimeStamp + this.sinOffset) / 300) * 30;
            var targetVelocity = {x:0, y:verticalWiggle};
            var deltaX = Clamp(targetVelocity.x - this.velocity.x, -1, 1);
            var deltaY = Clamp(targetVelocity.y - this.velocity.y, -1, 1);
            this.velocity = {x:this.velocity.x + deltaX, y:this.velocity.y + deltaY};
        }
    }

    Detach() {
        this.enableGravity = true;
        this.lettercopter = null;
    }

    Detonate() {
        var index = projectiles.indexOf(this);
        if (index != -1) {
            projectiles.splice(index, 1);
        }
        this.Destroy();
    }

    Draw() {
        if (this.isSpawning) { return; }

        // draw slings
        if (this.lettercopter != null) {
            DrawRect({x:this.pos.x - this.size.x / 2 + 20, y:this.pos.y}, {x:2.5, y:this.size.y + 20}, primaryColor, 0, {x:.5, y:1});
            DrawRect({x:this.pos.x + this.size.x / 2 - 20, y:this.pos.y}, {x:2.5, y:this.size.y + 20}, primaryColor, 0, {x:.5, y:1});
        }

        DrawRect(this.pos, {x:this.size.x, y:this.size.y}, primaryColor, 0);
        DrawRect(this.pos, {x:this.size.x - 5, y:this.size.y - 5}, secondaryColor, 0);
        DrawText(this.pos, 'bold 30px Trebuchet MS', 0, this.word, primaryColor);

        super.Draw();
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 1);
        super.Destroy();
    }
}

class Imagecopter extends Enemy {
    constructor(pos, healthPointsMax, healthPosOffset, enemyIndex, src) {
        super(pos, {x:0, y:0}, false, {x:200, y:200}, 0, true, enemyIndex, healthPointsMax, healthPosOffset);
        this.image;
        if (src != '') {
            this.image = new Image();
            this.image.src = src;
        }
        this.rotorWidthMax = 120;
        this.rotorWidthMin = 10;
        this.rotorWidthTime = 50;
        this.rotorHeight = this.size.y / 2 + 20;
        this.rotorThickness = 10;
        this.rotorWidth = this.rotorWidthMax;
        this.sinOffset = Math.random() * 5000;
        this.verticalWiggleOffset = Math.random() * Math.PI * 2;
    }

    Update() {
        super.Update();
        this.rotorWidth = Math.abs(Math.sin((oldTimeStamp + this.sinOffset) / this.rotorWidthTime)) * (this.rotorWidthMax - this.rotorWidthMin) + this.rotorWidthMin;

        this.Move();
    }

    Move() {
        var verticalWiggle = Math.sin((oldTimeStamp + this.sinOffset) / 300) * 30;
        var targetVelocity = {x:0, y:verticalWiggle};
        var deltaX = Clamp(targetVelocity.x - this.velocity.x, -1, 1);
        var deltaY = Clamp(targetVelocity.y - this.velocity.y, -1, 1);
        this.velocity = {x:this.velocity.x + deltaX, y:this.velocity.y + deltaY};
    }

    Draw() {
        if (this.isSpawning) { return; }

        //rotor1
        var rotor1Pos = {x:this.pos.x - this.size.x / 2 * 0.8, y:this.pos.y};
        DrawRect(rotor1Pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, 0, {x:0.5, y:1});
        DrawRect({x:rotor1Pos.x, y:rotor1Pos.y + this.rotorHeight - 1}, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, 0, {x:0.5, y:1});

        //rotor2
        var rotor2Pos = {x:this.pos.x + this.size.x / 2 * 0.8, y:this.pos.y};
        DrawRect(rotor2Pos, {x:this.rotorThickness, y:this.rotorHeight}, primaryColor, 0, {x:0.5, y:1});
        DrawRect({x:rotor2Pos.x, y:rotor2Pos.y + this.rotorHeight - 1}, {x:this.rotorWidth, y:this.rotorThickness}, primaryColor, 0, {x:0.5, y:1});

        //image
        DrawRect(this.pos, {x:this.size.x, y:this.size.x}, primaryColor, 0);
        DrawImage(this.pos, {x:this.size.x - 5, y:this.size.x - 5}, 0, this.image, {x:.5, y:.5}, {x:1, y:1}, imageAlpha);

        super.Draw();
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 1);
        super.Destroy();
    }
}

class Plane extends Enemy {
    constructor(pos, size, healthPointsMax, healthPosOffset, enemyIndex) {
        super(pos, {x:0, y:0}, false, size, 0, true, enemyIndex, healthPointsMax, healthPosOffset);
        this.angle = 180;
        this.barrelAngle = -90;
        this.rotorWidthMax = 30;
        this.rotorWidthMin = 5;
        this.rotorWidthTime = 40;
        this.rotorWidth = this.rotorWidthMax;
        this.fireDelay = 1;
        this.fireDelayCurrent = 1 + Math.random() * this.fireDelay;
        this.barrelSize = {x:30, y:50};
        this.bombSize = {x:40, y:40};
        this.rotationSpeedMax = -135; // degrees per second
        this.rotationSpeedMin = -15; // degrees per second
        this.rotationSpeed = 0;
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
        if (this.fireDelayCurrent > 0) {
            this.fireDelayCurrent -= deltaTime;
        }

        // Check fire
        if (this.fireDelayCurrent < 0 && playing && this.angle > 90 && this.angle < 270 && !this.isTurning) {
            this.fireDelayCurrent = 0;
            this.Fire();
        }

        // Start turning when close to edge
        if ((this.pos.x < 300 && this.angle != 0) || (this.pos.x > 1300 && this.angle != 180)) {
            this.isTurning = true;
            this.Turn();
        }
        else {
            this.isTurning = false;
        }
    }

    Fire() {
        var projectilePos = { x: this.pos.x + (this.barrelSize.x - this.bombSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (this.barrelSize.x - this.bombSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        new Bomb(projectilePos, this.angle, 190, 180, this.bombSize, 5);

        this.fireDelayCurrent = this.fireDelay;
    }

    Draw() {
        if (this.isSpawning) { return; }
        // Draw plane
        var minAngle = Math.min(this.angle % 180, 180 - (this.angle % 180));
        var thicknessSide = Math.cos(minAngle / 90 * Math.PI / 2) * this.size.x;
        var thicknessWings = Math.sin(minAngle / 90 * Math.PI / 2) * this.size.x;

        var rotationVector = AngleToVector(this.angle);
        var wingPos = {x:this.pos.x, y:this.pos.y};
        DrawRect(wingPos, {x:this.size.x * .3, y:thicknessWings}, primaryColor, this.angle, {x:.5, y:.5});
        var cockpitPos = {x:this.pos.x + rotationVector.x * this.size.x * .19, y:this.pos.y + rotationVector.y * this.size.x * .19};
        var cockpitAnchorY = this.angle < 90 || this.angle > 270 ? .2 : .8;
        DrawCircle(cockpitPos, {x:this.size.x * .12, y:thicknessSide * .12}, primaryColor, 1, -this.angle, {x:.5, y:cockpitAnchorY});
        var noseConePos = {x:this.pos.x + rotationVector.x * this.size.x * .37, y:this.pos.y + rotationVector.y * this.size.x * .37};
        DrawCircle(noseConePos, {x:this.size.x * .12, y:thicknessSide * .12}, primaryColor, 1, -this.angle, {x:.5, y:.5});
        var bodyPos = {x:this.pos.x + rotationVector.x * this.size.x * .05, y:this.pos.y + rotationVector.y * this.size.x * .05};
        DrawRect(bodyPos, {x:this.size.x * .65, y:thicknessSide / this.size.x * this.size.y}, primaryColor, this.angle, {x:.5, y:.5});
        DrawRect(this.pos, {x:this.size.x, y:thicknessWings / this.size.x * this.size.y * .75}, primaryColor, this.angle, {x:.5, y:.5});
        var tailPos = {x:this.pos.x - rotationVector.x * this.size.x * .382, y:this.pos.y - rotationVector.y * this.size.x * .382};
        var tailAnchorY = this.angle < 90 || this.angle > 270 ? .95 : 0.05;
        DrawRect(tailPos, {x:this.size.x * .23, y:thicknessSide * .22}, primaryColor, this.angle, {x:.5, y:tailAnchorY});
        var tailConnectorPos = {x:this.pos.x - rotationVector.x * this.size.x * .35, y:this.pos.y - rotationVector.y * this.size.x * .35};
        var tailConnectorAnchorY = this.angle < 90 || this.angle > 270 ? .6 : 0.4;
        var tailConnectorAngle = this.angle < 90 || this.angle > 270 ? this.angle - 25 : this.angle + 25;
        DrawRect(tailConnectorPos, {x:this.size.x * .25, y:thicknessSide * .2}, primaryColor, tailConnectorAngle, {x:.5, y:tailConnectorAnchorY});


        // Draw barrel
        var barrelThickness = Math.cos(minAngle / 90 * Math.PI / 2) * this.barrelSize.x;
        var barrelAngle = this.angle < 90 || this.angle > 270 ? this.angle + this.barrelAngle : this.angle - this.barrelAngle;
        DrawRect(this.pos, {x:barrelThickness, y:this.barrelSize.y}, primaryColor, barrelAngle, {x:0, y:0.5});

        // Draw propellor
        var nosePos = {x:this.pos.x + Math.cos(ToRad(this.angle)) * (this.size.x / 2), y:this.pos.y + Math.sin(ToRad(this.angle)) * (this.size.x / 2)};
        var propellerPos = {x:nosePos.x + Math.cos(ToRad(this.angle)) * 5, y:nosePos.y + Math.sin(ToRad(this.angle)) * 5};
        DrawRect(nosePos, {x:5, y:5}, primaryColor, this.angle, {x:0.5, y:0.5});
        DrawRect(propellerPos, {x:5, y:this.rotorWidth}, primaryColor, this.angle, {x:0.5, y:0.5});

        super.Draw();
    }

    Turn() {
        var minAngle = Math.min(this.angle % 180, 180 - (this.angle % 180));
        this.rotationSpeed = this.rotationSpeedMin + Math.sin(minAngle / 90 * Math.PI / 2) * this.rotationSpeedMax;
        this.angle += this.rotationSpeed * deltaTime;
        this.angle = ClampAngle(this.angle);
    }

    Destroy() {
        new Explosion(this.pos, this.size.x / 2 + 40, 1);
        super.Destroy();
    }
}

class Projectile extends Enemy {
    constructor(pos, velocity, enableGravity, size, healthPointsMax) {
        super(pos, velocity, enableGravity, size, 1, false, -1, healthPointsMax);
        projectiles.push(this);
    }

    Update() {
        super.Update();
    }

    Draw() {
        if (this.isSpawning) { return; }
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
            new Explosion(this.pos, this.size.x / 2 + 10, 1);
        }
        super.Destroy();
    }
}

class Rocket extends Projectile {
    constructor(pos, angle, target, speed, steeringSpeed, size, healthPointsMax) {
        super(pos, AngleToVector(angle, speed), false, size, healthPointsMax);
        this.angle = angle;
        this.size = size;
        this.speed = speed;
        this.target = target;
        this.targetOffset = {x:0, y:40};
        this.steeringSpeed = steeringSpeed;
        this.randomAngle = 0;
        this.randomOffsetSpeed = 0;
        this.randomAngleSpeed = 0;
    }

    Update() {
        super.Update();

        var particleVelocity = AngleToVector(this.angle + Math.random() * 50 - 25, 50);
        new Particle({x:this.pos.x, y:this.pos.y}, particleVelocity, {x:15, y:15}, 0.5, 0.2, false);

        // steer the rocket towards the target
        var targetPos = {x:this.target.pos.x + this.targetOffset.x, y:this.target.pos.y + this.targetOffset.y};
        var angleToTarget = VectorToAngle(targetPos, this.pos);

        var angleDelta = angleToTarget - this.angle;
        var rotation = this.steeringSpeed * (angleDelta < 0 ? 1 : -1) * deltaTime;

        this.angle -= rotation;
        this.angle = ClampAngle(this.angle);
        this.velocity = AngleToVector(this.angle, this.speed);
    }

    Draw() {
        if (this.isSpawning) { return; }

        var rotationVector = AngleToVector(this.angle);
        var tipPos = {x: this.pos.x + rotationVector.x * this.size.x * .3, y: this.pos.y + rotationVector.y * this.size.y * 0.3};
        DrawCircle(tipPos, {x:this.size.x * .2, y:this.size.x * .2}, primaryColor);
        var centerPos = {x: this.pos.x - rotationVector.x * this.size.x * .1, y: this.pos.y - rotationVector.y * this.size.y * .1};
        DrawRect(centerPos, {x:this.size.x * .7, y:this.size.y * .4}, primaryColor, this.angle, {x:0.5, y:0.5});
        var rearPos = {x: this.pos.x - rotationVector.x * this.size.x * .3, y: this.pos.y - rotationVector.y * this.size.y * .3};
        DrawRect(rearPos, {x:this.size.x * .15, y:this.size.y * .3}, primaryColor, this.angle - 30, {x:.5, y:0});
        DrawRect(rearPos, {x:this.size.x * .15, y:this.size.y * .3}, primaryColor, this.angle + 30, {x:.5, y:1});

        super.Draw();
    }

    Detonate() {
        new Explosion({x:this.pos.x, y:this.pos.y}, 70, 1);
        super.Detonate();
    }
}

class Bomb extends Projectile {
    constructor(pos, angle, speed, rotationSpeed, size, healthPointsMax) {
        super(pos, AngleToVector(angle, speed), true, size, healthPointsMax);
        this.angle = angle;
        this.size = size;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
    }

    Update() {
        super.Update();

        // Rotate bomb
        this.angle += this.rotationSpeed * deltaTime;
    }

    Draw() {
        if (this.isSpawning) { return; }
        DrawCircle(this.pos, {x:this.size.x / 2, y:this.size.y / 2}, primaryColor);
        var rotationVector = AngleToVector(this.angle);
        DrawRect({x:this.pos.x + rotationVector.x * this.size.x / 2, y:this.pos.y + rotationVector.y * this.size.x / 2}, {x:10, y: 10}, primaryColor, this.angle, {x:0.5, y:0.5});
        super.Draw();
    }

    Detonate() {
        new Explosion({x:this.pos.x, y:this.pos.y}, 80, 1);
        super.Detonate();
    }
}

class Explosion extends GameObject {
    constructor(pos, maxRadius, maxTimeAlive) {
        super(pos, {x:0, y:0}, false);
        this.maxRadius = maxRadius;
        this.radius = 0;
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
        if (this.isSpawning) { return; }
        super.Draw();
        var alpha = Math.cos(this.timeAlive / this.maxTimeAlive * Math.PI * 0.5);
        DrawCircle(this.pos, {x:this.radius, y:this.radius}, primaryColor, alpha);
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

class SpawnAnimation extends GameObject {
    constructor(pos, duration, delay, maxRadius) {
        super(pos, {x:0, y:0}, false);
        this.duration = duration;
        this.delay = delay;
        this.maxRadius = maxRadius;
        this.fadeOutDuration = .1;
        this.layer = layerTop;
    }

    Update() {
        super.Update();
        if (this.lifeTime >= this.duration + this.delay + this.fadeOutDuration) {
            this.Destroy();
        }
    }

    Draw() {
        super.Draw();
        var radius = 0;
        if (this.lifeTime <= this.duration + this.delay) {
            radius = Clamp(((1-Math.cos(Math.max(this.lifeTime - this.delay, 0) / this.duration * Math.PI * 0.5)) + Math.abs(Math.sin(this.lifeTime * 30) * .2)) * this.maxRadius, 0, 10000);
        } else {
            radius = Math.cos((this.lifeTime - this.duration - this.delay) / this.fadeOutDuration * Math.PI * 0.25) * this.maxRadius;
        }
        var alpha = Math.cos(Math.max(this.lifeTime - this.delay - this.duration, 0) / this.fadeOutDuration * Math.PI * 0.5);
        DrawCircle(this.pos, {x:radius, y:radius}, primaryColor, alpha);
    }

    Destroy() {
        super.Destroy();
    }
}

function EaseOutCubic(currentTime, start, end, duration) {
    return (start - end) * Math.pow(1 - currentTime / duration, 3);
}

function EaseInCubic(currentTime, start, end, duration) {
    return (end - start) * Math.pow(1 - currentTime / duration, 3);
}

function EaseInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

class Turret extends Entity {
    constructor(pos, angleMinMax, turretDiameter, hopperOffset, hopperWidth, bulletCapacity, healthPointsMax) {
        super({x:pos.x, y:pos.y - 150}, {x:0, y:0}, false, {x:turretDiameter, y:turretDiameter}, 1, healthPointsMax);
        this.bulletCapacity = bulletCapacity;
        this.bulletsRemaining = this.bulletCapacity;
        this.hitInvulnerabilityDurationMax = 2;
        this.hitInvulnerabilityBlinkInterval = 0.1;
        this.hitInvulnerabilityDuration = 0;
        this.hopper = new Hopper(hopperWidth, hopperOffset, this);
        this.healthBar = new HealthBar({x:hopperWidth, y:15}, {x:0, y:0}, this, this.hopper);
        this.fireDelay = 0;
        this.reloadTime = 0;
        this.currentBloom = 0;
        this.currentBloomMax = 0;
        this.targetBarrelAngle = 45;
        this.barrelAngle = 45;
        this.angleMinMax = angleMinMax;
        this.alpha = 1;
        this.isReloading = false;
        this.isSpawning = true;
        this.canFire = false;
        this.realHeight = pos.y;
        this.spawnProgress = -2;
        this.layer = layerTop;
        this.wind = 0;
        this.windAcceleration = 0;
        this.timeSinceLastBullet = 0;
        this.timeSpentFiring = 0;
        this.bulletSpawnPos = {x:0, y:0};
    }

    Update() {
        super.Update();
        if (this.isSpawning) {
            this.spawnProgress += deltaTime;
            this.pos.y = EaseOutCubic(Clamp(this.spawnProgress, 0, introDuration), this.realHeight - 150, this.realHeight, introDuration);
            if (!enableCursor && this.spawnProgress > introDuration - 1) {
                EnableCursor();
            }
            if (!this.canFire && this.spawnProgress > introDuration - 0.5) {
                this.canFire = true;
            }
            if (this.pos.y >= this.realHeight) {
                this.pos.y = this.realHeight;
                this.isSpawning = false;
            }
        }

        // Ideal barrel angle calculation
        var bulletSpawnPos = { x: this.pos.x + (gunBarrelSize.x - bulletSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
        var barrelAngleIdeal = VectorToAngle(mousePos, this.pos, false);
        var distanceToCrosshair = {x:mousePos.x - bulletSpawnPos.x, y:mousePos.y - bulletSpawnPos.y};
        var speedSquared = bulletSpeed * bulletSpeed;
        var discriminant = speedSquared * speedSquared - gravity * (gravity * distanceToCrosshair.x * distanceToCrosshair.x + 2 * distanceToCrosshair.y * speedSquared);
        if (discriminant > 0) {
            var root = Math.sqrt(discriminant);
            var candidateAngle = Math.atan((speedSquared - root) / (gravity * distanceToCrosshair.x));
            var distanceToTurretBase = Math.sqrt(Math.pow(this.pos.x - mousePos.x, 2) + Math.pow(this.pos.y - mousePos.y, 2));
            if (candidateAngle > 0 && mousePos.y >= 0 && distanceToTurretBase > 200) {
                barrelAngleIdeal = ToDeg(candidateAngle);
            }
        }

        // Calculate barrel angle
        this.targetBarrelAngle = MoveTowards(this.targetBarrelAngle, barrelAngleIdeal, deltaTime * 270);
        this.barrelAngle = this.targetBarrelAngle;
        this.barrelAngle = Clamp(this.barrelAngle, this.angleMinMax.min, this.angleMinMax.max);
        this.barrelAngle += this.currentBloom;
        this.barrelAngle = Clamp(this.barrelAngle, this.angleMinMax.min, this.angleMinMax.max);

        this.timeSinceLastBullet += deltaTime;
        this.windAcceleration += (Math.random() - 0.5) * 2;
        if (this.windAcceleration < -50 || this.windAcceleration > 50) {
            this.windAcceleration = 0;
        }
        this.windAcceleration = Clamp(this.windAcceleration, -50, 50);
        this.wind += this.windAcceleration;
        if (this.wind <= -50 || this.wind >= 50) {
            this.windAcceleration = 0;
            this.wind = Clamp(this.wind, -50, 50);
        }
        if (this.timeSinceLastBullet > .7 && this.timeSpentFiring > 0) {
            this.timeSpentFiring -= deltaTime * 2;
        }
        if (this.timeSpentFiring > 1) {
            var pos = { x: this.pos.x + (gunBarrelSize.x - bulletSize.x / 4) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
            new Particle(pos, {x:this.wind, y:150}, {x:10, y:10}, 1, Clamp(this.timeSpentFiring - 1, 0, 1) * 0.05, false, true);
        }

        if (this.canFire && mouseDown && playing) {
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
        if (this.bulletsRemaining <= 0 && !this.isReloading) {
            this.Reload();
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

        // Handle reloading
        if (this.isReloading) {
            this.reloadTime += deltaTime;
            if (this.reloadTime >= gunReloadTimeMax) {
                this.bulletsRemaining = this.bulletCapacity;
                this.reloadTime = 0;
                this.isReloading = false;
            }
        }
    }

    Draw() {
        super.Draw();
        this.hopper.Draw();

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
        DrawCircle(this.pos, {x:this.size.x / 2, y:this.size.x / 2}, primaryColor, this.alpha);
        DrawRect(this.pos, gunBarrelSize, primaryColor, this.barrelAngle, {x:0, y:0.5}, this.alpha);
    }

    CheckFire() {
        if (this.bulletsRemaining > 0 && this.fireDelay == 0) {
            var pos = { x: this.pos.x + (gunBarrelSize.x - bulletSize.x / 2) * Math.cos(ToRad(this.barrelAngle)), y: this.pos.y + (gunBarrelSize.x - bulletSize.y / 2) * Math.sin(ToRad(this.barrelAngle)) };
            this.Fire(this.barrelAngle, pos);
            return true;
        }
        return false;
    }

    Fire(angle, pos) {
        this.timeSinceLastBullet = 0;
        if (this.timeSinceLastBullet < 0.1 && this.timeSpentFiring < 3) {
            this.timeSpentFiring += deltaTime;
        }

        var color = this.color;
        var finalAngle = angle;
        var velocity = AngleToVector(finalAngle, bulletSpeed);
        var size = { x: bulletSize.x, y: bulletSize.y };
        new Bullet(pos, velocity, size, bulletMaxTimeAlive);

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
        new Explosion({x:this.pos.x, y:this.pos.y}, 100, 1);
        super.Destroy();
    }

    Hit(damagePoints) {
        // Only get hit if we didn't get hit in the last 2 seconds
        if (this.hitInvulnerabilityDuration <= 0) {
            super.Hit(damagePoints);
            this.hitInvulnerabilityDuration = this.hitInvulnerabilityDurationMax;
        }
    }

    Reload() {
        this.bulletsRemaining = 0;
        this.isReloading = true;
    }
}

class Hopper extends GameObject {
    constructor(width, offsetFromTurret, turret) {
        super({x:0, y:0}, {x:0, y:0});
        this.columnCount = 6;
        this.turret = turret;
        this.offsetFromTurret = offsetFromTurret;
        this.rowCount = Math.ceil(turret.bulletCapacity / this.columnCount);
        this.ammoRadius = 2;
        this.spacing = { x: 6, y: 6 };
        this.size = { x: width, y: this.spacing.y * (this.rowCount + 1) };
        this.layer = layerTop;
    }

    Update() {
        super.Update();
        this.pos = {x:this.turret.pos.x + this.offsetFromTurret.x, y:this.turret.pos.y + this.offsetFromTurret.y};
    }

    Draw() {
        super.Draw();
        DrawRect(this.pos, this.size, primaryColor, 0, { x: 0.5, y: 1 });
        for (var i = 0; i < this.turret.bulletsRemaining; i++) {
            var rowN = Math.floor(i / this.columnCount);
            var columnN = i % this.columnCount;
            var strangevarthing = columnN + 0.5 - this.columnCount / 2;
            var pos = { x: this.pos.x - strangevarthing * this.spacing.x, y: this.pos.y + (rowN + 1) * this.spacing.y };
            DrawCircle(pos, {x:this.ammoRadius, y:this.ammoRadius}, secondaryColor);
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
        this.pos = {x:this.hopper.pos.x + this.offsetFromHopper.x, y:this.hopper.pos.y + this.hopper.size.y + this.offsetFromHopper.y};
    }

    Draw() {
        super.Draw();
        DrawRect(this.pos, this.size, primaryColor, 0, {x:0.5, y:1});
        var healthBarStartPos = {x:this.pos.x - this.size.x / 2 + this.margin, y:this.pos.y};
        var healthBarWidth = this.size.x - 2 * this.margin;
        var healthBlobWidth = (healthBarWidth - (this.padding * (this.turret.healthPointsMax - 1))) / this.turret.healthPointsMax; // single health blob

        for (var i = 0; i < this.turret.healthPointsMax; i++) {
            var alpha = i < this.turret.healthPoints ? 1 : .4;
            var posX = healthBarStartPos.x + (i * (healthBlobWidth + this.padding));
            DrawRect({x:posX, y:healthBarStartPos.y}, {x:healthBlobWidth, y:this.size.y - this.margin}, secondaryColor, 0, {x:0, y:1}, alpha);
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
        this.turret = turret;
        this.layer = layerTop;
        this.timeSinceEnable = 0;
    }

    Update() {
        super.Update();
        this.pos = mousePos;
        if (enableCursor) {
            this.timeSinceEnable += deltaTime;
        }
    }

    Draw() {
        super.Draw();
        if (!enableCursor) {return;}

        var lineLengthPlusOffset = EaseInOutCubic(Lerp(0, 1, Clamp(this.timeSinceEnable * 4.5, 0, 1))) * (this.lineLength + this.lineOffset);
        var lineOffset = EaseInOutCubic(Lerp(0, 1, Clamp(this.timeSinceEnable * 3, 0, 1))) * this.lineOffset;
        var lineLength = lineLengthPlusOffset - lineOffset;

        if (this.showDot) {
            DrawCircle(this.pos, {x:this.dotRadius, y:this.dotRadius}, primaryColor);
        }
        if (this.showLines) {
            var lineOffsets = lineOffset + this.lineOffsetBloomFactor * this.turret.currentBloomMax;
            DrawRect({ x: this.pos.x - lineOffsets, y: this.pos.y }, { x: lineLength, y: this.lineThickness }, primaryColor, 0, { x: 1, y: 0.5 });
            DrawRect({ x: this.pos.x + lineOffsets, y: this.pos.y }, { x: lineLength, y: this.lineThickness }, primaryColor, 0, { x: 0, y: 0.5 });
            DrawRect({ x: this.pos.x, y: this.pos.y + lineOffsets }, { x: this.lineThickness, y: lineLength }, primaryColor, 0, { x: 0.5, y: 1 });
            DrawRect({ x: this.pos.x, y: this.pos.y - lineOffsets }, { x: this.lineThickness, y: lineLength }, primaryColor, 0, { x: 0.5, y: 0 });
        }
        if (this.turret.reloadTime > 0 && playing) {
            DrawRing(this.pos, lineOffset - this.lineThickness * 2, this.lineThickness, primaryColor, this.turret.reloadTime / gunReloadTimeMax);
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
            DrawCircle(this.pos, {x:this.radius, y:this.radius}, 'blue');
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
            return IntersectRectangleRectangle(collider.pos, collider.size, this.pos, this.size); // RectRect
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
    pos = ConvertPosition(pos);

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

function DrawCircle(pos, size, color, alpha = 1, angle = 0, anchor = {x:.5, y:.5}) {
    pos = ConvertPosition(pos);

    // transform
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ToRad(angle));
    ctx.translate(-pos.x, -pos.y);

    // draw
    ctx.beginPath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.ellipse(pos.x - size.x + anchor.x * size.x * 2, pos.y - size.y + anchor.y * size.y * 2, size.x, size.y, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    // undo transform
    ctx.setTransform(1,0,0,1,0,0);
}

function DrawImage(pos, size, angle, image, anchor={x:0.5, y:0.5}, scale={x:1, y:1}, alpha = 1) {
    pos = ConvertPosition(pos);
    angle = 360-angle;

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
    pos = ConvertPosition(pos);
    angle = 360-angle;

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
    pos = ConvertPosition(pos);
    angle = 360-angle;

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
    pos = ConvertPosition(pos);

    var isOffCanvas = pos.x + size.x < 0 || pos.x - size.x > canvasSize.x || pos.y - size.y > canvasSize.y || (!ignoreUp && pos.y + size.y < 0);
    return isOffCanvas;
}

// Only works if the rectangles are not rotated
function IntersectRectangleRectangle(pos1, size1, pos2, size2) {
    var rec1 = [pos1.x - size1.x / 2, pos1.y - size1.y / 2, pos1.x + size1.x / 2, pos1.y + size1.y / 2];
    var rec2 = [pos2.x - size2.x / 2, pos2.y - size2.y / 2, pos2.x + size2.x / 2, pos2.y + size2.y / 2];
    var isWidthPositive = Math.min(rec1[2], rec2[2]) > Math.max(rec1[0], rec2[0]);
    var isHeightPositive = Math.min(rec1[3], rec2[3]) > Math.max(rec1[1], rec2[1]);
    return (isWidthPositive && isHeightPositive);
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
function VectorToAngle(vector1, vector2, clamp = true) {
    var angle = ToDeg(Math.atan2(vector1.y - vector2.y,vector1.x - vector2.x));
    return clamp ? ClampAngle(angle) : angle;
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

function KeyDown(event) {
    if (!playing) {
        return;
    }

    var keyCode = event.keyCode;
    switch (keyCode) {
        case 82: turret.Reload(); break; // R
    }
}

function OnMouseMove() {
    mouseDocPos = GetMousePos(canvas, event);
    scrollPosAtLastMouseMove = {x:window.scrollX, y:window.scrollY};
    scrollPos = {x:0, y:0};
    UpdateMousePos();
}

function OnMouseScroll() {
    scrollPos = {x:window.scrollX - scrollPosAtLastMouseMove.x, y:window.scrollY - scrollPosAtLastMouseMove.y};
    UpdateMousePos();
}

function UpdateMousePos() {
    mousePos = {x:mouseDocPos.x - scrollPos.x, y:mouseDocPos.y - scrollPos.y};
}

function GetMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: canvasSize.y - (event.clientY - rect.top)
    };
}

function EnableCursor() {
    $("#gameCanvas").addClass("noCursor");
    enableCursor = true;
}

function ConvertPosition(pos) {
    return {x:pos.x, y:canvasSize.y - pos.y};
}

function RemoveRandom(array) {
    var enemyIndex = array[Math.floor(Math.random() * array.length)];
    var index = array.indexOf(enemyIndex);
    if (index != -1) {
        array.splice(index, 1);
    }

    return enemyIndex;
}

function Lerp(start, stop, progress) {
    return start + (stop - start) * progress;
}

function MoveTowards(value, target, step) {
    if (value < target) {
        value += Math.abs(step);
        if (value > target) {
            value = target;
        }
    } else {
        value -= Math.abs(step);
        if (value < target) {
            value = target;
        }
    }
    return value;
}
