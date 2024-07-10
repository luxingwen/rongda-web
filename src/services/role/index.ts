import { request } from '@umijs/max';

export async function getRoles(query) {
  return request('/api/v1/role/list', {
    method: 'POST',
    data: query,
  });
}

export async function addRole(data) {
  return request('/api/v1/role/create', {
    method: 'POST',
    data,
  });
}

export async function updateRole(data) {
  return request(`/api/v1/role/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteRole(data) {
  return request(`/api/v1/role/delete`, {
    method: 'POST',
    data
  });
}
