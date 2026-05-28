const API_URL = 'http://localhost:5000/api';

// ---------- AUTH ----------
async function apiRegister(name, email, password, collegeId, phone) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, collegeId, phone })
  });
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// ---------- ITEMS ----------
async function apiGetItems(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_URL}/items?${params}`);
  return res.json();
}

async function apiPostItem(formData) {
  const token = sessionStorage.getItem('findit_token');
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

async function apiUpdateItem(id, status) {
  const token = sessionStorage.getItem('findit_token');
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}

async function apiDeleteItem(id) {
  const token = sessionStorage.getItem('findit_token');
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}