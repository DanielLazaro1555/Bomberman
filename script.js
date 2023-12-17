document.addEventListener('DOMContentLoaded', function () {
    const player = document.querySelector('.player');
    const container = document.querySelector('.game-container');
    let playerPosition = 50; // posición inicial del jugador en porcentaje
    let score = 0;

    function updatePlayerPosition() {
        player.style.left = playerPosition + '%';
    }

    function handleKeyPress(event) {
        if (event.key === 'ArrowLeft' && playerPosition > 0) {
            playerPosition -= 5;
        } else if (event.key === 'ArrowRight' && playerPosition < 100) {
            playerPosition += 5;
        } else if (event.key === 's' || event.key === 'S') {
            createBullet();
        }

        updatePlayerPosition();
    }

    function createBullet() {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = playerPosition + '%';
        container.appendChild(bullet);

        moveBullet(bullet);
    }

    function moveBullet(bullet) {
        const bulletSpeed = 5;
        const bulletInterval = setInterval(() => {
            const bulletPosition = parseFloat(bullet.style.bottom) || 0;
            bullet.style.bottom = bulletPosition + bulletSpeed + 'px';

            if (bulletPosition > container.clientHeight) {
                clearInterval(bulletInterval);
                if (container.contains(bullet)) {
                    container.removeChild(bullet);
                }
            } else {
                // Comprueba colisiones con enemigos
                const enemies = document.querySelectorAll('.enemy');
                checkCollisionWithEnemies(bullet, enemies);
            }
        }, 16); // Aproximadamente 60 FPS
    }


    function checkCollisionWithEnemies(bullet, enemies) {
        const bulletRect = bullet.getBoundingClientRect();

        enemies.forEach((enemy) => {
            const enemyRect = enemy.getBoundingClientRect();

            if (
                bulletRect.bottom > enemyRect.top &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.right > enemyRect.left &&
                bulletRect.left < enemyRect.right
            ) {
                // Colisión con un enemigo, incrementa la puntuación y elimina la bala y el enemigo
                if (container.contains(bullet)) {
                    container.removeChild(bullet);
                }
                if (container.contains(enemy)) {
                    container.removeChild(enemy);
                }
                incrementScore();
            }
        });
    }


    function createEnemy() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.left = Math.random() * (container.clientWidth - 30) + 'px';
        container.appendChild(enemy);

        moveEnemy(enemy);
    }

    function moveEnemy(enemy) {
        const enemySpeed = 3;
        const enemyInterval = setInterval(() => {
            const enemyPosition = parseFloat(enemy.style.top) || 0;
            enemy.style.top = enemyPosition + enemySpeed + 'px';

            if (enemyPosition > container.clientHeight) {
                clearInterval(enemyInterval);
                if (container.contains(enemy)) {
                    container.removeChild(enemy);
                }
            }
        }, 16); // Aproximadamente 60 FPS
    }


    function incrementScore() {
        score += 10; // Puedes ajustar la cantidad de puntos según tu preferencia
        updateScoreDisplay();
        animateScoreIncrease();
    }
    function animateScoreIncrease() {
        const scoreDisplay = document.querySelector('.score');
        scoreDisplay.classList.add('increase');
      
        // Después de un breve tiempo, quita la clase de aumento para volver al tamaño normal
        setTimeout(() => {
          scoreDisplay.classList.remove('increase');
        }, 200); // Ajusta la duración de la animación aquí (en milisegundos)
      }

    function updateScoreDisplay() {
        // Actualiza el marcador de puntuación en la interfaz
        const scoreDisplay = document.querySelector('.score');
        scoreDisplay.textContent = `Score: ${score}`;
    }

    setInterval(() => {
        createEnemy();
    }, 2000); // Genera un enemigo cada 2000 milisegundos (2 segundos)

    document.addEventListener('keydown', handleKeyPress);
});
