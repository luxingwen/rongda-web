import { request } from '@umijs/max';

export async function getSalesOutOfStocks(params) {
  return request('/api/v1/sales_out_of_stock/list', {
    method: 'POST',
    data: params,
  });
}

export async function addSalesOutOfStock(data) {
  return request('/api/v1/sales_out_of_stock/create', {
    method: 'POST',
    data,
  });
}

export async function updateSalesOutOfStock(data) {
  return request('/api/v1/sales_out_of_stock/update', {
    method: 'POST',
    data,
  });
}

export async function deleteSalesOutOfStock(data) {
  return request('/api/v1/sales_out_of_stock/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

export async function getCustomerOptions() {
  return request('/api/v1/customer/all', {
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
