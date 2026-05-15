import api from './client';

// Auth
export const authApi = {
  signup: (data) => api.post('/auth/signup', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// Projects
export const projectsApi = {
  list: () => api.get('/projects').then(r => r.data),
  get: (id) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data) => api.post('/projects', data).then(r => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/projects/${id}`).then(r => r.data),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }).then(r => r.data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then(r => r.data),
};

// Tasks
export const tasksApi = {
  listForProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }).then(r => r.data),
  myTasks: (params) => api.get('/tasks/my', { params }).then(r => r.data),
  get: (id) => api.get(`/tasks/${id}`).then(r => r.data),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),
  update: (id, data) => api.patch(`/tasks/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get('/dashboard').then(r => r.data),
  myTasksSummary: (params) => api.get('/dashboard/my-tasks', { params }).then(r => r.data),
};

// Users
export const usersApi = {
  list: () => api.get('/users').then(r => r.data),
  get: (id) => api.get(`/users/${id}`).then(r => r.data),
};
