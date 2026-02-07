const tg = Telegram.WebApp;
tg.expand();

const user = tg.initDataUnsafe.user;

fetch(BACKEND_URL,{
  method:'POST',
  body:JSON.stringify({
    action:'register',
    user_id:user.id,
    username:user.username
  })
});

fetchPoints();

function fetchPoints(){
  fetch(BACKEND_URL,{
    method:'POST',
    body:JSON.stringify({
      action:'getUser',
      user_id:user.id
    })
  })
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('points').innerText =
      d.points + ' баллов';
  });
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
    else alert('Ваш код: ' + d.code + '\nДействует 5 минут');
    fetchPoints();
  });
}
