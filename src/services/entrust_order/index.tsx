import { request } from '@umijs/max';

// 获取委托订单列表
export async function getEntrustOrders(query) {
  return request('/api/v1/entrust_order/list', {
    method: 'POST',
    data: query,
  });
}

// 创建委托订单
export async function addEntrustOrder(data) {
  return request('/api/v1/entrust_order/create', {
    method: 'POST',
    data,
  });
}

// 更新委托订单
export async function updateEntrustOrder(data) {
  return request('/api/v1/entrust_order/update', {
    method: 'POST',
    data,
  });
}

// 删除委托订单
export async function deleteEntrustOrder(data) {
  return request('/api/v1/entrust_order/delete', {
    method: 'POST',
    data,
  });
}

// 获取单个委托订单信息
export async function getEntrustOrderInfo(data) {
  return request('/api/v1/entrust_order/info', {
    method: 'POST',
    data,
  });
}
