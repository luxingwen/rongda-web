import { request } from '@umijs/max';

export async function getOutbounds(params) {
  return request('/api/v1/storehouse_outbound/list', {
    method: 'POST',
    data: params,
  });
}

export async function addOutbound(data) {
  return request('/api/v1/storehouse_outbound/create', {
    method: 'POST',
    data,
  });
}

export async function updateOutbound(data) {
  return request('/api/v1/storehouse_outbound/update', {
    method: 'POST',
    data,
  });
}

export async function deleteOutbound(data) {
  return request('/api/v1/storehouse_outbound/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

export async function getStorehouseOptions() {
  return request('/api/v1/storehouse/all', {
    method: 'GET',
  });
}

export async function getProductSkuOptions(data) {
  return request('/api/v1/product/sku/all', {
    method: 'POST',
    data,
  });
}
