import { request } from '@umijs/max';

export async function getWxUserOption() {
  return await request('/api/v1/wx_user/all', {
    method: 'POST',
  })
}
