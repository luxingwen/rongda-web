import { request } from '@umijs/max';

export async function getStorehouseProducts(params) {
  return request('/api/v1/storehouse_product/list', {
    method: 'POST',
    data: params,
  });
}

export async function addStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/create', {
    method: 'POST',
    data,
  });
}

export async function updateStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/update', {
    method: 'POST',
    data,
  });
}

export async function deleteStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/delete', {
    method: 'POST',
    data,
  });
}

export async function getStorehouseOptions() {
  return request('/api/v1/storehouse/all', {
    method: 'POST',
  });
}