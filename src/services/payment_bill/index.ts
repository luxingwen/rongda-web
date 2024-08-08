import { request } from '@umijs/max';

export async function getPaymentBills(query) {
  return request('/api/v1/payment_bill/list', {
    method: 'POST',
    data: query,
  });
}

export async function addPaymentBill(data) {
  return request('/api/v1/payment_bill/create', {
    method: 'POST',
    data,
  });
}

export async function updatePaymentBill(data) {
  return request(`/api/v1/payment_bill/update`, {
    method: 'POST',
    data,
  });
}

export async function deletePaymentBill(data) {
  return request(`/api/v1/payment_bill/delete`, {
    method: 'POST',
    data,
  });
}

export async function getPaymentBillInfo(data) {
  return request(`/api/v1/payment_bill/info`, {
    method: 'POST',
    data,
  });
}
