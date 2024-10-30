import { request } from '@umijs/max';

export async function getStorehouses(query) {
  return request('/api/v1/storehouse/list', {
    method: 'POST',
    data: query,
  });
}

export async function addStorehouse(data) {
  return request('/api/v1/storehouse/create', {
    method: 'POST',
    data,
  });
}

export async function updateStorehouse(data) {
  return request('/api/v1/storehouse/update', {
    method: 'POST',
    data,
  });
}

export async function deleteStorehouse(data) {
  return request('/api/v1/storehouse/delete', {
    method: 'POST',
    data,
  });
}

export async function getStorehouse(data) {
  return request('/api/v1/storehouse/info', {
    method: 'POST',
    data,
  });
}

export async function getStorehouseOptions() {
  return request('/api/v1/storehouse/all', {
    method: 'POST',
  });
}

// UpdateStorehouseItem
export async function updateStorehouseItem(data) {
  return request('/api/v1/storehouse/update_item', {
    method: 'POST',
    data,
  });
}

// UpdateStorehouseItemByMap
export async function updateStorehouseItemByMap(data) {
  return request('/api/v1/storehouse/update_item_by_map', {
    method: 'POST',
    data,
  });
}