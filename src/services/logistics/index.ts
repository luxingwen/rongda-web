import { request } from '@umijs/max';

export async function getLogisticsList(query) {
  return request('/api/v1/logistics/list', {
    method: 'POST',
    data: query,
  });
}

export async function addLogistics(data) {
  return request('/api/v1/logistics/create', {
    method: 'POST',
    data,
  });
}

export async function updateLogistics(data) {
  return request(`/api/v1/logistics/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteLogistics(data) {
  return request(`/api/v1/logistics/delete`, {
    method: 'POST',
    data,
  });
}

export async function getLogisticsInfo(data) {
  return request(`/api/v1/logistics/info`, {
    method: 'POST',
    data,
  });
}
