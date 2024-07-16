import { request } from '@umijs/max';

export async function getSalesSettlements(params) {
  return request('/api/v1/sales_settlement/list', {
    method: 'POST',
    data: params,
  });
}

export async function addSalesSettlement(data) {
  return request('/api/v1/sales_settlement/create', {
    method: 'POST',
    data,
  });
}

export async function updateSalesSettlement(data) {
  return request('/api/v1/sales_settlement/update', {
    method: 'POST',
    data,
  });
}

export async function deleteSalesSettlement(data) {
  return request('/api/v1/sales_settlement/delete', {
    method: 'POST',
    data,
  });
}

export async function getSalesOrders() {
  return request('/api/v1/sales_order/all', {
    method: 'GET',
  });
}
