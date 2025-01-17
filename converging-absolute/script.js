// Game configuration
const INITIAL_SPOT = 100;
const INITIAL_BARRIER_GAP = 5;
const SHRINK_RATE = 0.2; // Rate at which barriers shrink per tick
const TICK_INTERVAL = 1000; // 1 second per tick
const WIN_TICKS = 10; // Number of ticks to survive
const DRIFT_STD = 1; // Standard deviation for random price movements

// Game state
let gameRunning = false;
let currentTick = 0;
let spotPrices = [];
let upperBarrier = [];
let lowerBarrier = [];
let chart = null;
let gameInterval = null;

// DOM elements
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const status = document.getElementById('status');

// Initialize Chart.js
function initializeChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Spot Price',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Upper Barrier',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    borderDash: [5, 5],
                    tension: 0
                },
                {
                    label: 'Lower Barrier',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    borderDash: [5, 5],
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Generate random number from normal distribution
function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Generate next spot price
function generateNextSpot() {
    const lastSpot = spotPrices[spotPrices.length - 1];
    const drift = normalRandom() * DRIFT_STD;
    return lastSpot + drift;
}

// Update barriers
function updateBarriers() {
    const lastUpper = upperBarrier[upperBarrier.length - 1];
    const lastLower = lowerBarrier[lowerBarrier.length - 1];
    const newUpper = lastUpper - SHRINK_RATE;
    const newLower = lastLower + SHRINK_RATE;
    upperBarrier.push(newUpper);
    lowerBarrier.push(newLower);
}

// Check if spot price breached barriers
function checkBarriers() {
    const spot = spotPrices[spotPrices.length - 1];
    const upper = upperBarrier[upperBarrier.length - 1];
    const lower = lowerBarrier[lowerBarrier.length - 1];
    return spot >= upper || spot <= lower;
}

// Update chart data
function updateChart() {
    chart.data.labels = Array.from({ length: spotPrices.length }, (_, i) => i);
    chart.data.datasets[0].data = spotPrices;
    chart.data.datasets[1].data = upperBarrier;
    chart.data.datasets[2].data = lowerBarrier;
    chart.update();
}

// Game tick function
function gameTick() {
    currentTick++;
    
    // Generate new spot price
    const newSpot = generateNextSpot();
    spotPrices.push(newSpot);
    
    // Update barriers
    updateBarriers();
    
    // Update chart
    updateChart();
    
    // Update status
    status.textContent = `Survived ${currentTick} ticks`;
    
    // Check win/lose conditions
    if (checkBarriers()) {
        endGame('lose');
    } else if (currentTick >= WIN_TICKS) {
        endGame('win');
    }
}

// Start game
function startGame() {
    // Reset game state
    gameRunning = true;
    currentTick = 0;
    spotPrices = [INITIAL_SPOT];
    upperBarrier = [INITIAL_SPOT + INITIAL_BARRIER_GAP];
    lowerBarrier = [INITIAL_SPOT - INITIAL_BARRIER_GAP];
    
    // Update UI
    buyBtn.disabled = true;
    sellBtn.disabled = false;
    status.textContent = 'Game started!';
    status.className = 'status';
    
    // Start game loop
    updateChart();
    gameInterval = setInterval(gameTick, TICK_INTERVAL);
}

// End game
function endGame(result) {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // Update UI
    buyBtn.disabled = false;
    sellBtn.disabled = true;
    
    if (result === 'win') {
        status.textContent = 'You Win!';
        status.className = 'status win';
    } else {
        status.textContent = 'You Lose!';
        status.className = 'status lose';
    }
}

// Initialize game
function init() {
    initializeChart();
    
    // Event listeners
    buyBtn.addEventListener('click', startGame);
    sellBtn.addEventListener('click', () => {
        if (gameRunning) {
            endGame('win');
        }
    });
}

// Start initialization when page loads
window.addEventListener('load', init);
