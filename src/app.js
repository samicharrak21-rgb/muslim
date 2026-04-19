import { getItem, setItem, removeItem } from './services/storage.js';
import { prayerPack, fmt } from './services/prayer.js';

const views = [
  ['home','الرئيسية'],['quran','القرآن'],['search','البحث'],['favorites','المفضلة'],['khatma','الختمة'],['adhkar','الأذكار'],['duas','الأدعية'],['prayer','المواقيت'],['qibla','القبلة'],['audio','الصوتيات'],['library','المكتبة'],['tasbih','السبحة'],['reminders','التذكيرات'],['settings','الإعدادات']
];
const nav = document.getElementById('nav');
const stats = document.getElementById('stats');
const view = document.getElementById('view');
const themeToggle = document.getElementById('themeToggle');
const splashScreen = document.getElementById('splashScreen');
const enterApp = document.getElementById('enterApp');
let surahIndex = [];
let adhkar = {};
let reciters = [];
let currentSurah = getItem('currentSurah', 1);
let count = getItem('tasbihCount', 0);
let coords = getItem('coords', { lat: 36.7538, lng: 3.0588, city: 'الجزائر' });
let cache = new Map();
let currentAudio = null;
let favorites = getItem('favorites', []);
let khatma = getItem('khatma', { page: 1, target: 'ختمة شهرية' });
let reminderState = getItem('reminderState', { fajr: false, maghrib: false, wird: false });

async function initData(){
  surahIndex = await fetch('./data/quran/index.json').then(r=>r.json());
  adhkar = await fetch('./data/adhkar/adhkar.json').then(r=>r.json());
  reciters = await fetch('./data/meta/reciters.json').then(r=>r.json());
}
async function getSurah(id){ if(cache.has(id)) return cache.get(id); const s = await fetch(`./data/quran/surah_${String(id).padStart(3,'0')}.json`).then(r=>r.json()); cache.set(id,s); return s; }
async function searchQuran(term){
  const results = [];
  if(!term || term.trim().length < 2) return results;
  const q = term.trim();
  for(const meta of surahIndex){
    const s = await getSurah(meta.id);
    s.ayahs.forEach((a, i) => { if(a.includes(q)) results.push({ surahId: meta.id, surahName: meta.name, ayahNumber: i+1, text: a }); });
    if(results.length >= 80) break;
  }
  return results;
}
function mp3Name(surah, ayah){ return `${String(surah).padStart(3,'0')}${String(ayah).padStart(3,'0')}.mp3`; }
function audioUrl(base, surah, ayah=1){ return `${base}${mp3Name(surah, ayah)}`; }
function stopAudio(){ if(currentAudio){ currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; } }
function toggleFavorite(surahId){ favorites = favorites.includes(surahId) ? favorites.filter(x=>x!==surahId) : [...favorites, surahId]; setItem('favorites', favorites); }
function reminderBadge(v){ return v ? 'مفعل' : 'غير مفعل'; }
function saveReminder(key, value){ reminderState = { ...reminderState, [key]: value }; setItem('reminderState', reminderState); }

nav.innerHTML = views.map(([id,label],i)=>`<button class='${i===0?'active':''}' data-view='${id}'>${label}</button>`).join('');
stats.innerHTML = [[114,'سورة كاملة'],['6236','آية'],['14','أقسام'],['5.0.0','الإصدار']].map(([a,b])=>`<div class='stat'><strong>${a}</strong><span>${b}</span></div>`).join('');
document.documentElement.dataset.theme = getItem('theme','dark');
themeToggle.addEventListener('click', ()=>{ const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; setItem('theme', next); });
if(enterApp && splashScreen){ enterApp.addEventListener('click', ()=> splashScreen.classList.add('hidden')); setTimeout(()=> splashScreen.classList.add('hidden'), 2600); }

const duas = [
  {title:'دعاء الاستخارة', text:'اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك وأسألك من فضلك العظيم.'},
  {title:'دعاء الكرب', text:'لا إله إلا الله العظيم الحليم، لا إله إلا الله رب العرش العظيم.'},
  {title:'دعاء الهم والحزن', text:'اللهم إني عبدك ابن عبدك ابن أمتك ناصيتي بيدك.'},
  {title:'دعاء السفر', text:'سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون.'}
];
const ward = ['قراءة حزب يومياً','100 استغفار','50 صلاة على النبي','دعاء ختام اليوم'];
const library = ['الأربعون النووية','رياض الصالحين','الأذكار للنووي','مختارات قرآنية','حصن المسلم'];

async function render(name='home'){
  stopAudio();
  if(name === 'home'){
    view.innerHTML = `<article class='card'><h3>النسخة الشاملة الآن</h3><p>تجمع هذه النسخة القرآن كاملاً، والبحث، والمفضلة، والختمة، والأذكار، والأدعية، والمواقيت، والقبلة، والصوتيات، والسبحة، والتذكيرات، والمكتبة.</p><div class='notice'>تم تصميمها كأساس موحد قابل للتثبيت والتوسعة.</div></article><article class='card'><h3>الوصول السريع</h3><div class='quick-grid'><button class='ghost' data-open='quran'>القرآن</button><button class='ghost' data-open='search'>البحث</button><button class='ghost' data-open='prayer'>المواقيت</button><button class='ghost' data-open='audio'>الصوتيات</button><button class='ghost' data-open='favorites'>المفضلة</button><button class='ghost' data-open='reminders'>التذكيرات</button></div></article>`;
  }
  if(name === 'quran'){
    const s = await getSurah(currentSurah);
    const fav = favorites.includes(currentSurah);
    view.innerHTML = `<article class='card'><h3>قارئ القرآن</h3><div class='toolbar'><select id='surahSel' class='input'>${surahIndex.map(x=>`<option value='${x.id}' ${x.id===currentSurah?'selected':''}>${x.id} - ${x.name}</option>`).join('')}</select><button class='ghost' id='bookmark'>حفظ</button><button class='ghost' id='favBtn'>${fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}</button></div><div class='badge'>${s.name} • ${s.versesCount} آية</div>${s.ayahs.map((a,i)=>`<div class='ayah'><strong>${i+1}</strong> ${a}</div>`).join('')}</article>`;
  }
  if(name === 'search'){
    view.innerHTML = `<article class='card'><h3>البحث في القرآن</h3><div class='toolbar'><input id='searchInput' class='input' placeholder='اكتب كلمة أو جزءاً من آية'><button class='primary' id='doSearch'>بحث</button></div><div id='searchResults' class='list'></div></article>`;
  }
  if(name === 'favorites'){
    const items = favorites.length ? favorites.map(id => surahIndex.find(s=>s.id===id)).filter(Boolean) : [];
    view.innerHTML = `<article class='card'><h3>المفضلة</h3><ul class='list'>${items.length ? items.map(x=>`<li><strong>${x.id} - ${x.name}</strong><button class='ghost open-surah' data-surah='${x.id}'>فتح</button></li>`).join('') : '<li>لا توجد سور مفضلة بعد.</li>'}</ul></article>`;
  }
  if(name === 'khatma'){
    const progress = Math.min(100, Math.round((khatma.page / 604) * 100));
    view.innerHTML = `<article class='card'><h3>الختمة</h3><div class='notice'>الخطة الحالية: ${khatma.target}</div><div class='progress'><span style='width:${progress}%'></span></div><p>الصفحة الحالية: <strong>${khatma.page}</strong> من 604</p><div class='toolbar'><button class='primary' id='nextPage'>صفحة +1</button><button class='ghost' id='resetKhatma'>إعادة</button></div></article>`;
  }
  if(name === 'adhkar'){
    view.innerHTML = `<article class='card'><h3>الأذكار</h3><ul class='list'>${[...adhkar.morning,...adhkar.evening,...adhkar.sleep,...adhkar.afterPrayer,...adhkar.travel,...adhkar.rain].map(x=>`<li>${x}</li>`).join('')}</ul></article>`;
  }
  if(name === 'duas'){
    view.innerHTML = `<article class='card'><h3>الأدعية</h3><ul class='list'>${duas.map(d=>`<li><strong>${d.title}</strong><div class='muted'>${d.text}</div></li>`).join('')}</ul></article>`;
  }
  if(name === 'prayer'){
    const p = prayerPack(coords.lat, coords.lng);
    view.innerHTML = `<article class='card'><h3>المواقيت</h3><div class='toolbar'><button class='ghost' id='geoBtn'>تحديث الموقع</button><span class='badge'>${coords.city}</span></div><ul class='list'><li>الفجر: ${fmt(p.fajr)}</li><li>الشروق: ${fmt(p.sunrise)}</li><li>الظهر: ${fmt(p.dhuhr)}</li><li>العصر: ${fmt(p.asr)}</li><li>المغرب: ${fmt(p.maghrib)}</li><li>العشاء: ${fmt(p.isha)}</li><li>منتصف الليل: ${fmt(p.middleOfTheNight)}</li><li>الثلث الأخير: ${fmt(p.lastThirdOfTheNight)}</li></ul></article>`;
  }
  if(name === 'qibla'){
    const p = prayerPack(coords.lat, coords.lng);
    view.innerHTML = `<article class='card'><h3>القبلة</h3><div style='display:grid;place-items:center;min-height:260px'><div class='disc'></div></div><p>زاوية القبلة الحالية: <strong>${p.qibla.toFixed(2)}°</strong></p></article>`;
  }
  if(name === 'audio'){
    view.innerHTML = `<article class='card'><h3>الصوتيات</h3><div class='toolbar'><select id='audioSurah' class='input'>${surahIndex.map(x=>`<option value='${x.id}' ${x.id===currentSurah?'selected':''}>${x.id} - ${x.name}</option>`).join('')}</select></div>${reciters.map(r=>`<div class='notice'><strong>${r.name}</strong><div class='muted'>تشغيل تجريبي لأول آية من السورة المختارة</div><button class='ghost play-audio' data-base='${r.streamBase}'>تشغيل</button></div>`).join('')}<audio id='player' controls preload='none'></audio></article>`;
  }
  if(name === 'library'){
    view.innerHTML = `<article class='card'><h3>المكتبة</h3><div class='library'>${library.map(b=>`<div class='book'>${b}</div>`).join('')}</div></article>`;
  }
  if(name === 'tasbih'){
    view.innerHTML = `<article class='card'><h3>السبحة</h3><div class='counter'><strong id='count'>${count}</strong><div class='toolbar'><button class='primary' id='inc'>تسبيحة</button><button class='ghost' id='reset'>إعادة</button></div></div></article>`;
  }
  if(name === 'reminders'){
    view.innerHTML = `<article class='card'><h3>التذكيرات</h3><ul class='list'><li>تذكير الفجر: <strong>${reminderBadge(reminderState.fajr)}</strong> <button class='ghost rem' data-key='fajr'>تبديل</button></li><li>تذكير المغرب: <strong>${reminderBadge(reminderState.maghrib)}</strong> <button class='ghost rem' data-key='maghrib'>تبديل</button></li><li>تذكير الورد: <strong>${reminderBadge(reminderState.wird)}</strong> <button class='ghost rem' data-key='wird'>تبديل</button></li></ul><div class='notice'>البنية جاهزة لربط Local Notifications على الجهاز.</div></article>`;
  }
  if(name === 'settings'){
    view.innerHTML = `<article class='card'><h3>الإعدادات</h3><ul class='list'><li>المظهر الحالي: ${document.documentElement.dataset.theme}</li><li>السورة الأخيرة: ${currentSurah}</li><li>الموقع الحالي: ${coords.city}</li><li>عدد المفضلة: ${favorites.length}</li></ul><div class='toolbar'><button class='ghost' id='clearData'>تصفير البيانات</button></div></article>`;
  }
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  bind(name);
}

function bind(name){
  const sel = document.getElementById('surahSel');
  if(sel) sel.onchange = async e => { currentSurah = Number(e.target.value); setItem('currentSurah', currentSurah); await render('quran'); };
  const bm = document.getElementById('bookmark');
  if(bm) bm.onclick = ()=> { setItem('currentSurah', currentSurah); bm.textContent = 'تم'; };
  const favBtn = document.getElementById('favBtn');
  if(favBtn) favBtn.onclick = async ()=> { toggleFavorite(currentSurah); await render('quran'); };
  document.querySelectorAll('.open-surah').forEach(btn => btn.onclick = async ()=> { currentSurah = Number(btn.dataset.surah); setItem('currentSurah', currentSurah); await render('quran'); });
  const inc = document.getElementById('inc');
  const reset = document.getElementById('reset');
  const countEl = document.getElementById('count');
  if(inc && reset && countEl){ inc.onclick = ()=> { count += 1; countEl.textContent = count; setItem('tasbihCount', count); }; reset.onclick = ()=> { count = 0; countEl.textContent = 0; setItem('tasbihCount', 0); }; }
  const geo = document.getElementById('geoBtn');
  if(geo && navigator.geolocation){ geo.onclick = ()=> navigator.geolocation.getCurrentPosition(async p => { coords = { lat: p.coords.latitude, lng: p.coords.longitude, city: 'موقعي الحالي' }; setItem('coords', coords); await render('prayer'); }, ()=> geo.textContent='تعذر الوصول'); }
  const clear = document.getElementById('clearData');
  if(clear) clear.onclick = ()=> { ['theme','coords','tasbihCount','currentSurah','favorites','khatma','reminderState'].forEach(removeItem); location.reload(); };
  const searchBtn = document.getElementById('doSearch');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  if(searchBtn && searchInput && searchResults){ searchBtn.onclick = async ()=> { searchResults.innerHTML = '<li>جارٍ البحث...</li>'; const found = await searchQuran(searchInput.value); searchResults.innerHTML = found.length ? found.map(x=>`<li><strong>${x.surahId} - ${x.surahName} : ${x.ayahNumber}</strong><div class='muted'>${x.text}</div></li>`).join('') : '<li>لا توجد نتائج.</li>'; }; }
  const audioButtons = document.querySelectorAll('.play-audio');
  const player = document.getElementById('player');
  const audioSurah = document.getElementById('audioSurah');
  if(audioButtons.length && player && audioSurah){ audioButtons.forEach(btn => btn.onclick = ()=> { const surah = Number(audioSurah.value); const url = audioUrl(btn.dataset.base, surah, 1); player.src = url; player.play(); currentAudio = player; }); }
  document.querySelectorAll('.rem').forEach(btn => btn.onclick = ()=> { const key = btn.dataset.key; saveReminder(key, !reminderState[key]); render('reminders'); });
  const nextPage = document.getElementById('nextPage');
  const resetKhatma = document.getElementById('resetKhatma');
  if(nextPage) nextPage.onclick = ()=> { khatma = { ...khatma, page: Math.min(604, khatma.page + 1) }; setItem('khatma', khatma); render('khatma'); };
  if(resetKhatma) resetKhatma.onclick = ()=> { khatma = { ...khatma, page: 1 }; setItem('khatma', khatma); render('khatma'); };
}

nav.addEventListener('click', async e => { const btn = e.target.closest('button[data-view]'); if(btn) await render(btn.dataset.view); });
document.addEventListener('click', async e => { const btn = e.target.closest('[data-open]'); if(btn) await render(btn.dataset.open); });
await initData();
await render('home');
