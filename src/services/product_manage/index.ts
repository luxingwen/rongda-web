import { request } from '@umijs/max';

export async function getProductManages(query) {
  return request('/api/v1/product_manage/list', {
    method: 'POST',
    data: query,
  });
}

export async function addProductManage(data) {
  return request('/api/v1/product_manage/create', {
    method: 'POST',
    data,
  });
}

export async function updateProductManage(data) {
  return request('/api/v1/product_manage/update', {
    method: 'POST',
    data,
  });
}

export async function deleteProductManage(data) {
  return request('/api/v1/product_manage/delete', {
    method: 'POST',
    data,
  });
}

