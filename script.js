let compute = 0;
let clickValue = 1;
let computePerSecond = 0;

// Available AI images
const aiImages = [
    { src: 'assets/ai.jpg', alt: 'AI Brain' },
    { src: 'assets/claude.png', alt: 'Claude AI' },
    { src: 'assets/gemini.png', alt: 'Gemini AI' },
    { src: 'assets/gpt.png', alt: 'GPT AI' }
];
let currentAiImageIndex = 0; // Default to the first image

// CPS Upgrade definitions
const cpsUpgrades = {
    'basic-ai': { cost: 15, cps: 0.1, owned: 0 },
    'nlp-model': { cost: 100, cps: 1, owned: 0 },
    'vision-ai': { cost: 1100, cps: 8, owned: 0 }
};

// Click Upgrade definitions
const clickUpgrades = {
    'faster-processor': { cost: 50, clickIncrease: 1, owned: 0 },
    'optimized-algo': { cost: 300, clickIncrease: 5, owned: 0 }
};

// DOM elements
const computeElement = document.getElementById('compute');
const cpsElement = document.getElementById('cps');
const clickPowerElement = document.getElementById('click-power');
const clickerElement = document.getElementById('ai-clicker');
const changeAiBtn = document.getElementById('change-ai-btn'); // New button element
// Tab Buttons
const showCpsBtn = document.getElementById('show-cps-btn');
const showClickBtn = document.getElementById('show-click-btn');
// Upgrade Sections
const cpsUpgradesSection = document.getElementById('cps-upgrades-section');
const clickUpgradesSection = document.getElementById('click-upgrades-section');

// Initialize game
function initGame() {
    // Set initial AI image based on loaded index
    setAiImage(currentAiImageIndex);

    clickerElement.addEventListener('click', (event) => {
        compute += clickValue;
        updateDisplay();
        updateButtons();
        clickerElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickerElement.style.transform = 'scale(1)';
        }, 100);
        createFloatingText(event.clientX, event.clientY, `+${clickValue.toFixed(0)}`);
    });

    // Event listener for changing AI image
    changeAiBtn.addEventListener('click', () => {
        currentAiImageIndex = (currentAiImageIndex + 1) % aiImages.length; // Cycle through images
        setAiImage(currentAiImageIndex);
        saveGame(); // Save the new index choice
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
        clickUpgradesSection.style.borderTopRightRadius = ''; // Reset other tab
    });

    showClickBtn.addEventListener('click', () => {
        cpsUpgradesSection.classList.add('hidden');
        clickUpgradesSection.classList.remove('hidden');
        showCpsBtn.classList.remove('active');
        showClickBtn.classList.add('active');
        clickUpgradesSection.style.borderTopRightRadius = '0';
        cpsUpgradesSection.style.borderTopLeftRadius = ''; // Reset other tab
    });

    setInterval(gameLoop, 1000);
    updateButtons();
    updateDisplay();
    // Ensure correct tab is shown on load
    showCpsBtn.click();
}

// Function to set the AI clicker image
function setAiImage(index) {
    if (index >= 0 && index < aiImages.length) {
        clickerElement.src = aiImages[index].src;
        clickerElement.alt = aiImages[index].alt;
        currentAiImageIndex = index; // Update the global index
    }
}

// Game loop - runs every second
function gameLoop() {
    compute += computePerSecond;
    updateDisplay();
    updateButtons();
    saveGame();
}

// Update the display with current values
function updateDisplay() {
    computeElement.textContent = compute.toFixed(1);
    cpsElement.textContent = computePerSecond.toFixed(1);
    clickPowerElement.textContent = clickValue.toFixed(0);
}

// Buy a CPS upgrade
function buyCpsUpgrade(upgradeId) {
    const upgrade = cpsUpgrades[upgradeId];
    if (compute >= upgrade.cost) {
        compute -= upgrade.cost;
        upgrade.owned++;
        upgrade.cost = Math.ceil(upgrade.cost * 1.15);
        computePerSecond = calculateCPS();

        const upgradeElement = document.getElementById(upgradeId);
        upgradeElement.querySelector('.cost').textContent = upgrade.cost;
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
        upgrade.cost = Math.ceil(upgrade.cost * 1.20);
        clickValue += upgrade.clickIncrease;

        const upgradeElement = document.getElementById(upgradeId);
        upgradeElement.querySelector('.cost').textContent = upgrade.cost;
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

// Calculate total compute per second
function calculateCPS() {
    let cps = 0;
    for (const id in cpsUpgrades) {
        cps += cpsUpgrades[id].cps * cpsUpgrades[id].owned;
    }
    return cps;
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
}

// Save game state to local storage
function saveGame() {
    const gameData = {
        compute: compute,
        clickValue: clickValue,
        cpsUpgrades: cpsUpgrades,
        clickUpgrades: clickUpgrades,
        currentAiImageIndex: currentAiImageIndex
    };
    localStorage.setItem('aiClickerSave', JSON.stringify(gameData));
}

// Load game state from local storage
function loadGame() {
    const savedGame = localStorage.getItem('aiClickerSave');
    if (savedGame) {
        const gameData = JSON.parse(savedGame);
        compute = gameData.compute || 0;
        clickValue = gameData.clickValue || 1;
        currentAiImageIndex = gameData.currentAiImageIndex || 0;

        if (gameData.cpsUpgrades) {
            for (const id in gameData.cpsUpgrades) {
                if (cpsUpgrades[id]) {
                    cpsUpgrades[id].owned = gameData.cpsUpgrades[id].owned;
                    cpsUpgrades[id].cost = gameData.cpsUpgrades[id].cost;
                }
            }
        }
        if (gameData.clickUpgrades) {
            for (const id in gameData.clickUpgrades) {
                if (clickUpgrades[id]) {
                    clickUpgrades[id].owned = gameData.clickUpgrades[id].owned;
                    clickUpgrades[id].cost = gameData.clickUpgrades[id].cost;
                }
            }
        }

        computePerSecond = calculateCPS();

        for (const id in cpsUpgrades) {
            const upgradeElement = document.getElementById(id);
            if (upgradeElement) {
                upgradeElement.querySelector('.cost').textContent = cpsUpgrades[id].cost;
                upgradeElement.querySelector('.owned').textContent = cpsUpgrades[id].owned;
            }
        }
        for (const id in clickUpgrades) {
            const upgradeElement = document.getElementById(id);
            if (upgradeElement) {
                upgradeElement.querySelector('.cost').textContent = clickUpgrades[id].cost;
                upgradeElement.querySelector('.owned').textContent = clickUpgrades[id].owned;
            }
        }
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

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initGame();
});