import { request } from '@umijs/max';

export async function getStorehouseOutOrderDetails(params) {
  return request('/api/v1/storehouse_outbound/order_list', {
    method: 'POST',
    data: params,
  });
}


// 删除
export async function deleteStorehouseOutOrder(params) {
  return request('/api/v1/storehouse_outbound/order_delete', {
    method: 'POST',
    data: params,
  });
}

// 更新状态
export async function updateStorehouseOutOrderStatus(params) {
  return request('/api/v1/storehouse_outbound/update_order_status', {
    method: 'POST',
    data: params,
  });
}

// 获取详情
export async function getStorehouseOutOrderDetailInfo(params) {
  return request('/api/v1/storehouse_outbound/order_info', {
    method: 'POST',
    data: params,
  });
}