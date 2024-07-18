import { request } from '@umijs/max';

export async function deleteFile(data) {
  return request(`/api/v1/upload/delete`, {
    method: 'POST',
    data,
  });
}