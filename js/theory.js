import init, {run} from "../highlight-wasm/pkg/highlight_wasm.js";

let index = 0;
let articles;

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

function changeArticle(nr) {
  index = nr;
  const far = new Date('2100-1-1');
  document.cookie = `article=${nr};expires=${far}`;
  
  const getArticle = new XMLHttpRequest();
  getArticle.onload = () => {
    document.getElementById('content').children[0].innerHTML = getArticle.responseText; 
    document.getElementById('page-wrapper').classList.remove('out');
    document.getElementById('sidebar').checked = false;

    init().then(() => {
      document.getElementById('content').scrollTop = 0;
      document.getElementById('content').children[0].innerHTML = decodeURI(run(getArticle.responseText));
      toggleDarkMode();
    });
  };
  getArticle.open('GET', `theory/${articles[index].split('::')[0]}.html`);
  getArticle.send();

  document.getElementById('name-prev').innerText = index > 0 ? articles[index-1].split('::')[1] : '';
  document.getElementById('name-next').innerText = index+1 < articles.length ? articles[index+1].split('::')[1] : '';
  document.title = `${articles[index].split('::')[1]} - Four's Coding Class`;
}

window.onload =  () =>  {

  document.getElementById('sidebar').onchange = toggleSidebar;
  document.getElementById('darkmode').onchange = toggleDarkMode;
  document.getElementById('prev').onchange = () => { if (index > 0) changeArticle(index - 1) };
  document.getElementById('next').onchange = () => { if (index < articles.length - 1) changeArticle(index + 1) };

  document.cookie.split(';').forEach((i) => {
    const cookie = i.split('=');
    if (cookie[0].trim() === 'theme') document.getElementById('darkmode').checked = (cookie[1] === 'dark');
    if (cookie[0].trim() === 'article') index = parseInt(cookie[1]);
  });

  document.body.style.setProperty("--trans-speed", "300ms");

  const indexhttp = new XMLHttpRequest();
  indexhttp.onload = () => {
    articles = indexhttp.response.split('\n');
    articles.pop();
    const sidebar = document.getElementById('drawer');
    for (let i = 0; i < articles.length; i++) {
      const ii = articles[i].split('::')[1];
      const p = document.createElement('p');
      p.innerText = ii;
      p.addEventListener("click", () => { changeArticle(i); });
      sidebar.appendChild(p);
    }
    changeArticle(index);
  };
  indexhttp.open('GET', 'theory/index');
  indexhttp.send();
}
