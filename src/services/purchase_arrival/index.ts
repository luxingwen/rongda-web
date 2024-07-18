import { request } from '@umijs/max';

export async function getPurchaseArrivals(params) {
  return request('/api/v1/purchase_arrival/list', {
    method: 'POST',
    data: params,
  });
}

export async function addPurchaseArrival(data) {
  return request('/api/v1/purchase_arrival/create', {
    method: 'POST',
    data,
  });
}

export async function updatePurchaseArrival(data) {
  return request('/api/v1/purchase_arrival/update', {
    method: 'POST',
    data,
  });
}

export async function deletePurchaseArrival(data) {
  return request('/api/v1/purchase_arrival/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

export async function getPurchaseArrival(params) {
  return request('/api/v1/purchase_arrival/info', {
    method: 'POST',
    data: params,
  });
}

// 获取采购订单到货明细 
export async function getPurchaseArrivalItems(params) {
  return request('/api/v1/purchase_arrival/item/list', {
    method: 'POST',
    data: params,
  });
}