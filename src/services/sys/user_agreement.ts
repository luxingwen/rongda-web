import { request } from '@umijs/max';

// 获取用户协议
export async function getUserAgreement() {
  return request('/api/v1/configuration/info', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'user_agreement',
    },
  });
}

// 创建用户协议
export async function createUserAgreement(data) {
  return request('/api/v1/configuration/create', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'user_agreement',
        value: data,
    },
  });
}