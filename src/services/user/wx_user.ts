import { request } from '@umijs/max';

export async function getWxUserOption() {
  return await request('/api/v1/wx_user/all', {
    method: 'POST',
  });
}

export async function getWxUsers(data: any) {
  return await request('/api/v1/wx_user/list', {
    method: 'POST',
    data,
  });
}

export async function addWxUser(data: API.User) {
  return await request('/api/v1/wx_user/create', {
    method: 'POST',
    data,
  });
}

export async function updateWxUser(data: API.User) {
  return await request('/api/v1/wx_user/update', {
    method: 'POST',
    data,
  });
}
export async function deleteWxUser(data) {
  return await request('/api/v1/wx_user/delete', {
    method: 'POST',
    data,
  });
}

export async function wxRealnameAuth(data) {
  return await request('/api/v1/wx_user/update_realname_auth', {
    method: 'POST',
    data,
  });
}
