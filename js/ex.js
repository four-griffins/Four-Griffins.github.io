let index = 0;
let exercises;

export function toggleDarkMode() {
  const far = Date('2100-1-1');

  let s = document.body.style;

  if (document.getElementById('darkmode').checked) {
    s.setProperty("--bg-color", "#111");
    s.setProperty("--drawer-color", "#222");
    s.setProperty("--fg-color", "#aaa");
    document.querySelectorAll('.themable').forEach((x) => x.classList.remove('light'));
    document.cookie = `theme=dark;expires=${far}`;
  } else {
    s.setProperty("--bg-color", "#ccc");
    s.setProperty("--drawer-color", "#aaa");
    s.setProperty("--fg-color", "#111");
    document.querySelectorAll('.themable').forEach((x) => x.classList.add('light'));
    document.cookie = `theme=light;expires=${far}`;
  }
}

export function toggleSidebar() {
  if (document.getElementById('sidebar').checked) {
    document.getElementById('page-wrapper').classList.add('out');
  } else {
    document.getElementById('page-wrapper').classList.remove('out');
  }
}

function changeExercise(nr) {
  index = nr;
  const far = new Date('2100-1-1');
  document.cookie = `ex=${nr};expires=${far}`;
  
  const getExercise = new XMLHttpRequest();
  getExercise.onload = () => {

    let parent = document.getElementById('content').children[0]
    parent.innerHTML = getExercise.responseText;
    var script = document.createElement('script');
    script.src = "https://dartpad.dev/inject_embed.dart.js";
    document.body.appendChild(script);

    document.getElementById('page-wrapper').classList.remove('out');
    document.getElementById('sidebar').checked = false;
    toggleDarkMode();
  };
  getExercise.open('GET', `ex/${exercises[index].split('::')[0]}`);
  getExercise.send();

  if (index > 0) {
    document.querySelector('#label-prev').style.visibility = "visible";
    document.getElementById('name-prev').innerText = exercises[index-1].split('::')[1];
  } else {
    document.querySelector('#label-prev').style.visibility = "hidden";
    document.getElementById('name-prev').innerText = '';
  }

  if (index < exercises.length - 1) {
    document.querySelector('#label-next').style.visibility = "visible";
    document.getElementById('name-next').innerText = exercises[index+1].split('::')[1];
  } else {
    document.querySelector('#label-next').style.visibility = "hidden";
    document.getElementById('name-next').innerText = '';
  }

  document.title = `${exercises[index].split('::')[1]} - Four's Coding Class`;
}

window.onload =  () =>  {
  document.getElementById('sidebar').onchange = toggleSidebar;
  document.getElementById('darkmode').onchange = toggleDarkMode;
  document.getElementById('prev').onchange = () => { if (index > 0) changeExercise(index - 1) };
  document.getElementById('next').onchange = () => { if (index < exercises.length - 1) changeExercise(index + 1) };

  document.cookie.split(';').forEach((i) => {
    const cookie = i.split('=');
    if (cookie[0].trim() === 'theme') document.getElementById('darkmode').checked = (cookie[1] === 'dark');
    if (cookie[0].trim() === 'ex') index = parseInt(cookie[1]);
  });

  document.body.style.setProperty("--trans-speed", "300ms");

  const indexhttp = new XMLHttpRequest();
  indexhttp.onload = () => {
    exercises = indexhttp.response.split('\n').filter((i) => !i.startsWith("//"));
    exercises.pop();
    const sidebar = document.getElementById('drawer');
    for (let i = 0; i < exercises.length; i++) {
      const ii = exercises[i].split('::')[1];
      const p = document.createElement('p');
      p.innerText = ii;
      p.addEventListener("click", () => { changeExercise(i); });
      sidebar.appendChild(p);
    }
    changeExercise(index);
  };
  indexhttp.open('GET', 'ex/index');
  indexhttp.send();
}
