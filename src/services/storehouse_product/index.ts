import { request } from '@umijs/max';

export async function getStorehouseProducts(params) {
  return request('/api/v1/storehouse_product/list', {
    method: 'POST',
    data: params,
  });
}

export async function addStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/create', {
    method: 'POST',
    data,
  });
}

export async function updateStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/update', {
    method: 'POST',
    data,
  });
}

export async function deleteStorehouseProduct(data) {
  return request('/api/v1/storehouse_product/delete', {
    method: 'POST',
    data,
  });
}


export async function getStorehouseProductDetail(params) {
  return request('/api/v1/storehouse_product/info', {
    method: 'POST',
    data: params,
  });
}


export async function getStorehouseOptions() {
  return request('/api/v1/storehouse/all', {
    method: 'POST',
  });
}

export async function getStorehouseProductOpLogs(params) {
  return request('/api/v1/storehouse_product/op_log', {
    method: 'POST',
    data: params,
  });
}

// 根据销售订单获取库存商品列表
export async function getStorehouseProductBySalesOrder(params) {
  return request('/api/v1/storehouse_product/sales_order/list_item', {
    method: 'POST',
    data: params,
  });
}
