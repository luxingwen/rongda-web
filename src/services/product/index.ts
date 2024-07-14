import { request } from '@umijs/max';

export async function getProducts(query) {
  return request('/api/v1/product/list', {
    method: 'POST',
    data: query,
  });
}

export async function addProduct(data) {
  return request('/api/v1/product/create', {
    method: 'POST',
    data,
  });
}

export async function updateProduct(data) {
  return request('/api/v1/product/update', {
    method: 'POST',
    data,
  });
}

export async function deleteProduct(data) {
  return request('/api/v1/product/delete', {
    method: 'POST',
    data,
  });
}

// 获取所有产品
export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

// 获取产品sku
export async function getProductSkuOptions(data) {
  return request('/api/v1/product/sku/list', {
    method: 'POST',
    data,
  });
}