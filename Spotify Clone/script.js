// ----- Data from local files -----
const tracks = Array.from({length:10}, (_,i)=>({
  title: `Track ${i+1}`,
  artist: "NCS Release",
  cover: `${i+1}.jpg`,
  src: `${i+1}.mp3`,
}));

// ----- DOM -----
const audio = document.getElementById("audio");

// carousels
const trendRow = document.getElementById("trend");
const artistsRow = document.getElementById("artists");
const foryouRow = document.getElementById("foryou");

// mini player
const mpCover = document.getElementById("mp-cover");
const mpTitle = document.getElementById("mp-title");
const mpCur = document.getElementById("mp-cur");
const mpDur = document.getElementById("mp-dur");
const bar = document.getElementById("mp-bar");
const fill = document.getElementById("mp-fill");
const knob = document.getElementById("mp-knob");
const gif = document.getElementById("gif");
const vol = document.getElementById("vol");

// controls
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let index = 0;
let seeking = false;

// ----- Build cards -----
function cardTemplate(t, i, round=false){
  return `
    <div class="card" data-index="${i}">
      <div class="cover" style="background-image:url('${t.cover}'); ${round?'border-radius:50%':''}"></div>
      <div class="title">${t.title}</div>
      <div class="sub">${t.artist}</div>
      <button class="play-fab" data-index="${i}">
        <i class="fa-solid fa-play"></i>
      </button>
    </div>
  `;
}

function render(){
  trendRow.innerHTML = tracks.map((t,i)=>cardTemplate(t,i,false)).join("");
  artistsRow.innerHTML = tracks.slice(0,8).map((t,i)=>cardTemplate(t,i,true)).join("");
  foryouRow.innerHTML = tracks.slice(2,8).map((t,i)=>cardTemplate(t,i+2,false)).join("");

  // click handlers (cards + floating play)
  document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("click", (e)=>{
      if (e.target.closest(".play-fab")) return; // handled below
      const i = +card.dataset.index;
      playIndex(i);
    });
  });
  document.querySelectorAll(".play-fab").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      const i = +btn.dataset.index;
      if (index === i && !audio.paused) pause();
      else playIndex(i);
    });
  });
}
render();

// ----- Carousel buttons -----
document.querySelectorAll(".caro-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const row = document.querySelector(btn.dataset.target);
    row.scrollBy({left: btn.classList.contains("left") ? -400 : 400, behavior:"smooth"});
  });
});

// ----- Player core -----
function format(t){ if(!isFinite(t)) return "0:00"; const m=Math.floor(t/60), s=Math.floor(t%60); return `${m}:${s<10?"0"+s:s}`; }

function setNowPlaying(i){
  const t = tracks[i];
  mpCover.src = t.cover;
  mpTitle.textContent = t.title;
  audio.src = t.src;
}

function play(){
  audio.play();
  // icon change
  const i = playBtn.querySelector("i");
  i.classList.remove("fa-circle-play");
  i.classList.add("fa-circle-pause");
  gif.style.opacity = 1;
}

function pause(){
  audio.pause();
  const i = playBtn.querySelector("i");
  i.classList.remove("fa-circle-pause");
  i.classList.add("fa-circle-play");
  gif.style.opacity = 0;
}

function playIndex(i){
  index = i;
  setNowPlaying(index);
  audio.currentTime = 0;
  play();
}

// controls
playBtn.addEventListener("click", ()=> (audio.paused ? play() : pause()));
prevBtn.addEventListener("click", ()=>{
  index = (index - 1 + tracks.length) % tracks.length;
  playIndex(index);
});
nextBtn.addEventListener("click", ()=>{
  index = (index + 1) % tracks.length;
  playIndex(index);
});

// progress bar seeking
function seekAt(clientX){
  const rect = bar.getBoundingClientRect();
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const pct = x / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
}
bar.addEventListener("mousedown", e=>{ seeking=true; seekAt(e.clientX); });
document.addEventListener("mousemove", e=>{ if(seeking) seekAt(e.clientX); });
document.addEventListener("mouseup", ()=>{ seeking=false; });

// audio events
audio.addEventListener("timeupdate", ()=>{
  const dur = audio.duration || 0, cur = audio.currentTime || 0;
  const pct = dur ? (cur/dur)*100 : 0;
  fill.style.width = pct + "%";
  knob.style.left = pct + "%";
  mpCur.textContent = format(cur);
  mpDur.textContent = format(dur);
});
audio.addEventListener("loadedmetadata", ()=>{
  mpDur.textContent = format(audio.duration);
});
audio.addEventListener("pause", ()=> gif.style.opacity = 0);
audio.addEventListener("play", ()=> gif.style.opacity = 1);
audio.addEventListener("ended", ()=>{
  index = (index + 1) % tracks.length;
  playIndex(index);
});

// volume
vol.addEventListener("input", ()=> audio.volume = vol.value/100);

// init
setNowPlaying(index);
audio.volume = vol.value/100;
