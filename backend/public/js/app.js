const API = '/api';
const $ = (id) => document.getElementById(id);
let session = JSON.parse(localStorage.getItem('saepvision_session') || 'null');
let currentPhotos = [];
let searchTimer;

function headers(json=true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (session?.token) h.Authorization = `Bearer ${session.token}`;
  return h;
}
async function request(url, options={}) {
  const response = await fetch(API + url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || 'Ocorreu um erro.');
  return data;
}
function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function notify(message) { window.alert(message); }
function openAuth(mode='login') {
  $('authModal').classList.remove('hidden');
  setAuthMode(mode);
}
function closeAuth() { $('authModal').classList.add('hidden'); }
function setAuthMode(mode) {
  const register = mode === 'register';
  $('modalTitle').textContent = register ? 'Criar conta' : 'Login';
  $('loginForm').classList.toggle('hidden', register);
  $('registerForm').classList.toggle('hidden', !register);
  $('switchAuth').classList.toggle('hidden', register);
  $('loginError').textContent = ''; $('registerError').textContent = '';
}
function updateHeader() {
  const logged = !!session?.token;
  $('userLabel').textContent = logged ? session.usuario.nome : 'Visitante';
  $('avatar').textContent = logged ? session.usuario.nome.charAt(0).toUpperCase() : 'S';
  $('profileButton').disabled = !logged;
  $('loginButton').classList.toggle('hidden', logged);
  $('registerButton').classList.toggle('hidden', logged);
  $('newPostButton').classList.toggle('hidden', !(logged && session.usuario.tipo === 'fotografo'));
}
async function loadPhotos(url='') {
  try {
    const query = session?.usuario?.id ? `?usuario=${session.usuario.id}` : '';
    currentPhotos = await request('/publicacoes' + query);
    if (url) currentPhotos = currentPhotos.filter(p => String(p.fotografo_id) === String(url));
    renderPhotos(currentPhotos);
  } catch (e) { $('gallery').innerHTML = ''; notify(e.message); }
}
function renderPhotos(photos) {
  $('gallery').innerHTML = photos.map(p => `
    <article class="photo-card">
      <div class="photo-image-wrap">
        <img class="photo-image" src="${escapeHtml(p.imagem)}" alt="${escapeHtml(p.titulo)}" loading="lazy">
        <div class="photo-overlay"><span>Foto tirada por @${escapeHtml(p.usuario)} · Local: ${escapeHtml(p.local)}</span></div>
      </div>
      <div class="photo-info">
        <h3 class="photo-title">${escapeHtml(p.titulo)}</h3>
        <div class="photo-meta">
          <button class="photo-author" data-profile="${p.fotografo_id}">@${escapeHtml(p.usuario)}</button>
          <span>⌖ ${escapeHtml(p.local)}</span>
        </div>
        <div class="photo-bottom">
          <button class="like-button ${Number(p.curtida_por_mim) ? 'liked' : ''}" data-like="${p.id}" aria-label="Curtir publicação">
            <span class="heart">♥</span><span>${Number(p.curtidas)}</span>
          </button>
          ${session?.usuario?.id === p.fotografo_id ? `<button class="delete-button" data-delete="${p.id}" title="Excluir publicação">▤</button>` : ''}
        </div>
      </div>
    </article>`).join('');
  $('emptyState').classList.toggle('hidden', photos.length > 0);
}
$('gallery').addEventListener('click', async e => {
  const like = e.target.closest('[data-like]');
  const profile = e.target.closest('[data-profile]');
  const del = e.target.closest('[data-delete]');
  if (like) {
    if (!session) return openAuth('login');
    try { await request(`/publicacoes/${like.dataset.like}/curtir`, {method:'POST', headers:headers(false)});
      await loadPhotos();
    } catch(err) { notify(err.message); }
  }
  if (profile) openProfile(profile.dataset.profile);
  if (del && confirm('Deseja realmente excluir esta publicação?')) {
    try { await request(`/publicacoes/${del.dataset.delete}`, {method:'DELETE', headers:headers(false)}); await loadPhotos(); }
    catch(err) { notify(err.message); }
  }
});
$('loginButton').onclick = () => openAuth('login');
$('registerButton').onclick = () => openAuth('register');
$('closeAuth').onclick = closeAuth;
$('goRegister').onclick = () => setAuthMode('register');
$('closePost').onclick = () => $('postModal').classList.add('hidden');
$('newPostButton').onclick = () => $('postModal').classList.remove('hidden');
$('authModal').addEventListener('click', e => { if (e.target === $('authModal')) closeAuth(); });
$('postModal').addEventListener('click', e => { if (e.target === $('postModal')) $('postModal').classList.add('hidden'); });

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('loginError').textContent = '';
  try {
    const data = await request('/auth/login', {method:'POST', headers:headers(), body:JSON.stringify({email:$('loginEmail').value, senha:$('loginPassword').value})});
    session = data; localStorage.setItem('saepvision_session', JSON.stringify(session));
    closeAuth(); updateHeader(); await loadPhotos();
  } catch(err) { $('loginError').textContent = err.message; }
});
$('registerForm').addEventListener('submit', async e => {
  e.preventDefault(); $('registerError').textContent = '';
  try {
    await request('/auth/cadastro', {method:'POST', headers:headers(), body:JSON.stringify({
      nome:$('registerName').value, usuario:$('registerUser').value, email:$('registerEmail').value,
      senha:$('registerPassword').value, tipo:$('registerType').value
    })});
    notify('Conta criada! Agora entre com seu e-mail e senha.');
    setAuthMode('login'); $('loginEmail').value = $('registerEmail').value;
  } catch(err) { $('registerError').textContent = err.message; }
});
$('postForm').addEventListener('submit', async e => {
  e.preventDefault(); $('postError').textContent = '';
  const file = $('postImage').files[0];
  if (!file) return $('postError').textContent = 'Nenhum arquivo escolhido.';
  if (!['image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) return $('postError').textContent = 'Formato de imagem inválido.';
  if (file.size > 8*1024*1024) return $('postError').textContent = 'A imagem deve ter até 8 MB.';
  const form = new FormData();
  form.append('titulo', $('postTitle').value); form.append('local', $('postLocation').value); form.append('imagem', file);
  try {
    await request('/publicacoes', {method:'POST', headers:headers(false), body:form});
    $('postForm').reset(); $('postModal').classList.add('hidden'); await loadPhotos(); notify('Fotografia cadastrada com sucesso!');
  } catch(err) { $('postError').textContent = err.message; }
});

$('searchInput').addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = $('searchInput').value.trim();
  if (!q) { $('searchResults').classList.add('hidden'); $('searchNotice').classList.add('hidden'); loadPhotos(); return; }
  searchTimer = setTimeout(async () => {
    try {
      const users = await request('/usuarios/buscar?q=' + encodeURIComponent(q));
      $('searchResults').innerHTML = users.map(u => `<button class="search-result" data-search-profile="${u.id}"><span class="avatar">${escapeHtml(u.nome[0].toUpperCase())}</span><span><strong>${escapeHtml(u.nome)}</strong><small>@${escapeHtml(u.usuario)}</small></span></button>`).join('') || '<div class="search-result">Fotógrafo não encontrado.</div>';
      $('searchResults').classList.remove('hidden');
      if (!users.length) $('searchNotice').textContent = 'Fotógrafo não encontrado.';
      else $('searchNotice').textContent = `${users.length} fotógrafo(s) encontrado(s).`;
      $('searchNotice').classList.remove('hidden');
    } catch(e) { $('searchNotice').textContent = e.message; $('searchNotice').classList.remove('hidden'); }
  }, 250);
});
$('searchResults').addEventListener('click', e => {
  const b = e.target.closest('[data-search-profile]');
  if (b) { $('searchResults').classList.add('hidden'); $('searchInput').value=''; $('searchNotice').classList.add('hidden'); openProfile(b.dataset.searchProfile); }
});
async function openProfile(id) {
  try {
    const p = await request(`/usuarios/${id}/perfil`);
    const posts = currentPhotos.filter(x => String(x.fotografo_id) === String(id));
    $('profileContent').innerHTML = `
      <div class="profile-head"><div class="profile-avatar">${escapeHtml(p.nome[0].toUpperCase())}</div>
      <h2>${escapeHtml(p.nome)}</h2><p>@${escapeHtml(p.usuario)}</p></div>
      <div class="stats"><div><strong>${p.likes}</strong><span>Likes</span></div><div><strong>${p.publicacoes}</strong><span>Publicações</span></div></div>
      <button class="profile-tab">Suas publicações</button>
      <div class="profile-section-title">GALERIA DO FOTÓGRAFO</div>
      <div class="profile-posts">${posts.map(x=>`<img src="${escapeHtml(x.imagem)}" alt="${escapeHtml(x.titulo)}" title="${escapeHtml(x.titulo)}">`).join('') || '<small>Este fotógrafo ainda não publicou fotos.</small>'}</div>`;
    $('profilePanel').classList.remove('hidden'); $('overlay').classList.remove('hidden');
  } catch(e) { notify(e.message); }
}
function closeProfile() { $('profilePanel').classList.add('hidden'); $('overlay').classList.add('hidden'); }
$('closeProfile').onclick = closeProfile; $('overlay').onclick = closeProfile;
$('profileButton').onclick = () => {
  if (!session) return;
  if (session.usuario.tipo === 'fotografo') openProfile(session.usuario.id);
  else notify('O perfil de fotógrafo está disponível apenas para contas de fotógrafo.');
};
updateHeader(); loadPhotos();
