import { request } from '@umijs/max';

export async function getProductCategories(params) {
  return request('/api/v1/product_category/list', {
    method: 'POST',
    data: params,
  });
}

export async function addProductCategory(params) {
  return request('/api/v1/product_category/create', {
    method: 'POST',
    data: params,
  });
}

export async function updateProductCategory(params) {
  return request('/api/v1/product_category/update', {
    method: 'POST',
    data: params,
  });
}

export async function deleteProductCategory(params) {
  return request('/api/v1/product_category/delete', {
    method: 'POST',
    data: params,
  });
}

// 获取所有产品分类
export async function getProductCategoryOptions() {
  return request('/api/v1/product_category/all', {
    method: 'POST',
  });
}