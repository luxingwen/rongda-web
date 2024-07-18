import { request } from '@umijs/max';

export async function getAgents(query) {
  return request('/api/v1/agent/list', {
    method: 'POST',
    data: query,
  });
}

export async function addAgent(data) {
  return request('/api/v1/agent/create', {
    method: 'POST',
    data,
  });
}

export async function updateAgent(data) {
  return request(`/api/v1/agent/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteAgent(data) {
  return request(`/api/v1/agent/delete`, {
    method: 'POST',
    data,
  });
}

export async function getAgentInfo(data) {
  return request(`/api/v1/agent/info`, {
    method: 'POST',
    data,
  });
}