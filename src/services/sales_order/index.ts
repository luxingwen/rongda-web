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

// 创建合同
export async function createSalesagreement(data) {
  return request('/api/v1/sales_order/create_agreement', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取步骤列表
export async function getSalesOrderStepList(data) {
  return request('/api/v1/sales_order/step/list', {
    method: 'POST',
    data,
  });
}

// 创建定金合同
export async function createDepositAgreement(data) {
  return request('/api/v1/sales_order/create_deposit_agreement', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 创建尾款合同
export async function createFinalPaymentAgreement(data) {
  return request('/api/v1/sales_order/create_final_agreement', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 创建定金支付账单
export async function createDepositPaymentBill(data) {
  return request('/api/v1/sales_order/create_deposit_payment_bill', {
    method: 'POST',
    data,
  });
}

// 创建尾款支付账单
export async function createFinalPaymentBill(data) {
  return request('/api/v1/sales_order/create_final_payment_bill', {
    method: 'POST',
    data,
  });
}


// 上传单据
export async function uploadDocments(data) {
  return request('/api/v1/sales_order/update_docment', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}


// UpdateSalesOrderProductItem
export async function updateSalesOrderProductItem(data) {
  return request('/api/v1/sales_order/product_item/update', {
    method: 'POST',
    data,
  });
}