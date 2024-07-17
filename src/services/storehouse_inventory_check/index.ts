import { request } from '@umijs/max';

export async function getInventoryChecks(params) {
  return request('/api/v1/storehouse_inventory_check/list', {
    method: 'POST',
    data: params,
  });
}

export async function addInventoryCheck(data) {
  return request('/api/v1/storehouse_inventory_check/create', {
    method: 'POST',
    data,
  });
}

export async function updateInventoryCheck(data) {
  return request('/api/v1/storehouse_inventory_check/update', {
    method: 'POST',
    data,
  });
}

export async function deleteInventoryCheck(data) {
  return request('/api/v1/storehouse_inventory_check/delete', {
    method: 'POST',
    data,
  });
}

export async function getInventoryCheck(data) {
  return request('/api/v1/storehouse_inventory_check/info', {
    method: 'POST',
    data,
  });
}

export async function getInventoryCheckDetail(data) {
  return request('/api/v1/storehouse_inventory_check/detail', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}
