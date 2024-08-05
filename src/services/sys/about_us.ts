import { request } from '@umijs/max';


export async function getAboutUs() {
  return request('/api/v1/configuration/info', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'about_us',
    },
  });
}

export async function createAboutUs(data) {
  return request('/api/v1/configuration/create', {
    method: 'POST',
    data: {
        category: 'system',
        name: 'about_us',
        value: data,
    },
  });
}