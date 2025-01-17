// Game configuration
const INITIAL_SPOT = 100;
const INITIAL_BARRIER_PERCENTAGE = 2.5; // ±1.5%
const PERCENTAGE_SHRINK_RATE = 0.3; // Percentage points to shrink per tick (1.5% -> 1.3% -> 1.1% etc)
const TICK_INTERVAL = 1000; // 1 second per tick
const WIN_TICKS = 10; // Number of ticks to survive
const DRIFT_STD = 1; // Standard deviation for random price movements (increased for more volatility)

// Game state
let gameRunning = false;
let currentTick = 0;
let spotPrices = [];
let upperBarriers = [];
let lowerBarriers = [];
let currentBarrierPercentage = INITIAL_BARRIER_PERCENTAGE;
let chart = null;
let gameInterval = null;

// DOM elements
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const status = document.getElementById('status');
const spotValue = document.getElementById('spotValue');
const upperValue = document.getElementById('upperValue');
const lowerValue = document.getElementById('lowerValue');
const upperPercent = document.getElementById('upperPercent');
const lowerPercent = document.getElementById('lowerPercent');

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
                    borderColor: 'rgb(33, 150, 243)',
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
                    beginAtZero: false,
                    min: 90,
                    max: 110,
                    ticks: {
                        stepSize: 1
                    }
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

// Calculate barrier values based on current spot and percentage
function calculateBarriers(spot) {
    const upperBarrier = spot * (1 + currentBarrierPercentage / 100);
    const lowerBarrier = spot * (1 - currentBarrierPercentage / 100);
    return { upperBarrier, lowerBarrier };
}

// Update display values
function updateDisplayValues(spot, upper, lower) {
    spotValue.textContent = spot.toFixed(2);
    upperValue.textContent = upper.toFixed(2);
    lowerValue.textContent = lower.toFixed(2);
    upperPercent.textContent = `+${currentBarrierPercentage.toFixed(2)}`;
    lowerPercent.textContent = `-${currentBarrierPercentage.toFixed(2)}`;
}

// Check if spot price breached barriers
function checkBarriers(spot) {
    const currentUpperBarrier = upperBarriers[upperBarriers.length - 1];
    const currentLowerBarrier = lowerBarriers[lowerBarriers.length - 1];
    return spot >= currentUpperBarrier || spot <= currentLowerBarrier;
}

// Update chart data
function updateChart() {
    chart.data.labels = Array.from({ length: spotPrices.length }, (_, i) => i);
    chart.data.datasets[0].data = spotPrices;
    chart.data.datasets[1].data = upperBarriers;
    chart.data.datasets[2].data = lowerBarriers;
    
    chart.update();
}

function gameTick() {
    currentTick++;

    // Generate new spot price
    const newSpot = generateNextSpot();
    spotPrices.push(newSpot);

    // Check win/lose conditions against previous tick's barriers
    if (currentTick > 0) {
        const prevUpperBarrier = upperBarriers[upperBarriers.length - 1];
        const prevLowerBarrier = lowerBarriers[lowerBarriers.length - 1];

        // Debugging: Log values for analysis
        console.log('Current Tick:', currentTick);
        console.log('Spot Price:', newSpot.toFixed(2));
        console.log('Prev Upper Barrier:', prevUpperBarrier?.toFixed(2));
        console.log('Prev Lower Barrier:', prevLowerBarrier?.toFixed(2));

        // Detect breaches with matched precision
        const breachedUpper = newSpot >= prevUpperBarrier;
        const breachedLower = newSpot <= prevLowerBarrier;

        console.log('Breached Upper Barrier?', breachedUpper);
        console.log('Breached Lower Barrier?', breachedLower);

        // If breach detected, log and handle loss
        if (breachedUpper || breachedLower) {
            console.log(`Loss detected! Breached ${breachedUpper ? "upper" : "lower"} barrier.`);
            
            // Final chart update
            updateChart();

            // End the game after a loss
            endGame('lose');
            return;
        }
    }

    // Shrink barrier percentage for new barriers
    currentBarrierPercentage = Math.max(
        INITIAL_BARRIER_PERCENTAGE - currentTick * PERCENTAGE_SHRINK_RATE,
        0.1 // Minimum percentage
    );

    // Calculate and store new barriers
    const { upperBarrier, lowerBarrier } = calculateBarriers(newSpot);
    upperBarriers.push(upperBarrier);
    lowerBarriers.push(lowerBarrier);

    // Update display with the latest values
    updateDisplayValues(newSpot, upperBarrier, lowerBarrier);
    updateChart();

    // Status update
    status.textContent = `Survived ${currentTick} ticks`;

    // Winning condition
    if (currentTick >= WIN_TICKS) {
        endGame('win');
    }
}

// Start game
function startGame() {
    gameRunning = true;
    currentTick = 0;

    // Initialize the spot prices and barriers
    spotPrices = [INITIAL_SPOT];
    upperBarriers = [null]; // Placeholder
    lowerBarriers = [null]; // Placeholder

    // Update UI
    buyBtn.disabled = true;
    sellBtn.disabled = false;
    status.textContent = 'Game started!';
    status.className = 'status';

    // Initialize display
    const { upperBarrier, lowerBarrier } = calculateBarriers(INITIAL_SPOT);
    updateDisplayValues(INITIAL_SPOT, upperBarrier, lowerBarrier);

    // Append the first barriers for the offset logic
    upperBarriers.push(upperBarrier);
    lowerBarriers.push(lowerBarrier);

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
    
    // Initial display values
    const { upperBarrier, lowerBarrier } = calculateBarriers(INITIAL_SPOT);
    updateDisplayValues(INITIAL_SPOT, upperBarrier, lowerBarrier);
    
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
