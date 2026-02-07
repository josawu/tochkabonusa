const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzlC6QfjeGOx-OoEXS07FDFjQoXyzkm-iDj1_1RXMl3btLbEi2EmCqD1JVl3WpgOWnH-Q/exec";

const tg = Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe.user;
const maxPoints = 10;

// регистрация
fetch(BACKEND_URL,{
  method:'POST',
  body:JSON.stringify({
    action:'register',
    user_id:user.id,
    username:user.username
  })
});

loadUser();

function loadUser(){
  fetch(BACKEND_URL,{
    method:'POST',
    body:JSON.stringify({
      action:'getUser',
      user_id:user.id
    })
  })
  .then(r=>r.json())
  .then(d=>{
    const p = d.points;
    document.getElementById('current').innerText = p;
    document.getElementById('left').innerText = Math.max(0, maxPoints - p);
    document.getElementById('bar').style.width =
      Math.min(100, p/maxPoints*100) + '%';

    const btn = document.getElementById('coffeeBtn');
    if (p >= maxPoints) {
      btn.classList.remove('disabled');
    }
  });
}

function sendCheck(){
  const file = document.getElementById('check').files[0];
  if (!file) return alert('Выберите фото чека');

  document.getElementById('checkStatus').innerText =
    'Чек отправлен на проверку ☕';
}

function getCoffee(){
  fetch(BACKEND_URL,{
    method:'POST',
    body:JSON.stringify({
      action:'getReward',
      user_id:user.id
    })
  })
  .then(r=>r.json())
  .then(d=>{
    if (d.error) alert(d.error);
    else alert(`Ваш код: ${d.code}\nДействует 5 минут`);
    loadUser();
  });
}
