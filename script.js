document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('#video-background');
    const player = document.querySelector('.player');
    const container = document.querySelector('.game-container');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const pauseModal = new bootstrap.Modal(document.getElementById('pauseModal'));
    const scoreDisplay = document.querySelector('.score');
    const collisionSound = new Audio('Explocion.mp3');
    let playerPosition = 50;
    let score = 0;
    let asteroidInterval;
    const asteroids = [];

    video.play();

    video.addEventListener('timeupdate', function () {
        if (video.currentTime >= video.duration) {
            video.currentTime = 0;
            video.play();
        }
    });

    // Verificar si la imagen ya está en el Local Storage
    if (!localStorage.getItem('asteroidImage')) {
        // Si no está, la carga y la almacena
        const img = new Image();
        img.onload = function () {
            localStorage.setItem('asteroidImage', getBase64Image(img));
        };
        img.src = 'asteroide.svg';
    }
    // Verificar si la imagen ya está en el Local Storage
    if (!localStorage.getItem('asteroidImage2')) {
        // Si no está, la carga y la almacena
        const img = new Image();
        img.onload = function () {
            localStorage.setItem('asteroidImage2', getBase64Image(img));
        };
        img.src = 'Asteroidep.png';
    }

    const updatePlayerPosition = () => {
        player.style.left = playerPosition + '%';
    };

    const handleKeyPress = (event) => {
        const movementIncrement = 2;

        if (event.key === 'ArrowLeft' && playerPosition > 0) {
            playerPosition -= movementIncrement;
        } else if (event.key === 'ArrowRight' && playerPosition < 100) {
            playerPosition += movementIncrement;
        } else if (event.key === 's' || event.key === 'S') {
            createBullet();
        } else if (event.key === 'p' || event.key === 'P') {
            togglePause();
        } else if (event.key === 'm' || event.key === 'M') {
            toggleBackgroundMusic();
        }

        updatePlayerPosition();
    };

    const createBullet = () => {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = playerPosition + '%';
        bullet.style.bottom = '140px';
        container.appendChild(bullet);

        moveBullet(bullet);
    };

    const moveBullet = (bullet) => {
        const bulletSpeed = 5;

        const move = () => {
            const bulletPosition = parseFloat(bullet.style.bottom) || 0;
            bullet.style.bottom = bulletPosition + bulletSpeed + 'px';

            if (bulletPosition > container.clientHeight) {
                if (container.contains(bullet)) {
                    container.removeChild(bullet);
                }
            } else {
                const enemies = document.querySelectorAll('.enemy');
                checkCollisionWithEnemies(bullet, enemies);
                requestAnimationFrame(move);
            }
        };

        requestAnimationFrame(move);
    };

    const checkCollisionWithEnemies = (bullet, enemies) => {
        const bulletRect = bullet.getBoundingClientRect();

        for (const enemy of enemies) {
            const enemyRect = enemy.getBoundingClientRect();

            if (
                bulletRect.bottom > enemyRect.top &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.right > enemyRect.left &&
                bulletRect.left < enemyRect.right
            ) {
                container.removeChild(bullet);
                playCollisionSound();
                incrementScore();
                enemy.style.backgroundImage = `url('${localStorage.getItem('asteroidImage2')}')`;
                setTimeout(() => {
                    if (container.contains(enemy)) {
                        container.removeChild(enemy);
                    }
                }, 100);
                break;
            }
        }
    };

    const playCollisionSound = () => {
        collisionSound.currentTime = 0;
        collisionSound.play();
    };

    const enemyTemplate = document.createElement('div');
    enemyTemplate.className = 'enemy';
    enemyTemplate.style.backgroundImage = `url('${localStorage.getItem('asteroidImage')}')`;

    const createEnemy = () => {
        const enemy = enemyTemplate.cloneNode(true);
        enemy.style.left = Math.random() * (container.clientWidth - 30) + 'px';
        container.appendChild(enemy);
        asteroids.push(enemy);

        moveEnemy(enemy);
    };

    const moveEnemy = (enemy) => {
        enemy.interval = setInterval(() => {
            const enemyPosition = parseFloat(enemy.style.top) || 0;
            enemy.style.top = enemyPosition + 3 + 'px';

            if (enemyPosition > container.clientHeight) {
                clearInterval(enemy.interval);
                if (container.contains(enemy)) {
                    container.removeChild(enemy);
                    const index = asteroids.indexOf(enemy);
                    if (index !== -1) {
                        asteroids.splice(index, 1);
                    }
                }
            }
        }, 16);
    };

    const incrementScore = () => {
        score += 10;
        updateScoreDisplay();
        animateScoreIncrease();
    };

    const animateScoreIncrease = () => {
        scoreDisplay.classList.add('increase');

        setTimeout(() => {
            scoreDisplay.classList.remove('increase');
        }, 200);
    };

    const updateScoreDisplay = () => {
        scoreDisplay.textContent = `Score: ${score}`;
    };

    const togglePause = () => {
        if (video.paused) {
            video.play();
            startGame();
            asteroids.forEach((asteroid) => moveEnemy(asteroid));
            pauseModal.hide();
        } else {
            video.pause();
            clearInterval(asteroidInterval);
            asteroids.forEach((asteroid) => clearInterval(asteroid.interval));
            pauseModal.show();
        }
    };

    const startGame = () => {
        clearInterval(asteroidInterval);
        asteroidInterval = setInterval(() => {
            createEnemy();
        }, 2000);
    };

    startGame();

    document.addEventListener('keydown', handleKeyPress);

    window.addEventListener('blur', () => {
        video.pause();
        clearInterval(asteroidInterval);
        asteroids.forEach((asteroid) => clearInterval(asteroid.interval));
        pauseModal.show();
    });

    window.addEventListener('focus', () => {
        video.play();
        startGame();
        asteroids.forEach((asteroid) => moveEnemy(asteroid));
        pauseModal.hide();
    });

    document.addEventListener('keydown', (event) => {
        if (event.keyCode === 116) {
            window.location.href = 'index.html';
        }
    });

    const toggleBackgroundMusic = () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    };

    function getBase64Image(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');
        return dataURL;
    }
});
