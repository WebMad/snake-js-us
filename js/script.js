//получение объекта canvas
const canvas = document.getElementById('game');

//устанавливаем размеры холста
canvas.width = 700;
canvas.height = 600;

//получения контекста для canvas
const ctx = canvas.getContext('2d');

//загружаем картинки
const background = new Image();
background.src = "img/background.png"; //фон

/**
 * Отрисовывает игру кадр за кадром
 */
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);//удаляет предыдущий кадр с холста
    ctx.drawImage(background, 0, 0);//отрисовывает фон игры (сетку, по которой движется змейка)

    let color = "#ffa2aa";
    snake.body.forEach((coords, i) => {
        if (i === 0) {//условие для отрисовки головы
            color = "#ffa2aa";
        } else if (i % 3 === 0 || i === 1) {//условие для разных цветов тела змейки
            color = color === "#d33333" ? "#f8e8ec" : "#d33333";
        }

        ctx.fillStyle = color;//устанавливаем цвет кисти для рисования
        //отрисовываем квадрат (элемент змейки)
        ctx.fillRect(box * coords.x + 2, box * coords.y + 2, 46, 46);
    })

    ctx.drawImage(appleImage, food.x * box, food.y * box, box, box);//рисуем яблоко

    if (game.isStart) {//прежде чем переходить к следующему кадру
        requestAnimationFrame(drawGame);//вызывает отрисовку следующего кадра (fps 60)
    }
}

document.addEventListener('keydown', (e) => {//нажатие на клавишу, направление движения
    if (!snake.switch_dir) {
        if (e.key === 'ArrowLeft' && snake.direction !== 'right')
            snake.direction = 'left'
        else if (e.key === 'ArrowUp' && snake.direction !== 'down')
            snake.direction = 'up'
        else if (e.key === 'ArrowRight' && snake.direction !== 'left')
            snake.direction = 'right'
        else if (e.key === 'ArrowDown' && snake.direction !== 'up')
            snake.direction = 'down';

        if (!game.isStart && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(e.key) !== -1) {
            startGame()
        }

    }
    snake.switch_dir = true;
});

document.getElementById('start').onclick = () => {//событие нажатия на кнопку play
    if (!game.isStart) {
        startGame()
    }
}

document.addEventListener('keydown', (e) => {//событие нажатия на одну из клавиш для начала игры
    if (["Escape", " ", "Enter"].indexOf(e.key) !== -1) {
        if (!game.isStart) {
            startGame()
        }
    }
});

/**
 * Начало игры
 */
function startGame() {
    document.getElementById("menu").style.display = 'none';//скрытие popup меню
    // document.getElementById('score').innerText = game.score;//установка

    setDefaults();//устанавливаем атрибуты игры в изначальное состояние
    game.isStart = true;

    move_interval = setInterval(move, 100);//создаем интервал, который будет двигать змейку вперед

    drawGame();//запускаем отрисовку игры
}

//после загрузки фона в память, запускаем отрисовку первого кадра
background.onload = () => {
    drawGame();
}

const box = 50; //размер одного блока

//границы, за которые змейка заползать не может
const bounds = {
    x: {
        min: 1,
        max: 12,
    },
    y: {
        min: 1,
        max: 10,
    },
};

/**
 * Получить рандомное целое число в диапозоне от min до max
 * @param min
 * @param max
 * @returns {number}
 */
function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

//координаты еды
const food = {
    x: randomInteger(bounds.x.min, bounds.x.max),
    y: randomInteger(bounds.y.min, bounds.y.max),
};

const appleImage = new Image();
appleImage.src = "img/apple.png"; //еда

//информация о текущей игре
const game = {
    isStart: false,
    bestScore: 0,
    score: 0,
};

let snake;//информация о змейке

let move_interval;//отвечает за движение змейки и детект коллизий

//устанавливает новое значение счета
function setScore(score) {
    game.score = score;
    game.bestScore = Math.max(game.score, game.bestScore);
    document.getElementById('score').innerText = game.score;
    document.getElementById('bestScore').innerText = game.bestScore;
}

/**
 * Установка значений по-умолчанию
 */
function setDefaults() {
    snake = {
        x: 2,
        y: 5,
        direction: 'right',
        switch_dir: false,
        body: [
            {
                x: 2,
                y: 5,
            },
        ]
    };

    game.isStart = false;
    setScore(0);
}
setDefaults();

//заставляет змейка двигаться и детектит коллизии
function move() {

    //движение по направлению
    switch (snake.direction) {
        case 'right':
            snake.x += 1;
            break;
        case 'left':
            snake.x -= 1;
            break;
        case 'up':
            snake.y -= 1;
            break;
        case 'down':
            snake.y += 1;
            break;
    }

    //новый элемент змейки
    let newHead = {
        x: snake.x,
        y: snake.y,
    };

    if (checkBorders(newHead.x, newHead.y)) {//детект коллизий
        stopGame();//если детект, то игра окончена
        return;
    }

    if (newHead.x === food.x && newHead.y === food.y) {//детект соприкосновения с едой
        switchFoodCoords();//смена координат еды
        setScore(game.score + 1);//новое значение счетчика
    } else {
        snake.body.pop();//удаление конца змейки
    }

    snake.body.unshift(newHead);//добавление нового элемента змейки в начало

    snake.switch_dir = false;//смена направления движения змейки завершена
}

/**
 * Смена позиции еды (после того, как змейка съела яблоко)
 */
function switchFoodCoords() {
    let x;
    let y;
    do {
        x = randomInteger(bounds.x.min, bounds.x.max);
        y = randomInteger(bounds.y.min, bounds.y.max);
    } while (checkBorders(x, y));

    food.x = x;
    food.y = y;
}

/**
 * Отследить коллизии
 * @param x
 * @param y
 * @returns {boolean}
 */
function checkBorders(x, y) {
    let res = false;
    snake.body.forEach((coords) => {
        if (coords.x === x && coords.y === y) {
            res = true;
            return null;
        }
    });


    if (x > bounds.x.max || x < bounds.x.min || y > bounds.y.max || y < bounds.y.min) {
        res = true;
    }

    return res;
}


/**
 * Завершение игры
 */
function stopGame() {
    game.isStart = false;
    document.getElementById("menu").style.display = 'flex';
    clearInterval(move_interval);
}