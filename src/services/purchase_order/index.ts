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


export async function updatePurchaseOrderFutrues(data) {
  return request('/api/v1/purchase_order/update_futures', {
    method: 'POST',
    data,
  });
}

export async function updatePurchaseOrderSpot(data) {
  return request('/api/v1/purchase_order/update_spot', {
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


// 获取所有的采购订单
export async function getAllPurchaseOrdersOptions() {
  return request('/api/v1/purchase_order/all', {
    method: 'POST',
  });
}

// 获取采购单商品列表
export async function getPurchaseOrderProductList(data) {
  return request('/api/v1/purchase_order/item/list', {
    method: 'POST',
    data,
  });
}


// 上传excel文件
export async function uploadImportFutruesExcel(data) {
  return request('/api/v1/purchase_order/items/excel/upload_futures', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function uploadImportSpotExcel(data) {
  return request('/api/v1/purchase_order/items/excel/upload_spot', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 更新订单状态
export async function updatePurchaseOrderStatus(data) {
  return request('/api/v1/purchase_order/update_status', {
    method: 'POST',
    data,
  });
}

// 根据订单状态获取订单列表
export async function getPurchaseOrdersByStatus(data) {
  return request('/api/v1/purchase_order/status_list', {
    method: 'POST',
    data,
  });
}

// UpdatePurchaseOrderItem
export async function updatePurchaseOrderItem(data) {
  return request('/api/v1/purchase_order/item/update_item', {
    method: 'POST',
    data,
  });
}


