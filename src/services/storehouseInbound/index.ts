import { request } from '@umijs/max';

export async function getInbounds(params) {
  return request('/api/v1/storehouse_inbound/list', {
    method: 'POST',
    data: params,
  });
}

export async function addInbound(data) {
  return request('/api/v1/storehouse_inbound/create', {
    method: 'POST',
    data,
  });
}

export async function updateInbound(data) {
  return request('/api/v1/storehouse_inbound/update', {
    method: 'POST',
    data,
  });
}

export async function deleteInbound(data) {
  return request('/api/v1/storehouse_inbound/delete', {
    method: 'POST',
    data,
  });
}

export async function getInbound(data) {
  return request('/api/v1/storehouse_inbound/info', {
    method: 'POST',
    data,
  });
}

export async function getInboundDetail(data) {
  return request('/api/v1/storehouse_inbound/detail', {
    method: 'POST',
    data,
  });
}

export async function getInboundDetailInfo(data) {
  return request('/api/v1/storehouse_inbound/detail_info', {
    method: 'POST',
    data,
  });
}

export async function getProductOptions() {
  return request('/api/v1/product/all', {
    method: 'GET',
  });
}

