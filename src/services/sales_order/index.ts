import { request } from '@umijs/max';

export async function getSalesOrders(params) {
  return request('/api/v1/sales_order/list', {
    method: 'POST',
    data: params,
  });
}

export async function addSalesOrder(data) {
  return request('/api/v1/sales_order/create', {
    method: 'POST',
    data,
  });
}

export async function updateSalesOrder(data) {
  return request('/api/v1/sales_order/update', {
    method: 'POST',
    data,
  });
}

export async function deleteSalesOrder(data) {
  return request('/api/v1/sales_order/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

export async function getSalesOrderOptions() {
  return request('/api/v1/sales_order/all', {
    method: 'POST',
  });
}