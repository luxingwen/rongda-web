import { request } from '@umijs/max';

export async function addRemittanceBill(params) {
  return request('/api/v1/remittance_bill/create', {
    method: 'POST',
    data: params,
  });
}
