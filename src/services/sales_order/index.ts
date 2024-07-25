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

export async function getSalesOrderDetail(data) {
  return request('/api/v1/sales_order/info', {
    method: 'POST',
    data,
  });
}

export async function getSalesOrderProductList(data) {
  return request('/api/v1/sales_order/product_item/list', {
    method: 'POST',
    data,
  });
}

// 更新订单状态
export async function updateSalesOrderStatus(data) {
  return request('/api/v1/sales_order/update_status', {
    method: 'POST',
    data,
  });
}