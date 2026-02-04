// ==================== КОНФИГУРАЦИЯ ====================
const BACKEND_URL = 'https://script.google.com/macros/s/118QQ7Y4XcdQCwVCJ3RUrz26zah2b3WU63osykByNhMI/exec';

// ==================== ОСНОВНАЯ ФУНКЦИЯ ====================
async function loadUserData() {
    try {
        // Проверяем, открыто ли в Telegram
        if (window.Telegram && Telegram.WebApp) {
            const tg = Telegram.WebApp;
            
            // Инициализация Telegram Web App
            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();
            
            // Получаем данные пользователя
            const initData = tg.initDataUnsafe;
            const userId = initData.user?.id;
            
            if (userId) {
                await fetchAndDisplayUserData(userId, initData.user);
            } else {
                showDemoMode();
            }
        } else {
            showDemoMode();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showErrorState();
    }
}

// ==================== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ====================
async function fetchAndDisplayUserData(userId, user) {
    try {
        // Обновляем информацию о пользователе
        updateUserInfo(user);
        
        // Запрашиваем данные с бэкенда
        const response = await fetch(`${BACKEND_URL}?user_id=${userId}`);
        const data = await response.json();
        
        if (data.error && data.error !== 'User not found') {
            throw new Error(data.error);
        }
        
        // Отображаем данные
        displayUserStats(data);
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showDemoMode();
    }
}

// ==================== ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ ====================
function updateUserInfo(user) {
    const userInfoElement = document.getElementById('userInfo');
    
    if (user && user.first_name) {
        userInfoElement.innerHTML = `
            <div style="text-align: right;">
                <div style="font-weight: 700; margin-bottom: 3px;">${user.first_name}</div>
                <div style="font-size: 12px; color: #666;">${user.username ? '@' + user.username : ''}</div>
            </div>
        `;
    }
}

// ==================== ОТОБРАЖЕНИЕ СТАТИСТИКИ ====================
function displayUserStats(data) {
    const balance = data.balance || 0;
    const freeCoffee = data.free_coffee || 0;
    const needed = data.needed || 10;
    
    // Обновляем значения
    document.getElementById('balance').textContent = balance;
    document.getElementById('freeCoffee').textContent = freeCoffee;
    document.getElementById('progressText').textContent = `${balance}/${needed}`;
    
    // Обновляем прогресс-бар
    const progressPercent = Math.min(Math.round((balance / needed) * 100), 100);
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    
    // Анимация прогресса
    animateCounter('balance', balance);
    animateCounter('freeCoffee', freeCoffee);
}

// ==================== АНИМАЦИЯ СЧЕТЧИКА ====================
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === finalValue) return;
    
    let start = null;
    const duration = 1000;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        
        const value = Math.floor(progress * (finalValue - currentValue) + currentValue);
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// ==================== ДЕМО-РЕЖИМ ====================
function showDemoMode() {
    document.getElementById('userInfo').innerHTML = `
        <div style="text-align: right;">
            <div style="font-weight: 700; margin-bottom: 3px;">ВОЙДИТЕ В БОТА</div>
            <div style="font-size: 12px; color: #666;">Напишите /start в @blackcoffee_loyalty_bot</div>
        </div>
    `;
    
    // Показываем нулевые значения вместо демо
    const emptyData = {
        balance: 0,
        free_coffee: 0,
        needed: 10
    };
    
    displayUserStats(emptyData);
}
// ==================== РЕЖИМ ОШИБКИ ====================
function showErrorState() {
    document.getElementById('userInfo').innerHTML = `
        <div style="text-align: center; color: #888;">
            Ошибка загрузки
        </div>
    `;
    
    document.getElementById('balance').textContent = '0';
    document.getElementById('freeCoffee').textContent = '0';
    document.getElementById('progressText').textContent = '0/10';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные при старте
    loadUserData();
    
    // Обновляем каждые 30 секунд
    setInterval(loadUserData, 30000);
    
    // Добавляем анимации при наведении
    addHoverEffects();
});

// ==================== ЭФФЕКТЫ ПРИ НАВЕДЕНИИ ====================
function addHoverEffects() {
    const statCards = document.querySelectorAll('.stat-card');
    const drinkItems = document.querySelectorAll('.drink-item');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    drinkItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}
