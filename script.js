const animals = ['🐹', '🐰', '🐭', '🐼', '🦊', '🐨'];
let score = 0;
let timeLeft = 30;
let gameActive = false;
let popInterval, timerInterval;
let highScore = localStorage.getItem('bonkHighScore') || 0;

// Initialize High Score UI
document.getElementById('highScore').textContent = highScore;

function initGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        // Pass the hole element itself to the bonk function
        hole.onclick = () => bonk(i, hole);
        hole.id = `hole-${i}`;
        grid.appendChild(hole);
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    document.getElementById('score').textContent = score;
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('gameGrid').classList.remove('hidden');
    
    initGrid();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
    
    popInterval = setInterval(spawn, 650);
}

function spawn() {
    if (!gameActive) return;
    const idx = Math.floor(Math.random() * 9);
    const hole = document.getElementById(`hole-${idx}`);
    
    // Prevent spawning if an animal is already there
    if (hole.innerHTML !== '') return;

    const char = animals[Math.floor(Math.random() * animals.length)];
    const el = document.createElement('div');
    el.className = 'animal';
    el.textContent = char;
    hole.appendChild(el);

    // Animal disappears after 900ms if not clicked
    setTimeout(() => { 
        if (hole.contains(el)) hole.innerHTML = ''; 
    }, 900);
}

function bonk(idx, hole) {
    if (!gameActive || hole.innerHTML === '') return;
    
    const el = hole.querySelector('.animal');
    // Visual feedback for the bonk
    el.style.transform = 'scale(0) rotate(180deg)';
    el.style.opacity = '0';
    
    score++;
    document.getElementById('score').textContent = score;
    
    // Container wobble effect
    const container = document.getElementById('container');
    container.classList.add('wobble');
    setTimeout(() => container.classList.remove('wobble'), 200);

    setTimeout(() => { hole.innerHTML = ''; }, 100);
    playTone(400 + (score * 10)); 
}

function playTone(freq) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); 
        g.connect(ctx.destination);
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        osc.start(); 
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.log("Audio not supported or blocked");
    }
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clearInterval(popInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bonkHighScore', highScore);
    }
    
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('finalScore').textContent = `FINAL SCORE: ${score}`;
    document.getElementById('gameGrid').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('hidden');
}

// Initial setup
window.onload = initGrid;