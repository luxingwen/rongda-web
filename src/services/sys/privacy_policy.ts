import { request } from '@umijs/max';


export async function getPrivacyPolicy() {
  return request('/api/v1/configuration/info', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'privacy_policy',
    },
  });
}

export async function createPrivacyPolicy(data) {
  return request('/api/v1/configuration/create', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'privacy_policy',
        value: data,
    },
  });
}
