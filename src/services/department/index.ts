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


export async function getDepartmentDetails(data) {
  return request('/api/v1/department/info', {
    method: 'POST',
    data,
  });
}

export async function getDepartmentStaffList(data) {
  return request('/api/v1/department/staff/list', {
    method: 'POST',
    data,
  });
}
export async function addEmployee(data) {
  return request('/api/v1/department/staff/create', {
    method: 'POST',
    data,
  });
}

export async function deleteEmployee(data) {
  return request('/api/v1/department/staff/delete', {
    method: 'POST',
    data,
  });
}

export async function updateEmployee(data) {
  return request('/api/v1/department/staff/update', {
    method: 'POST',
    data,
  });
}