import { request } from '@umijs/max';

export async function getSuppliers(query) {
  return request('/api/v1/supplier/list', {
    method: 'POST',
    data: query,
  });
}

export async function addSupplier(data) {
  return request('/api/v1/supplier/create', {
    method: 'POST',
    data,
  });
}

export async function updateSupplier(data) {
  return request(`/api/v1/supplier/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteSupplier(data) {
  return request(`/api/v1/supplier/delete`, {
    method: 'POST',
    data,
  });
}

// 获取所有供应商
export async function getSupplierOptions() {
  return request('/api/v1/supplier/all', {
    method: 'POST',
  });
}