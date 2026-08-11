const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) throw new Error(data?.error || 'Something went wrong');
  return data;
}

export const api = {
  signup: (email, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getTodos: () => request('/todos'),
  createTodo: (title) =>
    request('/todos', { method: 'POST', body: JSON.stringify({ title }) }),
  updateTodo: (id, changes) =>
    request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  deleteTodo: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
};

export const auth = {
  saveToken: (token) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
  isLoggedIn: () => !!getToken(),
};