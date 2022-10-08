// Function that returns a promise for the FPS

let frames;
let coef = 1;

function getFPS() {
    requestAnimationFrame((timeFrame1) => {
        requestAnimationFrame((timeFrame2) => {
            return frames = (1000 / (timeFrame2 - timeFrame1));
        });
    });
}
getFPS();

const game = (function() {

    class Doodle {
        constructor(platform, fieldWidth, fieldHeight) {
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.isAlive = true;
            this.turn = "right";
            this.isShooting = false;
            this.speedY = 8/coef;
            this.speedX = 8/coef;
            this.accelY = 0.2/(coef*coef);
            this.width = this.fieldHeight * 0.08;//ширина и высота 8% от высоты канваса
            this.height = this.width;
            this.platform = platform;//платформа с которой начинается игра
            this.posX = this.platform.posX + this.platform.width/2 - this.width*0.35;//"лапки" персонажа от 0% до 70% ширины изображения, поэтому его "центр" находится на 35% ширины
            this.posY = this.platform.posY - this.height;
            this.sx = 0;//координаты изображения спрайта
            this.sy = 301;
            this.sWidth = 342;//ширина и высота изображения, которое нужно вырезать из спрайта
            this.sHeight = 334;
            this.jumpSound = new Audio();
            this.jumpSound.src = "audio/bubble-pop.mp3";
            this.jumpSound.volume = 0.08;
            this.shootSound = new Audio();
            this.shootSound.src = "audio/shoot.mp3";
            this.shootSound.volume = 0.08;
            this.fallDown = false;//свойства для сохранения айди анимаций
            this.moveDoodleRight = false;
            this.moveDoodleLeft = false;
            this.jumpUp = requestAnimationFrame(this.jump.bind(this));
        }
        jump() {
            this.speedY -= this.accelY;
            this.posY -= this.speedY;
            if (!this.jumpUp) {
                return;//остановка движения
            }
            requestAnimationFrame(this.jump.bind(this));
        }
        clearJumpUp() {
            cancelAnimationFrame(this.jumpUp);
            this.jumpUp = false;
        }
        goRight() {
            this.turn = "right";
            this.sx = 0;//изменение спрайта (поворот персонажа вправо)
            this.sy = 301;
            this.posX += this.speedX;
            //улетел за правый край
            if (this.posX > this.fieldWidth) {
                this.posX = 0 - this.width;
            }
            if (!this.moveDoodleRight) {
                return;//остановка движения
            }
            requestAnimationFrame(this.goRight.bind(this));
        }
        goLeft() {
            this.turn = "left";
            this.sx = 553;//изменение спрайта (поворот персонажа влево)
            this.sy = 4;
            this.posX -= this.speedX;
            //улетел за левый край
            if (this.posX + this.width < 0) {
                this.posX = this.fieldWidth;
            }
            if (!this.moveDoodleLeft) {
                return;//остановка движения
            }
            requestAnimationFrame(this.goLeft.bind(this));
        }
        clearMoveDoodleRight() {
            cancelAnimationFrame(this.moveDoodleRight);
            this.moveDoodleRight = false;
        }
        clearMoveDoodleLeft() {
            cancelAnimationFrame(this.moveDoodleLeft);
            this.moveDoodleLeft = false;
        }
        shoot() {
            if (this.isAlive) {
                this.shootSound.play();
                this.isShooting = true;
                this.sx = 372;//изменение спрайта
                this.sy = 92;
                this.sWidth = 48;
                this.sHeight = 94;
                this.height = this.fieldHeight * 0.11;//изображение стреляющего персонажа "выше" чем обычно, поэтому меняются размеры
                this.width = this.fieldHeight * 0.055;
            }
        }
    }

    class Platform {
        constructor(newPlatformHeight, isMoving, fieldWidth, fieldHeight) {
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.isMoving = isMoving;
            this.speedX = ((Math.random() > 0.5 ? 1 : -1) * (Math.random() + 0.5))/coef;//случайное число для установления направления и скорости движения (скорость не может быть 0, поэтому прибавляю 0,5)
            this.width = this.fieldWidth * 0.15;//размеры рассчитываются исходя из размеров канваса
            this.height = this.fieldHeight * 0.025;
            this.posX = Math.random() * (this.fieldWidth - this.width);//случайная координата (платформа не может выходить за пределы поля)
            this.posY = newPlatformHeight;//значение рассчитывается в методе модели исходя из высоты канваса
            this.platformMove = false;//свойство для сохранения айди анимаций
            this.sWidth = 86;//размеры изображения спрайта
            this.sHeight = 23;
            if (this.isMoving) {//координаты спрайта для двигающейся платформы
                this.sx = 422;
                this.sy = 115;
                this.platformMove = requestAnimationFrame(this.move.bind(this));
            }
            if (!this.isMoving) {//координаты спрайта для неподвмижной платформы
                this.sx = 420;
                this.sy = 91;
            }
        }
        move() {
            this.posX += this.speedX;
            if (this.posX < 0) {//ударяется о левый край поля
                this.speedX = -this.speedX;
                this.posX = 0;
            }
            if (this.posX + this.width > this.fieldWidth) {//ударяется о правый край поля
                this.speedX = -this.speedX;
                this.posX = this.fieldWidth - this.width;
            }
            if (!this.platformMove) {
                return;//остановка движения
            }
            requestAnimationFrame(this.move.bind(this));
        }
        stop() {
            cancelAnimationFrame(this.platformMove);
            this.platformMove = false;
        }
    }

    class Bullet {
        constructor(posX, posY, fieldHeight) {
            this.fieldHeight = fieldHeight;
            this.width = this.fieldHeight * 0.025;//размеры рассчитываются исходя из размеров канваса
            this.height = this.width;
            this.posX = posX - this.width/2;//координаты начала движения пули - координаты "носа" персонажа
            this.posY = posY;
            this.speedY = 15/coef;
            this.sx = 508;//координаты изображения спрайта
            this.sy = 96;
            this.sWidth = 18;//ширина и высота изображения, которое нужно вырезать из спрайта
            this.sHeight = 18;
            this.bulletGoUp = requestAnimationFrame(this.shoot.bind(this));
        }
        shoot() {
            this.posY -= this.speedY;
			requestAnimationFrame(this.shoot.bind(this));
            if (!this.bulletGoUp) {
                return;//остановка движения
            }
        }
        stop() {
            cancelAnimationFrame(this.bulletGoUp);
            this.bulletGoUp = false;
        }
    }

    class Monster {
        constructor(fieldWidth, fieldHeight) {
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.speedX = 1/coef;
            this.speedY = 5/coef;
            this.accelY = 1/(coef*coef);
            this.random = Math.random();//случайное число для выбора внешнего вида монстра
            if (this.random > 0.5) {
                this.sx = 0;//кооррдинаты спрайта большого монстра
                this.sy = 7;
                this.sWidth = 215;
                this.sHeight = 133;
                this.width = this.fieldHeight * 0.2;
                this.height = this.fieldHeight * 0.13;
            }
            if (this.random < 0.5) {
                this.sx = 377;//кооррдинаты спрайта маленького монстра
                this.sy = 0;
                this.sWidth = 165;
                this.sHeight = 88;
                this.width = this.fieldHeight * 0.15;
                this.height = this.fieldHeight * 0.07;
            }
            this.posX = Math.random() * (this.fieldWidth - this.width);//случайная координата в пределах ширины поля
            this.posY = 0 - this.height * 3;//монстр появляется на три своих высоты выше верхнего края поля, т.о. музыка начнет играть заранее, до появления монстра на экране
            this.startPos = this.posY;//координата У от которой монстр начинает двигаться вверх
            this.monsterMove = requestAnimationFrame(this.move.bind(this));
        }
        move() {//монстр двигается по горизонтали в пределах ширины канваса и вертикально в пределах половины своей высоты от координаты startPos
            this.posX += this.speedX;
            if (this.posX < 0) {//отталкивается от левого края
                this.speedX = -this.speedX;
                this.posX = 0;
            }
            if (this.posX + this.width > this.fieldWidth) {//отталкивается от правого края
                this.speedX = -this.speedX;
                this.posX = this.fieldWidth - this.width;
            }
            this.speedY -= this.accelY;
            this.posY -= this.speedY;
            if (this.posY > this.startPos + this.height/2) {//опускается нижу половины своей высоты относительно startPos
                this.speedY = 5;
                this.posY = this.startPos + this.height/2;
            }
            if (!this.monsterMove) {
                return;//остановка движения
            }
			requestAnimationFrame(this.move.bind(this));
        }
        die() {
            this.monsterMove = false;
        }
    }

    class WorldView {
        constructor(fieldWidth, fieldHeight) {
            this.scoreDiv = document.getElementById("score");
            this.gameOverDiv = document.getElementById("game-over-block");
            this.scoreSpan = document.getElementById("score-span");
            const canvas = document.getElementById("canvas");
            this.ctx = canvas.getContext("2d");
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.image = new Image();
            this.image.src = "img/sprite-game.png";
        }
        clear() {
            this.ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
        }
        deleteGame(score) {
            this.ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
            this.gameOverDiv.style.display = "block";
            this.scoreDiv.style.display = "none";
            this.scoreSpan.innerHTML = score;
        }
        updateScore(score) {
            this.scoreDiv.textContent = score;
        }
        draw(sx, sy, sWidth, sHeight, posX, posY, width, height) {
            this.ctx.drawImage(this.image, sx, sy, sWidth, sHeight, posX, posY, width, height);
        }
    }

    class World {
        constructor(view, fieldWidth, fieldHeight) {
            this.gameState = true;//true - игра, false - остановка
            this.view = view;//передаю view модели
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;
            this.gameOverTimer = false;//свойство для сохранения айди анимации
            this.platformCount = this.fieldHeight / 60;//платформы располагаются каждые 60 пикселей канваса
            this.platforms = [];//массивы для элементов игры
            this.monsters = [];
            this.bullets = [];
            this.score = 0;
            this.touchPosX = false;//координата первого прикосновения
            this.touchMoveX = false;//координата прикосновения после начала движения
            this.waitingForTap = false;//таймер для ожидания второго прикосновения
            this.createPlatforms();
            this.doodle = new Doodle(this.platforms[0], this.fieldWidth, this.fieldHeight);
            this.gameOverSound = new Audio();
            this.gameOverSound.src = "audio/whistle_air.mp3";
            this.gameOverSound.volume = 0.08;
            this.monsterSound = new Audio();
            this.monsterSound.src = "audio/monsterblizu.mp3";
            this.monsterSound.volume = 0.08;
            this.hitSound = new Audio();
            this.hitSound.src = "audio/punch.mp3";
            this.hitSound.volume = 0.1;
            this.view.updateScore(this.score);
            this.updateWorld = requestAnimationFrame(this.update.bind(this));
            this.moveWorldUp = requestAnimationFrame(this.moveWorld.bind(this));
            this.countCoefTimer = requestAnimationFrame(this.countCoef.bind(this));
        }
        countCoef() {
            getFPS()
            if (frames > 60) {
                coef = frames/60;
            }
            this.doodle.speedX = 8/coef;
            this.doodle.accelY = 0.2/(coef*coef);
            if (!this.countCoefTimer) {
                return;//остановка счетчика
            }
            requestAnimationFrame(this.countCoef.bind(this));
        }
        createPlatforms() {
            for (let i = 1; i <= this.platformCount; i++) {
                let platformGap = this.fieldHeight / this.platformCount;//расстояние между платформами
                let newPlatformHeight = this.fieldHeight - i * platformGap;//рассчет координаты У для новой платформы
                if (i % 3 == 0 && i % 2 !== 0) {//каждая третья и нечетная платформа подвижная
                    const newPlatform = new Platform(newPlatformHeight, true, this.fieldWidth, this.fieldHeight);
                    this.platforms.push(newPlatform);
                } else {//неподвижные платформы
                    const newPlatform = new Platform(newPlatformHeight, false, this.fieldWidth, this.fieldHeight);
                    this.platforms.push(newPlatform);
                }
            }
        }
        moveWorld() {
            let delta = this.fieldHeight * 1/2 - this.doodle.posY;//разница между координатой половины канваса и координатой персонажа
            if (delta >= 0) {//если персонаж прыгнул выше половины экрана (дельта положительная), то мир двигается вниз
                this.doodle.posY = this.fieldHeight * 1/2;//персонаж не может прыгнуть выше половины экрана, чтобы не обогнать платформы
                this.platforms.forEach(platform => {//все платформы опускаются на растояние дельты
                    platform.posY += delta;
                    if (platform.posY >= this.fieldHeight) {
                        this.score++;//если платформа опускается за пределы экрана, то счет увеличивается на 1
                        this.view.updateScore(this.score);
                        //вместо пропавшей платформы создается новая вверху канваса
                        if (this.score > 500) {//в зависимости от количества очков определяется будет ли подвижной новая платформа
                            //после 500 все платформы будут подвижными
                            const newestPlatform = new Platform(0, true, this.fieldWidth, this.fieldHeight);
                            this.platforms.push(newestPlatform);
                        } else if (this.score < 500 && this.score > 200 && this.score % 2 == 0) {
                            //каждая четная платформа подвижная в диапазоне от 200 до 500
                            const newestPlatform = new Platform(0, true, this.fieldWidth, this.fieldHeight);
                            this.platforms.push(newestPlatform);
                        } else if (this.score < 200 && this.score % 3 == 0) {
                            //если счет до 200, то каждая третья
                            const newestPlatform = new Platform(0, true, this.fieldWidth, this.fieldHeight);
                            this.platforms.push(newestPlatform);
                        } else {//остальные неподвижные
                            const newestPlatform = new Platform(0, false, this.fieldWidth, this.fieldHeight);
                            this.platforms.push(newestPlatform);
                        }
                    }
                    if (this.score !== 0 && this.score % 100 == 0) {//монстр создается каждst 100 очков
                        if (this.monsters.length == 0) {//только если в игре на данный момент нет монстра 
                            this.createMonsters();
                        }
                    }
                });
                this.monsters.forEach(monster => {//если в игре есть монстр, то его тоже нужно опустить вместе с платформами
                    if (this.doodle.speedY >= 0) {
                        monster.startPos += delta;
                    }
                });
            }
            if (!this.moveWorldUp) {
                return;//остановка анимации
            }
            requestAnimationFrame(this.moveWorld.bind(this));
        }
        createMonsters() {
            const newMonster = new Monster(this.fieldWidth, this.fieldHeight);
            this.monsters.push(newMonster);
        }
        createBullet() {//аргументом нужно передать центр персонажа
            const bullet = new Bullet(this.doodle.posX + this.doodle.width/2, this.doodle.posY, this.fieldHeight);
            this.bullets.push(bullet);
        }
        touchStart(touchPosX) {
            this.touchPosX = touchPosX;
            if (!this.waitingForTap) {//включается таймер, который ждет второго прикосновения
                this.waitingForTap = setTimeout(() => {
                    this.waitingForTap = false;//если его не происходит, то таймер просто отключается через 200 мс
                }, 200);
            } else {
                clearTimeout(this.waitingForTap);//иначе очищается таймер и вызывается метод выстрела
                this.waitingForTap = false;
                if (!this.doodle.moveDoodleRight && !this.doodle.moveDoodleLeft) {
                    this.doodle.shoot();
                    this.createBullet();
                }
            }
        }
        touchMove(touchMoveX) {
            if (!this.touchPosX) {
                return;//остановка движения
            }
            this.touchMoveX = touchMoveX;
            const differenceX = this.touchPosX - this.touchMoveX;//определяется разница между координатами начала и после движения
            if (!this.doodle.isShooting) {
                if (differenceX > 0) {//разница будет положительной при движении влево
                    this.doodle.moveDoodleLeft = requestAnimationFrame(this.doodle.goLeft.bind(this.doodle));
                } else {
                    this.doodle.moveDoodleRight = requestAnimationFrame(this.doodle.goRight.bind(this.doodle));
                }
            }
            this.touchPosX = false;//восстанавливается значение по умолчанию
        }
        touchEnd() {
            this.doodle.clearMoveDoodleLeft();//остановка движения
            this.doodle.clearMoveDoodleRight();
            this.doodle.isShooting = false;
            setTimeout(() => {//после окончания выстрела нужно вернуть начальное изображение 
                if (this.doodle.turn === "left") {//определяются координаты изображения на спрайте в зависимости от значения свойства turn до выстрела
                    this.doodle.sx = 553;
                    this.doodle.sy = 4;
                    this.doodle.sWidth = 342;
                    this.doodle.sHeight = 334;
                }
                if (this.doodle.turn === "right") {
                    this.doodle.sx = 0;
                    this.doodle.sy = 301;
                    this.doodle.sWidth = 342;
                    this.doodle.sHeight = 334;
                }
                this.doodle.width = this.fieldHeight * 0.08;//ширину и высоту нужно также вернуть до значений до выстрела
                this.doodle.height = this.doodle.width;
            }, 300);//изображение меняется обратно через 300 мс, так как прикосновение к экрану происходит очень быстро, то и изображение стреляющего персонажа появляется на очень короткое мгновение
            //чтобы анимация выстрела выглядела как выстрел, а не включалась на короткое мгновение, нужно ее продлить и возвращать изображение по умолчанию после выполнения таймера
        }
        moveDoodle(keyCode) {
            switch (keyCode) {//функция, которая реагирует на нажатие кнопки клавиатуры
                case 37:
				    if (!this.doodle.isShooting && !this.doodle.moveDoodleLeft) {
						this.doodle.moveDoodleLeft = requestAnimationFrame(this.doodle.goLeft.bind(this.doodle));
                    }
                    break;
                case 39:
					if (!this.doodle.isShooting && !this.doodle.moveDoodleRight) {
						this.doodle.moveDoodleRight = requestAnimationFrame(this.doodle.goRight.bind(this.doodle));
                    }
                    break;
                case 32:
                    if (!this.doodle.moveDoodleRight && !this.doodle.moveDoodleLeft) {
                        this.doodle.shoot();
                        this.createBullet();
                    }
                    break;
            }
        }
        stopDoodle(keyCode) {
            switch (keyCode) {//остановка движения
                case 37:
                    this.doodle.clearMoveDoodleLeft();
                    break;
                case 39:
                    this.doodle.clearMoveDoodleRight();
                    break;
                case 32:
                    this.doodle.shootSound.pause();
                    this.doodle.shootSound.currentTime = 0.0;
                    this.doodle.isShooting = false;//после окончания выстрела нужно вернуть начальное изображение 
                    if (this.doodle.turn === "left") {//определяются координаты изображения на спрайте в зависимости от значения свойства turn до выстрела
                        this.doodle.sx = 553;
                        this.doodle.sy = 4;
                        this.doodle.sWidth = 342;
                        this.doodle.sHeight = 334;
                    }
                    if (this.doodle.turn === "right") {
                        this.doodle.sx = 0;
                        this.doodle.sy = 301;
                        this.doodle.sWidth = 342;
                        this.doodle.sHeight = 334;
                    }
                    this.doodle.width = this.fieldHeight * 0.08;
                    this.doodle.height = this.doodle.width;//ширину и высоту нужно также вернуть до значений до выстрела
                    break;
            }
        }
        update() {//функция обновления всех элементов игры
            this.view.clear();//очистка канваса
            for (let i = 0; i < this.platforms.length; i++) {
                if (this.platforms[i].posY >= this.fieldHeight) {
                    this.platforms.splice(i, 1);//если платформа опустилась за пределы канваса, то она удаляется из своего массива
                }
                this.view.draw(this.platforms[i].sx, this.platforms[i].sy, this.platforms[i].sWidth, this.platforms[i].sHeight, this.platforms[i].posX, this.platforms[i].posY, this.platforms[i].width, this.platforms[i].height);
            }
            //обновление персонажа
            this.view.draw(this.doodle.sx, this.doodle.sy, this.doodle.sWidth, this.doodle.sHeight, this.doodle.posX, this.doodle.posY, this.doodle.width, this.doodle.height);
            for (let i = 0; i < this.bullets.length; i++) {
                this.view.draw(this.bullets[i].sx, this.bullets[i].sy, this.bullets[i].sWidth, this.bullets[i].sHeight, this.bullets[i].posX, this.bullets[i].posY, this.bullets[i].width, this.bullets[i].height);
                if (this.bullets[i].posY <= 0) {
                    this.bullets.splice(i, 1);//пуля удаляется из массива, когда вылетает выше канваса
                }
                if (this.bullets.length !== 0) {//если пуля присутствует в игре, то она может убить мостра
                    this.monsters.forEach(monster => {//проверка на совпадение координат каждой пули массива с координатами монстра
                        if (this.bullets[i].posY >= monster.posY
                        && this.bullets[i].posY <= monster.posY + monster.height
                        && this.bullets[i].posX <= monster.posX + monster.width
                        && this.bullets[i].posX + this.bullets[i].width >= monster.posX) {
                            this.bullets[i].stop();//при попадании остановить анимацию полета и удалить из массива пулю
                            this.bullets.splice(i, 1);
                            monster.die();//остановка анимации движения монстра и удаление из массива
                            let myIndex = this.monsters.indexOf(monster);
                            this.monsters.splice(myIndex, 1);
                        }
                    });
                }
            }
            if (this.monsters.length == 0) {//остановка музыки при отсутствии монстра в игре
                this.monsterSound.pause();
                this.monsterSound.currentTime = 0.0;
            }
            for (let i = 0; i < this.monsters.length; i++) {
                this.monsterSound.play();//звук появления монстра
                this.view.draw(this.monsters[i].sx, this.monsters[i].sy, this.monsters[i].sWidth, this.monsters[i].sHeight, this.monsters[i].posX, this.monsters[i].posY, this.monsters[i].width, this.monsters[i].height);
                if (this.monsters[i].posY >= this.fieldHeight) {//монстр опустился ниже игрового поля
                    this.monsterSound.pause();//остановка звука, анимации, удаление из массива
                    this.monsterSound.currentTime = 0.0;
                    this.monsters[i].die();
                    this.monsters.splice(i, 1);
                }
            }
            if (this.doodle.speedY <= 0) {//возможно отпрыгнуть от платформы только при падении персонажа (скорость при падении будет отрицательная, так как из нее постоянно вычитается ускорение)
                this.platforms.forEach(platform => {//проверка на совпадение координат каждой из платформ с координатами лапок персонажа
                    if (this.doodle.turn === "right") {
                        if (//примерно 30% изображения это его нос, чтобы он прыгал только лапками, а не всей шириной нужно условие описанное ниже
                        this.doodle.posY + this.doodle.height >= platform.posY//лапки должны оказаться в пределе высоты платформы
                        && this.doodle.posY + this.doodle.height <= platform.posY + platform.height
                        && this.doodle.posX + this.doodle.width*0.7 >= platform.posX//когда персонаж смотрит вправо, то его лапы от 0% до 70% ширины
                        && this.doodle.posX <= platform.posX + platform.width
                        ) {
                            this.doodle.speedY = 8/coef;//восстанавливается начальное значение скорости и озвучивается прыжок
                            this.doodle.posY = platform.posY - this.doodle.height;
                            this.doodle.jumpSound.play();
                        }
                    }
                    if (this.doodle.turn === "left") {
                        if (//когда персонаж смотрит влево, то его лапки от 30% до 100%
                        this.doodle.posY + this.doodle.height >= platform.posY//лапки должны оказаться в пределе высоты платформы
                        && this.doodle.posY + this.doodle.height <= platform.posY + platform.height
                        && this.doodle.posX + this.doodle.width >= platform.posX
                        && this.doodle.posX + this.doodle.width*0.3 <= platform.posX + platform.width
                        ) {
                            this.doodle.speedY = 8/coef;//восстанавливается начальное значение скорости и озвучивается прыжок
                            this.doodle.posY = platform.posY - this.doodle.height;
                            this.doodle.jumpSound.play();
                        }
                    }
                });
                this.monsters.forEach(monster => {//проверка на совпадение координат верхней поверхности монстра с координатами лапок персонажа
                    if (this.doodle.turn === "right") {
                        if (//когда персонаж смотрит вправо, то его лапы от 0% до 70% ширины
                        this.doodle.posY + this.doodle.height <= monster.posY + monster.height
                        && this.doodle.posY + this.doodle.height >= monster.posY
                        && this.doodle.posX + this.doodle.width*0.7 >= monster.posX
                        && this.doodle.posX <= monster.posX + monster.width
                        ) {
                            this.doodle.speedY = 8/coef;//восстанавливается начальное значение скорости и озвучивается удар
                            this.hitSound.play();
                            monster.die();//остановка анимации монстра и удаление из массива
                            let myIndex = this.monsters.indexOf(monster);
                            this.monsters.splice(myIndex, 1);
                        }
                    }
                    if (this.doodle.turn === "left") {
                        if (//когда персонаж смотрит влево, то его лапки от 30% до 100%
                        this.doodle.posY + this.doodle.height <= monster.posY + monster.height
                        && this.doodle.posY + this.doodle.height >= monster.posY
                        && this.doodle.posX + this.doodle.width >= monster.posX
                        && this.doodle.posX + this.doodle.width*0.3 <= monster.posX + monster.width
                        ) {
                            this.doodle.speedY = 8/coef;//восстанавливается начальное значение скорости и озвучивается удар
                            this.hitSound.play();
                            monster.die();//остановка анимации монстра и удаление из массива
                            let myIndex = this.monsters.indexOf(monster);
                            this.monsters.splice(myIndex, 1);
                        }
                    }
                });
            }
            //падение персонажа ниже канваса
            if (this.doodle.posY >= this.fieldHeight) {
                this.gameOver();
                this.doodle.clearJumpUp();
            }
            this.monsters.forEach(monster => {//удар о монстра (снизу и по бокам)
                if (this.doodle.turn === "right") {
                    if (//когда персонаж смотрит вправо, то его лапы от 0% до 70% ширины
                    this.doodle.posY + this.doodle.height >= monster.posY
                    && this.doodle.posY <= monster.posY + monster.height
                    && this.doodle.posX + this.doodle.width*0.7 >= monster.posX
                    && this.doodle.posX <= monster.posX + monster.width
                    ) {
                        this.hitSound.play();//озвучивается удар, останавливается анимация прыжка и падение вниз
                        window.navigator.vibrate(300);
                        this.doodle.clearJumpUp();
                        this.gameOverTimer = requestAnimationFrame(this.doodleGameOver.bind(this));
                        this.gameOver();
                    }
                }
                if (this.doodle.turn === "left") {
                    if (//когда персонаж смотрит влево, то его лапки от 30% до 100%
                    this.doodle.posY + this.doodle.height >= monster.posY
                    && this.doodle.posY <= monster.posY + monster.height
                    && this.doodle.posX + this.doodle.width >= monster.posX
                    && this.doodle.posX + this.doodle.width*0.3 <= monster.posX + monster.width
                    ) {
                        this.hitSound.play();//озвучивается удар, останавливается анимация прыжка и падение вниз
                        window.navigator.vibrate(300);
                        this.doodle.clearJumpUp();
                        this.gameOverTimer = requestAnimationFrame(this.doodleGameOver.bind(this));
                        this.gameOver();
                    }
                }
            });
            if (!this.updateWorld) {
                return;//остановка обновления игры
            }
            requestAnimationFrame(this.update.bind(this));
        }
        doodleGameOver() {
            this.doodle.posY += (8/coef);//падение вниз после удара об монстра
            if (!this.gameOverTimer) {
                return;//остановка падения
            }
            requestAnimationFrame(this.doodleGameOver.bind(this));
        }
        gameOver() {
            this.monsterSound.pause();//остановка музыки монстра
            this.doodle.isAlive = false;//персонаж не может стрелять если isAlive == false
            this.createMonstersTimer = false;
            this.platforms.forEach(platform => {//все платформы улетают вверх и удаляются из массива
                platform.posY -= (20/coef);
                if (platform.posY + platform.height <= 0) {
                    this.gameOverSound.play();//звук полета 
                    platform.stop();//остановка движущихся платформ
                    const myIndex = this.platforms.indexOf(platform);
                    this.platforms.splice(myIndex, 1);
                }
            });
            this.monsters.forEach(monster => {//все монстры также должны улететь и удалиться из массива
                monster.startPos -= (20/coef);
                if (monster.startPos + monster.height <= 0) {
                    monster.die();//остановка движения
                    let myIndex = this.monsters.indexOf(monster);
                    this.monsters.splice(myIndex, 1);
                }
            });
            //когда на массивы пусты и на экране ничего нет останавливаются все анимации
            if (this.platforms.length == 0 && this.monsters.length == 0 && this.doodle.posY > this.fieldHeight) {
                cancelAnimationFrame(this.countCoefTimer);
                this.countCoefTimer = false;
                cancelAnimationFrame(this.updateWorld);
                this.updateWorld = false;
                cancelAnimationFrame(this.moveWorldUp);
                this.moveWorldUp = false;
                cancelAnimationFrame(this.gameOverTimer);
                this.gameOverTimer = false;
                this.view.deleteGame(this.score);//показать счет на экране
                this.gameState = false;
            }
        }
        stopGame() {//когда пользователь внезапно прерывает игру нажимая кнопку "назад" браузера
            //остановка анимаций и таймеров
            cancelAnimationFrame(this.countCoefTimer);
            this.countCoefTimer = false;
            cancelAnimationFrame(this.updateWorld);
            this.updateWorld = false;
            cancelAnimationFrame(this.moveWorldUp);
            this.moveWorldUp = false;
            cancelAnimationFrame(this.gameOverTimer);
            this.gameOverTimer = false;
            this.gameState = false;
            const menu = document.getElementById("menu");//меню снова должно появиться на экране
            menu.style.display = "block";
        }
        changeGameState() {//выключение игры при уходе со страницы/ обновлении
            this.gameState = false;
        }
    }

    class WorldController {
        constructor(model) {
            this.model = model;
            this.addListeners();
        }
        addListeners() {
            document.addEventListener("keydown", this.moveDoodle.bind(this));//управление кнопками
            document.addEventListener("keyup", this.stopDoodle.bind(this));
            document.addEventListener("touchstart", this.touchStart.bind(this));//события тачскрина
            document.addEventListener("touchmove", this.touchMove.bind(this));
            document.addEventListener("touchend", this.touchEnd.bind(this));
            window.addEventListener("beforeunload", this.unload.bind(this));//обновление страницы
            window.addEventListener("popstate", this.stopGame.bind(this));//уход со страницы
        }
        unload(event) {
            if (this.model.gameState) {//предупреждение появится, если игра активна
                event.preventDefault();
                event.returnValue = "";
                this.model.changeGameState();//меняется состоянии игры на false
            }
        }
        stopGame(event) {
            if (this.model.gameState) {//предупреждение при попытке ухода со страницы, когда игра активна
                alert("Все изменения будут утеряны!");
                this.model.changeGameState();//меняется состоянии игры на false
                this.model.stopGame();
            }
        }
        moveDoodle(event) {//передается код клавиши модели
            let keyCode = event.keyCode;
            this.model.moveDoodle(keyCode);
        }
        stopDoodle(event) {//передается код клавиши модели
            let keyCode = event.keyCode;
            this.model.stopDoodle(keyCode);
        }
        touchStart(event) {//передается координата касания экрана модели
            let touchPosX = event.touches[0].clientX;
            this.model.touchStart(touchPosX);
        }
        touchMove(event) {//передается координата касания экрана модели
            let touchMoveX = event.touches[0].clientX;
            this.model.touchMove(touchMoveX);
        }
        touchEnd(event) {
            this.model.touchEnd();
        }
    }

    return {
        init: function(container) {
            if (frames > 60) {
                coef = frames/60;
            }
            const canvas = document.getElementById("canvas");
            const fieldWidth = container.offsetWidth;
            const fieldHeight = container.offsetHeight;
            canvas.setAttribute("width", fieldWidth);
            canvas.setAttribute("height", fieldHeight);
            //поиск канваса на странице и передача информации о его размере
            const view = new WorldView(fieldWidth, fieldHeight);
            const model = new World(view, fieldWidth, fieldHeight);
            const controller = new WorldController(model);
        }
    };

}());

/*
function start() {
    const orientation = screen.orientation.type.startsWith("landscape") ? "portrait" : "portrait";
    lock("portrait");
    init();
}

function init() {
    const background = document.querySelector(".blue-bg");
    const container = document.getElementById("container");
    const menu = document.getElementById("menu");
    menu.style.display = "none";
    background.style.display = "block";
    game.init(container);
}

function lock(orientation) {
    let de = document.documentElement;
    if (de.requestFullscreen) {de.requestFullscreen()}
    else if (de.mozRequestFullscreen) {de.mozRequestFullscreen()}
    else if (de.webkitRequestFullscreen) {de.webkitRequestFullscreen()}
    else if (de.msRequestFullscreen) {de.msRequestFullscreen()}
    // код для мобильных устройств
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        screen.orientation.lock(orientation);
      }
}

function unlock(orientation) {
    screen.orientation.unlock(orientation);
    if (document.exitFullscreen) {document.exitFullscreen()}
    else if (document.webkitExitFullscreen) {document.webkitExitFullscreen()}
    else if (document.mozCancelFullscreen) {document.mozCancelFullscreen()}
    else if (document.msExitFullscreen) {document.msExitFullscreen()}
}

function toMenu() {
    unlock("portrait");//выход из полноэкранного режима
    const menu = document.getElementById("menu");
    menu.style.display = "block";
}
*/



