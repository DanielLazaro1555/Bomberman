document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('#video-background');
    const player = document.querySelector('.player');
    const container = document.querySelector('.game-container');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const pauseModal = new bootstrap.Modal(document.getElementById('pauseModal')); // Crea una instancia del modal Bootstrap
    let playerPosition = 50; // posición inicial del jugador en porcentaje
    let score = 0;
    let asteroidInterval;
    const asteroids = [];

    // Inicia la reproducción del video al cargar la página
    video.play();

    // Evento que se activa cuando el video alcanza el tiempo final
    video.addEventListener('timeupdate', function () {
        // Puedes ajustar el valor según tus necesidades
        if (video.currentTime >= video.duration) {
            video.currentTime = 0; // Reinicia la reproducción al principio
            video.play();
        }
    });

    function updatePlayerPosition() {
        player.style.left = playerPosition + '%';
    }

    function handleKeyPress(event) {
        const movementIncrement = 2; // Ajusta según tus preferencias de movimiento

        if (event.key === 'ArrowLeft' && playerPosition > 0) {
            playerPosition -= movementIncrement;
        } else if (event.key === 'ArrowRight' && playerPosition < 100) {
            playerPosition += movementIncrement;
        } else if (event.key === 's' || event.key === 'S') {
            createBullet();
        } else if (event.key === 'p' || event.key === 'P') {
            togglePause(); // Agregado: Maneja la tecla "P" para pausar/reanudar
        } else if (event.key === 'm' || event.key === 'M') {
            toggleBackgroundMusic(); // Agregado: Maneja la tecla "m" para pausar la musica/reanudar la musica
        }

        updatePlayerPosition();
    }

    function createBullet() {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = playerPosition + '%';
        bullet.style.bottom = '140px'; // Ajusta la altura inicial de la bala según tus necesidades
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

    // Crear una única instancia de audio
    const collisionSound = new Audio('Explocion.mp3');

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
                playCollisionSound(); // Agregado: Reproduce el sonido de colisión
                incrementScore();
            }
        });
    }

    function playCollisionSound() {
        // Reiniciar el sonido en caso de que aún se esté reproduciendo
        collisionSound.currentTime = 0;
        collisionSound.play();
    }




    function createEnemy() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.left = Math.random() * (container.clientWidth - 30) + 'px';
        container.appendChild(enemy);
        asteroids.push(enemy);

        moveEnemy(enemy);
    }

    function moveEnemy(enemy) {
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

    function togglePause() {
        if (video.paused) {
            // Si el video está pausado, reanuda el juego
            video.play();
            startGame();
            asteroids.forEach((asteroid) => moveEnemy(asteroid));
            // Oculta el modal de pausa
            pauseModal.hide();
        } else {
            // Si el video está reproduciéndose, pausa el juego
            video.pause();
            clearInterval(asteroidInterval);
            asteroids.forEach((asteroid) => clearInterval(asteroid.interval));
            // Muestra el modal de pausa
            pauseModal.show();
        }
    }

    function startGame() {
        // Limpia el intervalo existente antes de comenzar uno nuevo
        clearInterval(asteroidInterval);
        asteroidInterval = setInterval(() => {
            createEnemy();
        }, 2000); // Genera un enemigo cada 2000 milisegundos (2 segundos)
    }

    startGame();

    document.addEventListener('keydown', handleKeyPress);

    // Evento que se activa cuando la pestaña pierde el foco
    window.addEventListener('blur', function () {
        // Pausa la reproducción del video y cualquier otra actividad del juego
        video.pause();
        clearInterval(asteroidInterval); // Pausa la generación de asteroides
        asteroids.forEach((asteroid) => clearInterval(asteroid.interval)); // Pausa el movimiento de asteroides existentes
        // Implementa lógica adicional de pausa aquí...
        pauseModal.show();
    });

    // Evento que se activa cuando la pestaña obtiene el foco
    window.addEventListener('focus', function () {
        // Reanuda la reproducción del video y cualquier otra actividad del juego
        video.play();
        startGame(); // Reanuda la generación de asteroides
        asteroids.forEach((asteroid) => moveEnemy(asteroid)); // Reanuda el movimiento de asteroides existentes
        // Implementa lógica adicional de reanudación aquí...
        pauseModal.hide();
    });
    // Event listener para la tecla F5 (código de tecla 116) usando ASCII
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 116) {
            // Redirige a la página "index.html" al presionar F5
            window.location.href = 'index.html';
        }
    });
    function toggleBackgroundMusic() {
        const backgroundMusic = document.getElementById('backgroundMusic');
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    }

});
