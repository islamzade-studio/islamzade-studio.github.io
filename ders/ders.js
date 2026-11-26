// Islamzade Studio — onlayn dərs, tələbə səhifəsi (brauzerdə, heç nə yükləmədən).
// Bağlantı: VDO.Ninja SDK (P2P WebRTC, şifrəli). Müəllimin idarə mesajları data kanalı ilə gəlir.
(function () {
  'use strict';
  const T = {
    az: {
      title: 'Onlayn dərs', joinHint: 'Adınızı yazın və dərsə qoşulun. Qoşulanda mikrofonunuz və kameranız bağlı olacaq.',
      namePh: 'Adınız və soyadınız', join: 'Dərsə qoşul', privacy: 'Brauzer kamera və mikrofon üçün icazə soruşacaq — "İcazə ver" basın. Onlar yalnız sizin istəyinizlə açılır.',
      needName: 'Adınızı yazın.', badLink: 'Link natamamdır. Müəllimdən linki yenidən istəyin.',
      connecting: 'Qoşulur…', waitTitle: 'Gözləyin', waitBody: 'Müəllim sizi dərsə qəbul edəcək.',
      teacherWait: 'Müəllimin görüntüsü gözlənilir…', hand: 'Əl qaldır', mic: 'Mikrofon', cam: 'Kamera', leave: 'Çıx',
      yesOpen: 'Aç', no: 'Yox', askMic: 'Müəllim mikrofonunuzu açmağınızı istəyir', askCam: 'Müəllim kameranızı açmağınızı istəyir',
      mutedBy: 'Müəllim mikrofonunuzu bağladı', camBy: 'Müəllim kameranızı bağladı', locked: 'Müəllim icazə verməyib. 🙋 Əl qaldırın.',
      handUp: 'Əliniz qaldırıldı — müəllim görür', handDown: 'Müəllim əlinizi endirdi',
      noDevice: 'Kamera/mikrofon tapılmadı və ya icazə verilmədi. Dərsi yenə də izləyə bilərsiniz.',
      endTitle: 'Dərs bitdi', endBody: 'Təşəkkür edirik! Müəllim dərsi bitirdi.',
      kickTitle: 'Dərsdən çıxarıldınız', kickBody: 'Müəllim sizi dərsdən çıxardı.',
      leftTitle: 'Dərsdən çıxdınız', leftBody: 'Yenidən qoşulmaq üçün düyməni basın.', rejoin: 'Yenidən qoşul',
      errTitle: 'Qoşulmaq alınmadı', errBody: 'İnterneti yoxlayıb səhifəni yeniləyin.', reload: 'Səhifəni yenilə', you: 'Siz'
    },
    tr: {
      title: 'Online ders', joinHint: 'Adınızı yazın ve derse katılın. Katıldığınızda mikrofonunuz ve kameranız kapalı olacak.',
      namePh: 'Adınız ve soyadınız', join: 'Derse katıl', privacy: 'Tarayıcı kamera ve mikrofon için izin isteyecek — "İzin ver"e basın. Bunlar yalnızca sizin isteğinizle açılır.',
      needName: 'Adınızı yazın.', badLink: 'Link eksik. Eğitmenden linki tekrar isteyin.',
      connecting: 'Bağlanıyor…', waitTitle: 'Bekleyin', waitBody: 'Eğitmen sizi derse kabul edecek.',
      teacherWait: 'Eğitmenin görüntüsü bekleniyor…', hand: 'El kaldır', mic: 'Mikrofon', cam: 'Kamera', leave: 'Çık',
      yesOpen: 'Aç', no: 'Hayır', askMic: 'Eğitmen mikrofonunuzu açmanızı istiyor', askCam: 'Eğitmen kameranızı açmanızı istiyor',
      mutedBy: 'Eğitmen mikrofonunuzu kapattı', camBy: 'Eğitmen kameranızı kapattı', locked: 'Eğitmen izin vermedi. 🙋 El kaldırın.',
      handUp: 'Eliniz kalktı — eğitmen görüyor', handDown: 'Eğitmen elinizi indirdi',
      noDevice: 'Kamera/mikrofon bulunamadı veya izin verilmedi. Dersi yine de izleyebilirsiniz.',
      endTitle: 'Ders bitti', endBody: 'Teşekkür ederiz! Eğitmen dersi bitirdi.',
      kickTitle: 'Dersten çıkarıldınız', kickBody: 'Eğitmen sizi dersten çıkardı.',
      leftTitle: 'Dersten çıktınız', leftBody: 'Tekrar katılmak için düğmeye basın.', rejoin: 'Tekrar katıl',
      errTitle: 'Bağlanılamadı', errBody: 'İnterneti kontrol edip sayfayı yenileyin.', reload: 'Sayfayı yenile', you: 'Siz'
    }
  };
  const $ = (s) => document.querySelector(s);
  const ALPH = 'abcdefghjkmnpqrstuvwxyz23456789';
  const rid = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((x) => ALPH[x % ALPH.length]).join(''); };
  const H = new URLSearchParams(location.hash.slice(1));
  const P = { room: H.get('r') || '', pw: H.get('p') || '' };
  let lang = H.get('l') || ((navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'az');
  try { const sv = localStorage.getItem('izs.lang'); if (sv) lang = sv; } catch (e) {}
  const t = (k) => (T[lang] || T.az)[k] || k;
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('#name').placeholder = t('namePh');
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
  }
  document.querySelectorAll('.lang button').forEach((b) => (b.onclick = () => { lang = b.dataset.l; try { localStorage.setItem('izs.lang', lang); } catch (e) {} applyLang(); render(); }));
  try { $('#name').value = localStorage.getItem('izs.name') || ''; } catch (e) {}

  let toastT = null;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.remove('hide'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.add('hide'), 3500); }
  function show(scr) { for (const id of ['#scrJoin', '#scrMsg', '#room']) $(id).classList.toggle('hide', id !== scr); }
  function message(title, body, btn, fn) {
    $('#msgTitle').textContent = title; $('#msgBody').textContent = body;
    const b = $('#msgBtn'); b.classList.toggle('hide', !btn); if (btn) { b.textContent = btn; b.onclick = fn; }
    show('#scrMsg');
  }

  const S = { sdk: null, me: '', name: '', stream: null, mic: false, cam: false, hand: false, st: null, tid: '', viewing: new Map(), tiles: new Map(), joined: false, ended: false, hb: null, gotState: false };

  function myPeer() { return (S.st && S.st.peers && S.st.peers[S.me]) || null; }
  function admitted() { const p = myPeer(); return S.st ? (!S.st.waiting || (p && p.admitted)) : false; }
  function send(m) { if (!S.sdk) return; m.id = S.me; m.name = S.name; try { S.sdk.sendData(m); } catch (e) {} }
  function sendMe() { send({ t: 'me', mic: S.mic, cam: S.cam, hand: S.hand }); }

  function setTrack(kind, on) {
    if (!S.stream) return false;
    const tr = kind === 'mic' ? S.stream.getAudioTracks() : S.stream.getVideoTracks();
    if (!tr.length) return false;
    tr.forEach((x) => { x.enabled = on; });
    return true;
  }
  function setMic(on, fromTeacher) {
    if (on && !setTrack('mic', true)) { toast(t('noDevice')); return; }
    if (!on) setTrack('mic', false);
    S.mic = on; render(); sendMe();
    if (!on && fromTeacher) toast(t('mutedBy'));
  }
  function setCam(on, fromTeacher) {
    if (on && !setTrack('cam', true)) { toast(t('noDevice')); return; }
    if (!on) setTrack('cam', false);
    S.cam = on; render(); sendMe();
    if (!on && fromTeacher) toast(t('camBy'));
  }
  function canMic() { const p = myPeer(); return !(p && p.micLock); }
  function canCam() { const p = myPeer(); return !(p && p.camLock); }

  $('#bMic').onclick = () => { if (S.mic) return setMic(false); if (!canMic()) return toast(t('locked')); setMic(true); };
  $('#bCam').onclick = () => { if (S.cam) return setCam(false); if (!canCam()) return toast(t('locked')); setCam(true); };
  $('#bHand').onclick = () => { S.hand = !S.hand; render(); sendMe(); if (S.hand) toast(t('handUp')); };
  $('#bLeave').onclick = () => leave('left');

  let askKind = '';
  function ask(kind) {
    askKind = kind; $('#askTitle').textContent = kind === 'mic' ? t('askMic') : t('askCam'); $('#ask').classList.remove('hide');
  }
  $('#askYes').onclick = () => { $('#ask').classList.add('hide'); if (askKind === 'mic') setMic(true); else setCam(true); };
  $('#askNo').onclick = () => $('#ask').classList.add('hide');

  // ---- Görüntülər ----
  function tileFor(sid) {
    let el = S.tiles.get(sid);
    if (!el) {
      el = document.createElement('div'); el.className = 'tile';
      el.innerHTML = '<video autoplay playsinline></video><div class="ph">👤</div><div class="nm"></div>';
      S.tiles.set(sid, el); $('#strip').appendChild(el);
    }
    return el;
  }
  function removeTile(sid) { const el = S.tiles.get(sid); if (el) { el.remove(); S.tiles.delete(sid); } }
  function onTrack(ev) {
    const d = ev.detail || {}; const tr = d.track, sid = d.streamID;
    if (!tr || !sid) return;
    if (sid === S.tid || sid.startsWith('izt')) {
      const v = $('#mainVid'); let ms = v.srcObject; if (!ms) { ms = new MediaStream(); v.srcObject = ms; }
      ms.getTracks().filter((x) => x.kind === tr.kind).forEach((x) => ms.removeTrack(x)); ms.addTrack(tr);
      v.muted = false; v.play().catch(() => {});
      render(); return;
    }
    if (sid.startsWith('izs') && sid !== S.me) {
      const el = tileFor(sid), v = el.querySelector('video');
      let ms = v.srcObject; if (!ms) { ms = new MediaStream(); v.srcObject = ms; }
      ms.getTracks().filter((x) => x.kind === tr.kind).forEach((x) => ms.removeTrack(x)); ms.addTrack(tr);
      v.play().catch(() => {});
      render();
    }
  }
  async function view(sid, video) {
    if (!S.sdk) return;
    const cur = S.viewing.get(sid);
    if (cur && cur.video === video) return;
    if (cur) { try { S.sdk.stopViewing(sid); } catch (e) {} const el = S.tiles.get(sid); if (el) { const v = el.querySelector('video'); if (v.srcObject) v.srcObject.getVideoTracks().forEach((x) => v.srcObject.removeTrack(x)); } }
    S.viewing.set(sid, { video });
    try { await S.sdk.view(sid, { audio: true, video, label: S.name }); } catch (e) { S.viewing.delete(sid); }
  }
  function unview(sid) { if (!S.viewing.has(sid)) return; try { S.sdk.stopViewing(sid); } catch (e) {} S.viewing.delete(sid); removeTile(sid); }
  function syncViews() {
    if (!S.st || !admitted()) return;
    if (S.st.tid) { S.tid = S.st.tid; view(S.tid, true); }
    const peers = S.st.peers || {};
    for (const sid of Object.keys(peers)) {
      if (sid === S.me) continue;
      if (peers[sid].admitted || !S.st.waiting) view(sid, !!S.st.see); else unview(sid);
    }
    for (const sid of [...S.viewing.keys()]) if (sid.startsWith('izs') && !peers[sid]) unview(sid);
  }

  // ---- Vəziyyət ----
  function render() {
    applyLang();
    if (!S.joined) return;
    if (!admitted()) { if (S.gotState) message(t('waitTitle'), t('waitBody')); else message(t('connecting'), ''); return; }
    show('#room');
    const hasT = $('#mainVid').srcObject && $('#mainVid').srcObject.getVideoTracks().length;
    $('#mainMsg').textContent = hasT ? '' : t('teacherWait');
    $('#mainMsg').classList.toggle('hide', !!hasT);
    const bm = $('#bMic'), bc = $('#bCam'), bh = $('#bHand');
    bm.className = 'btn ' + (S.mic ? 'on' : 'off') + (!S.mic && !canMic() ? ' lock' : '');
    bc.className = 'btn ' + (S.cam ? 'on' : 'off') + (!S.cam && !canCam() ? ' lock' : '');
    bh.className = 'btn' + (S.hand ? ' on' : '');
    const peers = (S.st && S.st.peers) || {};
    const see = S.st && S.st.see;
    $('#strip').classList.toggle('hide', !see && !S.cam);
    // öz kiçik görüntüsü
    const meTile = tileFor(S.me); const mv = meTile.querySelector('video');
    if (S.stream && mv.srcObject !== S.stream) { mv.srcObject = new MediaStream(S.stream.getVideoTracks()); mv.muted = true; mv.play().catch(() => {}); }
    meTile.querySelector('.nm').textContent = t('you') + (S.mic ? '' : ' 🔇');
    meTile.querySelector('.ph').classList.toggle('hide', S.cam);
    mv.classList.toggle('hide', !S.cam);
    for (const [sid, el] of S.tiles) {
      if (sid === S.me) continue;
      const p = peers[sid]; if (!p) continue;
      el.classList.toggle('hide', !see);
      el.querySelector('.nm').textContent = (p.hand ? '🙋 ' : '') + (p.name || '') + (p.mic ? '' : ' 🔇');
      const v = el.querySelector('video'); v.muted = !p.mic; v.classList.toggle('hide', !p.cam);
      el.querySelector('.ph').classList.toggle('hide', !!p.cam);
    }
  }
  function onState(m) {
    const first = !S.gotState; S.gotState = true;
    const wasAdmitted = admitted();
    S.st = m; S.tid = m.tid || S.tid;
    const p = myPeer();
    if (p) {
      if (S.mic && p.micLock) setMic(false, true);
      if (S.cam && p.camLock) setCam(false, true);
      if (S.hand && !p.hand && !first) { S.hand = false; toast(t('handDown')); }
    }
    if (first || (!wasAdmitted && admitted())) sendMe();
    syncViews(); render();
  }
  function onData(ev) {
    const d = ev.detail || {}; let m = d.data;
    if (typeof m === 'string') { try { m = JSON.parse(m); } catch (e) { return; } }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'state') return onState(m);
    if (m.t === 'end') return leave('end');
    if (m.t === 'kick' && m.to === S.me) return leave('kick');
    if (m.t === 'cmd' && (m.to === S.me || m.to === '*')) {
      if (m.a === 'mute') setMic(false, true);
      else if (m.a === 'camoff') setCam(false, true);
      else if (m.a === 'askmic') { if (!S.mic) ask('mic'); }
      else if (m.a === 'askcam') { if (!S.cam) ask('cam'); }
      else if (m.a === 'lower') { if (S.hand) { S.hand = false; toast(t('handDown')); render(); sendMe(); } }
      else if (m.a === 'enforce') { const p = myPeer(); if (p && p.micLock && S.mic) setMic(false, true); if (p && p.camLock && S.cam) setCam(false, true); }
    }
  }

  async function getMedia() {
    const A = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    const V = { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } };
    for (const c of [{ audio: A, video: V }, { audio: A }, { video: V }]) {
      try { return await navigator.mediaDevices.getUserMedia(c); } catch (e) {}
    }
    return null;
  }

  async function join() {
    const name = $('#name').value.trim();
    if (!name) { $('#joinErr').textContent = t('needName'); return; }
    if (!P.room || !P.pw) { $('#joinErr').textContent = t('badLink'); return; }
    try { localStorage.setItem('izs.name', name); } catch (e) {}
    S.name = name; S.me = 'izs' + rid(9); S.joined = true; S.ended = false; S.gotState = false; S.st = null;
    message(t('connecting'), '');
    S.stream = await getMedia();
    if (!S.stream) toast(t('noDevice'));
    else S.stream.getTracks().forEach((x) => { x.enabled = false; });
    S.mic = false; S.cam = false; S.hand = false;
    try {
      const sdk = new window.VDONinjaSDK({ salt: 'vdo.ninja', password: P.pw, debug: false });
      S.sdk = sdk;
      sdk.addEventListener('dataReceived', onData);
      sdk.addEventListener('track', onTrack);
      sdk.addEventListener('listing', () => syncViews());
      sdk.addEventListener('streamAdded', () => syncViews());
      sdk.addEventListener('peerDisconnected', () => setTimeout(syncViews, 500));
      await sdk.connect();
      await sdk.joinRoom({ room: P.room, password: P.pw });
      if (S.stream) await sdk.publish(S.stream, { streamID: S.me, label: name, media: { video: { maxBitrate: 600 } } });
      else await sdk.announce({ streamID: S.me, label: name });
    } catch (e) {
      S.joined = false; message(t('errTitle'), t('errBody'), t('reload'), () => location.reload()); return;
    }
    clearInterval(S.hb);
    send({ t: 'hello', mic: false, cam: false, hand: false });
    // müəllimə özümüzü tanıdırıq: vəziyyət gələnə qədər tez-tez, sonra 10 saniyədən bir
    let n = 0;
    S.hb = setInterval(() => { n++; if (!S.gotState || n % 5 === 0) send({ t: S.gotState ? 'me' : 'hello', mic: S.mic, cam: S.cam, hand: S.hand }); }, 2000);
    render();
  }
  async function leave(why) {
    if (!S.joined) return;
    S.joined = false; clearInterval(S.hb);
    if (why === 'left') send({ t: 'bye' });
    const sdk = S.sdk; S.sdk = null;
    setTimeout(async () => { try { await sdk.stopPublishing(); } catch (e) {} try { await sdk.disconnect(); } catch (e) {} }, 300);
    if (S.stream) S.stream.getTracks().forEach((x) => x.stop());
    S.stream = null; S.viewing.clear(); for (const sid of [...S.tiles.keys()]) removeTile(sid);
    $('#mainVid').srcObject = null; $('#ask').classList.add('hide');
    if (why === 'end') message(t('endTitle'), t('endBody'));
    else if (why === 'kick') message(t('kickTitle'), t('kickBody'));
    else message(t('leftTitle'), t('leftBody'), t('rejoin'), () => { show('#scrJoin'); });
  }
  window.addEventListener('beforeunload', () => { if (S.joined) send({ t: 'bye' }); });
  $('#joinBtn').onclick = join;
  $('#name').addEventListener('keydown', (e) => { if (e.key === 'Enter') join(); });
  applyLang();
  if (!P.room || !P.pw) $('#joinErr').textContent = t('badLink');
})();
