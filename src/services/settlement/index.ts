import { request } from '@umijs/max';

export async function getSettlements(query) {
  return request('/api/v1/settlement/list', {
    method: 'POST',
    data: query,
  });
}

export async function addSettlement(data) {
  return request('/api/v1/settlement/create', {
    method: 'POST',
    data,
  });
}

export async function updateSettlement(data) {
  return request('/api/v1/settlement/update', {
    method: 'POST',
    data,
  });
}

export async function deleteSettlement(data) {
  return request('/api/v1/settlement/delete', {
    method: 'POST',
    data,
  });
}

export async function getSettlementInfo(data) {
  return request('/api/v1/settlement/info', {
    method: 'POST',
    data,
  });
}
