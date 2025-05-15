let compute = 0;
let clickValue = 1; // Base click value, will be reset on rebirth
let computePerSecond = 0;

// --- Rebirth State ---
let rebirths = 0;
let rebirthBonus = 0; // Represents percentage bonus (e.g., 0.5 = +50%)
let rebirthRequirement = 100000; // Initial compute needed for first rebirth - CHANGED
const rebirthBonusPerRebirth = 0.5; // +50% CPS per rebirth
const rebirthCostMultiplier = 10; // Requirement increases x10 each time

// Available AI images
const aiImages = [
    { src: 'assets/ai.jpg', alt: 'AI Brain' },
    { src: 'assets/claude.png', alt: 'Claude AI' },
    { src: 'assets/gemini.png', alt: 'Gemini AI' },
    { src: 'assets/gpt.png', alt: 'GPT AI' }
];
let currentAiImageIndex = 0;

// --- Updated Upgrade Definitions (with base values) ---
const cpsUpgrades = {
    'basic-ai': { baseCost: 15, cost: 15, baseCps: 0.1, cps: 0.1, owned: 0 },
    'nlp-model': { baseCost: 100, cost: 100, baseCps: 1, cps: 1, owned: 0 },
    'vision-ai': { baseCost: 1100, cost: 1100, baseCps: 8, cps: 8, owned: 0 }
};

const clickUpgrades = {
    'faster-processor': { baseCost: 50, cost: 50, baseClickIncrease: 1, clickIncrease: 1, owned: 0 },
    'optimized-algo': { baseCost: 300, cost: 300, baseClickIncrease: 5, clickIncrease: 5, owned: 0 }
};

// DOM elements
const computeElement = document.getElementById('compute');
const cpsElement = document.getElementById('cps');
const clickPowerElement = document.getElementById('click-power');
const clickerElement = document.getElementById('ai-clicker');
const changeAiBtn = document.getElementById('change-ai-btn');
const showCpsBtn = document.getElementById('show-cps-btn');
const showClickBtn = document.getElementById('show-click-btn');
const cpsUpgradesSection = document.getElementById('cps-upgrades-section');
const clickUpgradesSection = document.getElementById('click-upgrades-section');
// Rebirth DOM Elements
const rebirthBtn = document.getElementById('rebirth-btn');
const rebirthBonusDisplay = document.getElementById('rebirth-bonus');
const rebirthCountDisplay = document.getElementById('rebirth-count');
const rebirthCostDisplay = document.getElementById('rebirth-cost');

// Initialize game
function initGame() {
    setAiImage(currentAiImageIndex);

    clickerElement.addEventListener('click', (event) => {
        compute += clickValue; // Click value is NOT affected by rebirth bonus in this version
        updateDisplay();
        updateButtons();
        clickerElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickerElement.style.transform = 'scale(1)';
        }, 100);
        createFloatingText(event.clientX, event.clientY, `+${clickValue.toFixed(0)}`);
    });

    changeAiBtn.addEventListener('click', () => {
        currentAiImageIndex = (currentAiImageIndex + 1) % aiImages.length;
        setAiImage(currentAiImageIndex);
        saveGame();
    });

    // Set up buy buttons
    document.querySelectorAll('.buy-cps-btn').forEach(button => {
        const upgradeId = button.closest('.upgrade-item').id;
        button.addEventListener('click', () => buyCpsUpgrade(upgradeId));
    });
    document.querySelectorAll('.buy-click-btn').forEach(button => {
        const upgradeId = button.closest('.upgrade-item').id;
        button.addEventListener('click', () => buyClickUpgrade(upgradeId));
    });

    // Tab Switching Logic
    showCpsBtn.addEventListener('click', () => {
        cpsUpgradesSection.classList.remove('hidden');
        clickUpgradesSection.classList.add('hidden');
        showCpsBtn.classList.add('active');
        showClickBtn.classList.remove('active');
        cpsUpgradesSection.style.borderTopLeftRadius = '0';
        clickUpgradesSection.style.borderTopRightRadius = '';
    });
    showClickBtn.addEventListener('click', () => {
        cpsUpgradesSection.classList.add('hidden');
        clickUpgradesSection.classList.remove('hidden');
        showCpsBtn.classList.remove('active');
        showClickBtn.classList.add('active');
        clickUpgradesSection.style.borderTopRightRadius = '0';
        cpsUpgradesSection.style.borderTopLeftRadius = '';
    });

    // --- Rebirth Button Listener ---
    rebirthBtn.addEventListener('click', performRebirth);

    setInterval(gameLoop, 1000); // Game loop interval
    updateDisplay(); // Initial display update
    updateButtons(); // Initial button state update
    showCpsBtn.click(); // Set initial tab
}

// Function to set the AI clicker image
function setAiImage(index) {
    if (index >= 0 && index < aiImages.length) {
        clickerElement.src = aiImages[index].src;
        clickerElement.alt = aiImages[index].alt;
        currentAiImageIndex = index;
    }
}

// Game loop - runs every second
function gameLoop() {
    compute += computePerSecond; // Add CPS (which includes rebirth bonus)
    updateDisplay();
    updateButtons(); // Check if rebirth is affordable
    saveGame(); // Save progress every second
}

// Update the display with current values
function updateDisplay() {
    computeElement.textContent = formatNumber(compute); // Use formatting for large numbers
    cpsElement.textContent = formatNumber(computePerSecond);
    clickPowerElement.textContent = formatNumber(clickValue);
    // Update Rebirth Info
    rebirthBonusDisplay.textContent = (rebirthBonus * 100).toFixed(0); // Show as percentage
    rebirthCountDisplay.textContent = rebirths;
    rebirthCostDisplay.textContent = formatNumber(rebirthRequirement);
}

// Buy a CPS upgrade
function buyCpsUpgrade(upgradeId) {
    const upgrade = cpsUpgrades[upgradeId];
    if (compute >= upgrade.cost) {
        compute -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost = Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.owned)); // Recalculate cost based on owned
        computePerSecond = calculateCPS(); // Recalculate CPS

        const upgradeElement = document.getElementById(upgradeId);
        upgradeElement.querySelector('.cost').textContent = formatNumber(upgrade.cost);
        upgradeElement.querySelector('.owned').textContent = upgrade.owned;
        flashUpgrade(upgradeElement);

        updateDisplay();
        updateButtons();
    }
}

// Buy a Click upgrade
function buyClickUpgrade(upgradeId) {
    const upgrade = clickUpgrades[upgradeId];
    if (compute >= upgrade.cost) {
        compute -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost = Math.ceil(upgrade.baseCost * Math.pow(1.20, upgrade.owned)); // Recalculate cost based on owned
        clickValue = calculateClickValue(); // Recalculate click power

        const upgradeElement = document.getElementById(upgradeId);
        upgradeElement.querySelector('.cost').textContent = formatNumber(upgrade.cost);
        upgradeElement.querySelector('.owned').textContent = upgrade.owned;
        flashUpgrade(upgradeElement);

        updateDisplay();
        updateButtons();
    }
}

// Helper function for purchase visual cue
function flashUpgrade(element) {
    element.classList.add('purchased');
    setTimeout(() => element.classList.remove('purchased'), 300);
}

// Calculate total compute per second (incorporating rebirth bonus)
function calculateCPS() {
    let baseCps = 0;
    for (const id in cpsUpgrades) {
        baseCps += cpsUpgrades[id].baseCps * cpsUpgrades[id].owned;
    }
    return baseCps * (1 + rebirthBonus);
}

// Calculate total click power
function calculateClickValue() {
    let totalClickPower = 1; // Start with base click value
    for (const id in clickUpgrades) {
        totalClickPower += clickUpgrades[id].baseClickIncrease * clickUpgrades[id].owned;
    }
    return totalClickPower;
}

// Update all buy buttons (enable/disable based on affordability)
function updateButtons() {
    for (const id in cpsUpgrades) {
        const button = document.getElementById(id)?.querySelector('.buy-cps-btn');
        if (button) {
            button.disabled = compute < cpsUpgrades[id].cost;
        }
    }
    for (const id in clickUpgrades) {
        const button = document.getElementById(id)?.querySelector('.buy-click-btn');
        if (button) {
            button.disabled = compute < clickUpgrades[id].cost;
        }
    }
    rebirthBtn.disabled = compute < rebirthRequirement;
}

// --- Perform Rebirth Function ---
function performRebirth() {
    if (compute >= rebirthRequirement) {
        rebirths++;
        rebirthBonus += rebirthBonusPerRebirth;
        compute = 0; // Reset compute
        clickValue = 1; // Reset click power to base

        for (const id in cpsUpgrades) {
            cpsUpgrades[id].owned = 0;
            cpsUpgrades[id].cost = cpsUpgrades[id].baseCost; // Reset cost to base
        }
        for (const id in clickUpgrades) {
            clickUpgrades[id].owned = 0;
            clickUpgrades[id].cost = clickUpgrades[id].baseCost; // Reset cost to base
        }

        computePerSecond = calculateCPS(); // Will be 0 initially, but potential is higher
        rebirthRequirement *= rebirthCostMultiplier; // Increase cost for next rebirth

        updateDisplay(); // Update all displays
        updateUpgradeUIDisplay(); // Reset owned/cost display on UI
        updateButtons(); // Disable rebirth button, re-evaluate upgrade buttons

        saveGame();

        alert(`Rebirth successful! You now have a ${rebirthBonus * 100}% bonus to CPS. Keep clicking!`);
    }
}

// Helper to update the visual display of all upgrades after rebirth
function updateUpgradeUIDisplay() {
    for (const id in cpsUpgrades) {
        const upgradeElement = document.getElementById(id);
        if (upgradeElement) {
            upgradeElement.querySelector('.cost').textContent = formatNumber(cpsUpgrades[id].cost);
            upgradeElement.querySelector('.owned').textContent = cpsUpgrades[id].owned;
        }
    }
    for (const id in clickUpgrades) {
        const upgradeElement = document.getElementById(id);
        if (upgradeElement) {
            upgradeElement.querySelector('.cost').textContent = formatNumber(clickUpgrades[id].cost);
            upgradeElement.querySelector('.owned').textContent = clickUpgrades[id].owned;
        }
    }
}

// Save game state to local storage
function saveGame() {
    const gameData = {
        compute: compute,
        cpsUpgrades: cpsUpgrades,
        clickUpgrades: clickUpgrades,
        currentAiImageIndex: currentAiImageIndex,
        rebirths: rebirths,
        rebirthBonus: rebirthBonus,
        rebirthRequirement: rebirthRequirement
    };
    localStorage.setItem('aiClickerSave', JSON.stringify(gameData));
}

// Load game state from local storage
function loadGame() {
    const savedGame = localStorage.getItem('aiClickerSave');
    if (savedGame) {
        const gameData = JSON.parse(savedGame);
        compute = gameData.compute || 0;
        currentAiImageIndex = gameData.currentAiImageIndex || 0;

        // Load Rebirth Data
        rebirths = gameData.rebirths || 0;
        rebirthBonus = gameData.rebirthBonus || 0;
        // Use 100,000 as the default ONLY if it's not present in the save data
        rebirthRequirement = gameData.rebirthRequirement || 100000; 

        // Load Upgrades (important to load before calculating CPS/Click)
        if (gameData.cpsUpgrades) {
            for (const id in gameData.cpsUpgrades) {
                if (cpsUpgrades[id]) {
                    cpsUpgrades[id].owned = gameData.cpsUpgrades[id].owned || 0;
                    cpsUpgrades[id].cost = Math.ceil(cpsUpgrades[id].baseCost * Math.pow(1.15, cpsUpgrades[id].owned));
                }
            }
        }
        if (gameData.clickUpgrades) {
            for (const id in gameData.clickUpgrades) {
                if (clickUpgrades[id]) {
                    clickUpgrades[id].owned = gameData.clickUpgrades[id].owned || 0;
                    clickUpgrades[id].cost = Math.ceil(clickUpgrades[id].baseCost * Math.pow(1.20, clickUpgrades[id].owned));
                }
            }
        }

        computePerSecond = calculateCPS();
        clickValue = calculateClickValue();

        updateUpgradeUIDisplay();
    }
    setAiImage(currentAiImageIndex);
}

// Function to create floating text on click
function createFloatingText(x, y, text) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.classList.add('floating-text');
    floatingText.style.left = `${x - 10}px`;
    floatingText.style.top = `${y - 35}px`;

    document.body.appendChild(floatingText);

    floatingText.addEventListener('animationend', () => {
        floatingText.remove();
    });
}

// Helper function to format large numbers
function formatNumber(number) {
    if (number < 1000) return number.toFixed(1);
    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(number) / 3);
    const scaled = number / Math.pow(10, tier * 3);
    return scaled.toFixed(1) + suffixes[tier];
}

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initGame();
});