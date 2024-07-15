import { request } from '@umijs/max';

export async function getPurchaseOrders(params) {
  return request('/api/v1/purchase_order/list', {
    method: 'POST',
    data: params,
  });
}

export async function addPurchaseOrder(data) {
  return request('/api/v1/purchase_order/create', {
    method: 'POST',
    data,
  });
}

export async function updatePurchaseOrder(data) {
  return request('/api/v1/purchase_order/update', {
    method: 'POST',
    data,
  });
}

export async function deletePurchaseOrder(data) {
  return request('/api/v1/purchase_order/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

