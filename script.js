// Конфигурация - замените на ваш Google Apps Script URL
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzroAS42FVWBMsqMSkcW_R49-TViFgFPltrnA9N11U9dWrFgH6VIB49yfLfTFEuZbBbqQ/exec';

// Основная функция загрузки данных
async function loadUserData() {
    try {
        // Проверяем, что мы в Telegram Web App
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            const tg = Telegram.WebApp;
            tg.expand();
            
            // Получаем данные пользователя из Telegram
            const initData = tg.initDataUnsafe;
            const userId = initData.user?.id;
            
            if (userId) {
                // Запрашиваем данные с бэкенда
                const response = await fetch(`${BACKEND_URL}?user_id=${userId}`);
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Обновляем интерфейс
                updateUI(data, initData.user);
            } else {
                // Режим тестирования (вне Telegram)
                showTestMode();
            }
        } else {
            // Режим тестирования в браузере
            showTestMode();
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('userInfo').innerHTML = `
            <h2>Гость</h2>
            <p>Войдите через Telegram</p>
        `;
        document.getElementById('balance').textContent = '0';
        document.getElementById('freeCoffee').textContent = '0';
        document.getElementById('progressText').textContent = '0/10';
        document.getElementById('progressFill').style.width = '0%';
    }
}

// Обновление интерфейса
function updateUI(data, user) {
    // Обновляем информацию о пользователе
    document.getElementById('userInfo').innerHTML = `
        <h2>${user.first_name || 'Гость'}</h2>
        <p>${user.username ? '@' + user.username : ''}</p>
    `;

    // Обновляем статистику
    document.getElementById('balance').textContent = data.balance || 0;
    document.getElementById('freeCoffee').textContent = data.free_coffee || 0;

    // Обновляем прогресс-бар
    const needed = data.needed || 10;
    const balance = data.balance || 0;
    const progress = (balance / needed) * 100;
    document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('progressText').textContent = 
        `${balance}/${needed}`;
}

// Режим тестирования (вне Telegram)
function showTestMode() {
    document.getElementById('userInfo').innerHTML = `
        <h2>Демо-режим</h2>
        <p>Откройте в Telegram</p>
    `;
    
    // Тестовые данные
    document.getElementById('balance').textContent = '5';
    document.getElementById('freeCoffee').textContent = '0';
    document.getElementById('progressFill').style.width = '50%';
    document.getElementById('progressText').textContent = '5/10';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные
    loadUserData();
    
    // Обновляем каждые 30 секунд
    setInterval(loadUserData, 30000);
});
