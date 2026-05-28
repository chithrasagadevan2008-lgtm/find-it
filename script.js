// ============================================
//   FindIt — College Lost & Found Portal
// ============================================

let currentUser = null;
let postingType = 'lost';
let uploadedImageData = null;

const CAT_EMOJI = {
  'electronics': '💻',
  'bags': '🎒',
  'id & cards': '💳',
  'keys': '🔑',
  'clothing': '👕',
  'books': '📚',
  'other': '📦'
};

// ============================================
// INITIALIZE
// ============================================

window.addEventListener('DOMContentLoaded', () => {

  const savedUser = sessionStorage.getItem('findit_user');

  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showLogin();
  }

  document.getElementById('pDate').valueAsDate = new Date();
});

// ============================================
// AUTH
// ============================================

let selectedRole = 'student';
let authMode = 'signin';

function selectRole(role) {

  selectedRole = role;

  document.getElementById('roleStudent')
    .classList.toggle('active', role === 'student');

  document.getElementById('roleFaculty')
    .classList.toggle('active', role === 'faculty');
}

function switchTab(mode) {

  authMode = mode;

  document.getElementById('tabSignin')
    .classList.toggle('active', mode === 'signin');

  document.getElementById('tabSignup')
    .classList.toggle('active', mode === 'signup');

  document.getElementById('loginBtn').textContent =
    mode === 'signin'
      ? 'Sign In →'
      : 'Create Account →';

  document.getElementById('nameGroup').style.display =
    mode === 'signup'
      ? 'block'
      : 'none';

  document.getElementById('deptGroup').style.display =
    mode === 'signup'
      ? 'block'
      : 'none';
}

// ============================================
// LOGIN / SIGNUP
// ============================================

async function handleLogin() {

  const email =
    document.getElementById('loginEmail').value.trim();

  const password =
    document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('⚠️ Fill all fields');
    return;
  }

  if (authMode === 'signup') {

    const name =
      document.getElementById('loginName').value.trim();

    const dept =
      document.getElementById('loginDept').value.trim();

    const data = await apiRegister(
      name,
      email,
      password,
      dept,
      ''
    );

    if (data.token) {

      sessionStorage.setItem(
        'findit_token',
        data.token
      );

      currentUser = {
        email,
        name,
        role: selectedRole
      };

      sessionStorage.setItem(
        'findit_user',
        JSON.stringify(currentUser)
      );

      showToast('✅ Account Created');

      showApp();

    } else {

      showToast(data.message || 'Signup Failed');
    }

  } else {

    const data = await apiLogin(email, password);

    if (data.token) {

      sessionStorage.setItem(
        'findit_token',
        data.token
      );

      currentUser = {
        email,
        name: data.user.name,
        role: data.user.role
      };

      sessionStorage.setItem(
        'findit_user',
        JSON.stringify(currentUser)
      );

      showToast('👋 Welcome ' + data.user.name);

      showApp();

    } else {

      showToast(data.message || 'Login Failed');
    }
  }
}

function logout() {

  currentUser = null;

  sessionStorage.removeItem('findit_user');
  sessionStorage.removeItem('findit_token');

  showLogin();

  showToast('Logged Out');
}

// ============================================
// PAGE SWITCHING
// ============================================

function showLogin() {

  document.getElementById('loginPage')
    .classList.add('active');

  document.getElementById('appPage')
    .classList.remove('active');
}

function showApp() {

  document.getElementById('loginPage')
    .classList.remove('active');

  document.getElementById('appPage')
    .classList.add('active');

  document.getElementById('navUser').textContent =
    currentUser.name;

  showSection('home');
}

// ============================================
// SECTIONS
// ============================================

function showSection(sec) {

  document.querySelectorAll('.section')
    .forEach(s => s.classList.remove('active'));

  document.querySelectorAll('.nav-link')
    .forEach(n => n.classList.remove('active'));

  document.getElementById(
    'sec' + sec.charAt(0).toUpperCase() + sec.slice(1)
  ).classList.add('active');

  document.getElementById(
    'nav' + sec.charAt(0).toUpperCase() + sec.slice(1)
  ).classList.add('active');

  if (sec === 'home') renderHome();
  if (sec === 'lost') renderLost();
  if (sec === 'found') renderFound();
  if (sec === 'my') renderMy();
}

// ============================================
// HOME
// ============================================

async function renderHome() {

  const items = await apiGetItems();

  const recent =
    items.slice().reverse().slice(0, 6);

  document.getElementById('homeGrid').innerHTML =
    buildGrid(recent);

  updateStats(items);
}

// ============================================
// LOST
// ============================================

async function renderLost() {

  const filters = {
    type: 'lost',
    status: 'active'
  };

  const items = await apiGetItems(filters);

  document.getElementById('lostGrid').innerHTML =
    buildGrid(items);
}

// ============================================
// FOUND
// ============================================

async function renderFound() {

  const filters = {
    type: 'found',
    status: 'active'
  };

  const items = await apiGetItems(filters);

  document.getElementById('foundGrid').innerHTML =
    buildGrid(items);
}

// ============================================
// MY POSTS
// ============================================

async function renderMy() {

  const items = await apiGetItems();

  const myItems = items.filter(i =>
    i.postedBy &&
    i.postedBy.email === currentUser.email
  );

  document.getElementById('myGrid').innerHTML =
    buildGrid(myItems, true);
}

// ============================================
// GRID
// ============================================

function buildGrid(items, isMine = false) {

  if (!items.length) {

    return `
      <div class="empty-state">
        <div class="emo">🔎</div>
        <h3>No Items Found</h3>
      </div>
    `;
  }

  return items.map((item, index) =>
    buildCard(item, index, isMine)
  ).join('');
}

// ============================================
// CARD
// ============================================

function buildCard(item, index, isMine) {

  const emoji =
    CAT_EMOJI[item.category] || '📦';

  const imgHTML = item.image
    ? `
      <img
        class="card-img"
        src="${item.image}"
        alt="${item.title}" />
    `
    : '';

  const deleteBtn = isMine
    ? `
      <button
        class="btn btn-danger sm"
        onclick="
          event.stopPropagation();
          deleteItem('${item._id}')
        ">
        🗑 Delete
      </button>
    `
    : '';

  return `
    <div
      class="item-card"
      onclick="openDetail('${item._id}')"
      style="animation-delay:${index * 0.05}s">

      <div class="card-top">

        <span class="card-emoji">
          ${emoji}
        </span>

        <span class="type-badge ${item.status === 'resolved'
          ? 'claimed-badge'
          : item.type}">

          ${item.status === 'resolved'
            ? '✅ Claimed'
            : item.type === 'lost'
              ? '🔍 Lost'
              : '📦 Found'}

        </span>

      </div>

      ${imgHTML}

      <div class="card-title">
        ${item.title}
      </div>

      <div class="card-desc">
        ${item.description}
      </div>

      <div class="card-meta">

        <span>
          📍 ${item.location}
        </span>

        <span>
          🏷️ ${item.category}
        </span>

      </div>

      <div class="card-poster">

        Posted by:
        ${item.postedBy?.name || 'Unknown'}

      </div>

      ${deleteBtn}

    </div>
  `;
}

// ============================================
// POST MODAL
// ============================================

function openPostModal(type) {

  postingType = type;

  document.getElementById('postModalTitle').textContent =
    type === 'lost'
      ? '🔍 Report Lost Item'
      : '📦 Post Found Item';

  openModal('postOverlay');
}

// ============================================
// IMAGE
// ============================================

function handleImageUpload(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    uploadedImageData = e.target.result;

    const preview =
      document.getElementById('imgPreview');

    preview.src = uploadedImageData;

    preview.style.display = 'block';
  };

  reader.readAsDataURL(file);
}

// ============================================
// SUBMIT POST
// ============================================

async function submitPost() {

  const name  = document.getElementById('pName').value.trim();
  const cat   = document.getElementById('pCat').value;
  const loc   = document.getElementById('pLoc').value;
  const desc  = document.getElementById('pDesc').value.trim();

  if (!name || !cat || !loc || !desc) {
    showToast('⚠️ Fill all fields');
    return;
  }

  try {

    const response = await fetch(
      'http://localhost:5000/api/items',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          type: postingType,
          title: name,
          category: cat.toLowerCase(),
          location: loc,
          description: desc,
          image: uploadedImageData,
          status: 'active'
        })
      }
    );

    const data = await response.json();

    if (response.ok) {

      closeModal('postOverlay');

      showToast('✅ Item Posted');

      renderHome();
      renderLost();
      renderFound();
      renderMy();

    } else {

      showToast(data.message || 'Failed');

    }

  } catch (error) {

    console.log(error);

    showToast('❌ Server Error');
  }
}

// ============================================
// DETAIL MODAL
// ============================================

async function openDetail(id) {

  const items = await apiGetItems();

  const item =
    items.find(i => i._id === id);

  if (!item) return;

  const emoji =
    CAT_EMOJI[item.category] || '📦';

  const isOwner =
    item.postedBy &&
    item.postedBy.email === currentUser.email;

  const imgHTML = item.image
    ? `
      <img
        class="detail-img"
        src="${item.image}"
        alt="${item.title}" />
    `
    : '';

  let actionBtns = '';

  if (item.status !== 'resolved') {

    if (isOwner) {

      actionBtns = `
        <button
          class="btn btn-found"
          onclick="markClaimed('${item._id}')">

          ✅ Mark Claimed

        </button>
      `;

    } else {

      actionBtns = `
        <button
          class="btn btn-blue"
          onclick="requestContact('${item._id}')">

          📞 Get Contact

        </button>

        <button
          class="btn btn-found"
          onclick="claimItem('${item._id}')">

          ✅ Claim Item

        </button>
      `;
    }
  }

  document.getElementById('detailModalContent')
    .innerHTML = `

    <div class="modal-header">

      <h3 class="modal-title">

        ${emoji} ${item.title}

      </h3>

      <button
        class="close-btn"
        onclick="closeModal('detailOverlay')">

        ✕

      </button>

    </div>

    ${imgHTML}

    <div class="detail-desc">

      ${item.description}

    </div>

    <div class="detail-actions">

      ${actionBtns}

    </div>
  `;

  openModal('detailOverlay');
}

// ============================================
// CONTACT
// ============================================

async function requestContact(id) {

  const items = await apiGetItems();

  const item =
    items.find(i => i._id === id);

  if (!item) return;

  document.getElementById('contactInfo').innerHTML = `

    <div>

      <strong>
        ${item.postedBy?.name || 'Unknown'}
      </strong>

    </div>
  `;

  closeModal('detailOverlay');

  openModal('contactOverlay');
}

// ============================================
// CLAIM ITEM
// ============================================

async function claimItem(id) {

  try {

    const response = await fetch(
      `http://localhost:5000/api/items/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          status: 'resolved'
        })
      }
    );

    const data = await response.json();

    if (response.ok) {

      showToast('✅ Item Claimed');

      closeModal('detailOverlay');

      renderHome();
      renderLost();
      renderFound();
      renderMy();

    } else {

      showToast('❌ Failed');

    }

  } catch (error) {

    console.log(error);

    showToast('❌ Server Error');
  }
}

// ============================================
// MARK CLAIMED
// ============================================

async function markClaimed(id) {

  await claimItem(id);
}

// ============================================
// DELETE
// ============================================

async function deleteItem(id) {

  const data = await apiDeleteItem(id);

  if (data.message.includes('deleted')) {

    showToast('🗑 Deleted');

    renderHome();
    renderLost();
    renderFound();
    renderMy();
  }
}

// ============================================
// STATS
// ============================================

function updateStats(items) {

  document.getElementById('statTotal')
    .textContent = items.length;

  document.getElementById('statLost')
    .textContent =
      items.filter(i => i.type === 'lost').length;

  document.getElementById('statFound')
    .textContent =
      items.filter(i => i.type === 'found').length;

  document.getElementById('statClaimed')
    .textContent =
      items.filter(i => i.status === 'resolved').length;
}

// ============================================
// MODAL
// ============================================

function openModal(id) {

  document.getElementById(id)
    .classList.add('open');
}

function closeModal(id) {

  document.getElementById(id)
    .classList.remove('open');
}

document.addEventListener('click', e => {

  if (e.target.classList.contains('overlay')) {

    e.target.classList.remove('open');
  }
});

// ============================================
// TOAST
// ============================================

function showToast(msg) {

  const t =
    document.getElementById('toast');

  t.textContent = msg;

  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, 3000);
}