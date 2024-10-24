import { request } from '@umijs/max';

export async function deleteFile(data) {
  return request(`/api/v1/upload/delete`, {
    method: 'POST',
    data,
  });
}

export async function uploadFile(address, data) {
  return request(`/api/v1/upload/file/${address}`, {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}


// 上传销售订单文件
export async function uploadSalesOrderFile(data) {
  return request('/api/v1/order_file/sales/upload', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 删除订单文件
export async function deleteOrderFile(data) {
  return request('/api/v1/order_file/delete', {
    method: 'POST',
    data,
  });
}

// 获取订单文件列表
export async function getOrderFileList(data) {
  return request('/api/v1/order_file/list', {
    method: 'POST',
    data,
  });
}