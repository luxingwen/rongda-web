import { request } from '@umijs/max';

export async function getAgreements(params) {
  return request('/api/v1/agreement/list', {
    method: 'POST',
    data: params,
  });
}

export async function addAgreement(data) {
  return request('/api/v1/agreement/create', {
    method: 'POST',
    data,
  });
}

export async function updateAgreement(data) {
  return request('/api/v1/agreement/update', {
    method: 'POST',
    data,
  });
}

export async function deleteAgreement(data) {
  return request('/api/v1/agreement/delete', {
    method: 'POST',
    data,
  });
}

export async function getAgreement(data) {
  return request('/api/v1/agreement/info', {
    method: 'POST',
    data,
  });
}

// GetAgreementByOrder
export async function getAgreementByOrder(data) {
  return request('/api/v1/agreement/order', {
    method: 'POST',
    data,
  });
}