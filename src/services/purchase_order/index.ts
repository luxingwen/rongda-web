import { request } from '@umijs/max';

export async function getPurchaseOrders(params) {
  return request('/api/v1/purchase_order/list', {
    method: 'POST',
    data: params,
  });
}

export async function addPurchaseOrderFutures(data) {
  return request('/api/v1/purchase_order/create_futures', {
    method: 'POST',
    data,
  });
}

export async function addPurchaseOrderSpot(data) {
  return request('/api/v1/purchase_order/create_spot', {
    method: 'POST',
    data,
  });
}


export async function updatePurchaseOrder(data) {
  return request('/api/v1/purchase_order/update', {
    method: 'POST',
    data,
  });
}

export async function deletePurchaseOrder(data) {
  return request('/api/v1/purchase_order/delete', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

export async function getPurchaseOrdersInfo(data) {
  return request('/api/v1/purchase_order/info', {
    method: 'POST',
    data,
  });
}

// 获取采购单商品列表
export async function getPurchaseOrderProductList(data) {
  return request('/api/v1/purchase_order/item/list', {
    method: 'POST',
    data,
  });
}
