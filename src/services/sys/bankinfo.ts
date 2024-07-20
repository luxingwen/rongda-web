import { request } from '@umijs/max';

export async function getSysBankInfos(query) {
  return request('/api/v1/bankinfo/list', {
    method: 'POST',
    data: query,
  });
}

export async function addSysBankInfo(data) {
  return request('/api/v1/bankinfo/create', {
    method: 'POST',
    data,
  });
}

export async function updateSysBankInfo(data) {
  return request(`/api/v1/bankinfo/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteSysBankInfo(data) {
  return request(`/api/v1/bankinfo/delete`, {
    method: 'POST',
    data,
  });
}

export async function getSysBankInfo(data) {
  return request(`/api/v1/bankinfo/info`, {
    method: 'POST',
    data,
  });
}


// 获取所有银行信息
export async function getSysBankInfoOptions() {
  return request('/api/v1/bankinfo/all', {
    method: 'POST',
  });
}