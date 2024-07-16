import { request } from '@umijs/max';

export async function getBills(params) {
  return request('/api/v1/bill/list', {
    method: 'POST',
    data: params,
  });
}

export async function addBill(data) {
  return request('/api/v1/bill/create', {
    method: 'POST',
    data,
  });
}

export async function updateBill(data) {
  return request('/api/v1/bill/update', {
    method: 'POST',
    data,
  });
}

export async function deleteBill(data) {
  return request('/api/v1/bill/delete', {
    method: 'POST',
    data,
  });
}
