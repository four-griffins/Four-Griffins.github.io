function toggleDarkMode() {
  const far = Date('2100-1-1');

  if (document.getElementById('darkmode').checked) {
    document.body.style.setProperty("--bg-color", "#111");
    document.body.style.setProperty("--fg-color", "#ccc");
    document.cookie = `theme=dark;expires=${far}`;
  } else {
    document.body.style.setProperty("--bg-color", "#ccc");
    document.body.style.setProperty("--fg-color", "#555");
    document.cookie = `theme=light;expires=${far}`;
  }
}

function changePage(page) {
  const links = document.getElementsByClassName('slidable');
  for (let i = 0; i < links.length; i++) {
    links[i].classList.add('left');
  }
  setTimeout(() => {
    window.location = `${page}.html`;
  }, 400);
}

function load() {

  document.cookie.split(';').filter((i) => {
    return i.split('=')[0] === 'theme';
  }).forEach((i) => {
    if (i.split('=')[1] === 'dark') document.getElementById('darkmode').checked = true;
    else document.getElementById('darkmode').checked = false;
    toggleDarkMode();
  });

  document.body.style.setProperty("--trans-speed", "300ms");
  const l = document.getElementsByClassName('slidable');
  for (let i = 0; i < l.length; i++) l[i].classList.remove('right');
}
