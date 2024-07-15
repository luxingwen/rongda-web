import { request } from '@umijs/max';

export async function getPurchaseBills(params) {
  return request('/api/v1/purchase_bill/list', {
    method: 'POST',
    data: params,
  });
}

export async function addPurchaseBill(data) {
  return request('/api/v1/purchase_bill/create', {
    method: 'POST',
    data,
  });
}

export async function updatePurchaseBill(data) {
  return request('/api/v1/purchase_bill/update', {
    method: 'POST',
    data,
  });
}

export async function deletePurchaseBill(data) {
  return request('/api/v1/purchase_bill/delete', {
    method: 'POST',
    data,
  });
}

export async function getSupplierOptions() {
  return request('/api/v1/supplier/all', {
    method: 'GET',
  });
}
