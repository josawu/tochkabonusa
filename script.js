// ==================== КОНФИГУРАЦИЯ ====================
const BACKEND_URL = 'https://script.google.com/macros/s/118QQ7Y4XcdQCwVCJ3RUrz26zah2b3WU63osykByNhMI/exec';

// ==================== ОСНОВНАЯ ФУНКЦИЯ ====================
async function loadUserData() {
    try {
        // Получаем ID пользователя из Telegram
        let userId = null;
        let userData = null;
        
        if (window.Telegram && Telegram.WebApp) {
            const tg = Telegram.WebApp;
            tg.expand();
            userId = tg.initDataUnsafe.user?.id;
            userData = tg.initDataUnsafe.user;
        }
        
        // Если нет ID из Telegram, пробуем из URL
        if (!userId) {
            const urlParams = new URLSearchParams(window.location.search);
            userId = urlParams.get('user') || urlParams.get('user_id');
        }
        
        // Если вообще нет ID - показываем нулевые значения
        if (!userId) {
            showEmptyState();
            return;
        }
        
        // Загружаем данные пользователя
        await fetchUserData(userId, userData);
        
    } catch (error) {
        console.log('Ошибка загрузки:', error);
        showEmptyState();
    }
}

// ==================== ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ====================
async function fetchUserData(userId, telegramUser) {
    try {
        // Обновляем информацию о пользователе в интерфейсе
        if (telegramUser && telegramUser.first_name) {
            document.getElementById('userInfo').innerHTML = `
                <div style="text-align: right;">
                    <div style="font-weight: 700; margin-bottom: 3px;">${telegramUser.first_name}</div>
                    <div style="font-size: 12px; color: #666;">${telegramUser.username ? '@' + telegramUser.username : ''}</div>
                </div>
            `;
        } else {
            document.getElementById('userInfo').innerHTML = `
                <div style="text-align: right;">
                    <div style="font-weight: 700; margin-bottom: 3px;">КОФЕМАН</div>
                    <div style="font-size: 12px; color: #666;">Black Coffee Loyalty</div>
                </div>
            `;
        }
        
        // Запрашиваем данные с сервера
        const response = await fetch(`${BACKEND_URL}?user_id=${userId}`);
        const data = await response.json();
        
        // Если пользователь не найден в базе - показываем нули
        if (data.error) {
            showEmptyState();
            return;
        }
        
        // Обновляем статистику
        updateStats(data);
        
    } catch (error) {
        console.log('Ошибка загрузки данных:', error);
        showEmptyState();
    }
}

// ==================== ОБНОВЛЕНИЕ СТАТИСТИКИ ====================
function updateStats(data) {
    const balance = data.balance || 0;
    const freeCoffee = data.free_coffee || 0;
    const needed = data.needed || 10;
    
    // Вычисляем прогресс
    const progress = Math.min((balance / needed) * 100, 100);
    
    // Обновляем значения
    document.getElementById('balance').textContent = balance;
    document.getElementById('freeCoffee').textContent = freeCoffee;
    document.getElementById('progressText').textContent = `${balance}/${needed}`;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
    
    // Анимация счетчиков
    animateCounter('balance', balance);
    animateCounter('freeCoffee', freeCoffee);
}

// ==================== АНИМАЦИЯ СЧЕТЧИКОВ ====================
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === finalValue) return;
    
    let start = null;
    const duration = 500;
    
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

// ==================== ПУСТОЕ СОСТОЯНИЕ (когда нет данных) ====================
function showEmptyState() {
    // Показываем стандартную информацию
    document.getElementById('userInfo').innerHTML = `
        <div style="text-align: right;">
            <div style="font-weight: 700; margin-bottom: 3px;">BLACK COFFEE</div>
            <div style="font-size: 12px; color: #666;">Loyalty Program</div>
        </div>
    `;
    
    // Показываем нулевые значения
    updateStats({ balance: 0, free_coffee: 0, needed: 10 });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные
    loadUserData();
    
    // Обновляем каждые 30 секунд
    setInterval(loadUserData, 30000);
    
    // Добавляем эффекты при наведении
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

// ==================== ОТКРЫТИЕ БОТА ====================
function openTelegram() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.openTelegramLink('https://t.me/blackcoffee_loyalty_bot');
    } else {
        window.open('https://t.me/blackcoffee_loyalty_bot', '_blank');
    }
}
