import { request } from '@umijs/max';

export async function getDepartments(query) {
  return request('/api/v1/department/list', {
    method: 'POST',
    data: query,
  });
}

export async function addDepartment(data) {
  return request('/api/v1/department/create', {
    method: 'POST',
    data,
  });
}

export async function updateDepartment(data) {
  return request('/api/v1/department/update', {
    method: 'POST',
    data,
  });
}

export async function deleteDepartment(data) {
  return request('/api/v1/department/delete', {
    method: 'POST',
    data,
  });
}
