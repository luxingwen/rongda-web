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