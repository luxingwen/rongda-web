import { request } from '@umijs/max';

export async function getSkus(query) {
  return request('/api/v1/sku/list', {
    method: 'POST',
    data: query,
  });
}

export async function addSku(data) {
  return request('/api/v1/sku/create', {
    method: 'POST',
    data,
  });
}

export async function updateSku(data) {
  return request(`/api/v1/sku/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteSku(data) {
  return request(`/api/v1/sku/delete`, {
    method: 'POST',
    data,
  });
}
