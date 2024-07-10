import { request } from '@umijs/max';

export async function getUserInfo(uuid: string) {
  return await request('/api/v1/user/info', {
    method: 'POST',
    data: { "uuid": uuid },
  })
}


export async function login(data: { username: string, password: string }) {
  return await request('/api/v1/login', {
    method: 'POST',
    data,
  })
}


export async function getUsers(data: any) {
    return await request('/api/v1/user/list', {
        method: 'POST',
        data,
    })
}

export async function addUser(data: API.User) {
    return await request('/api/v1/user/create', {
        method: 'POST',
        data,
    })
}

export async function updateUser(data: API.User) {
    return await request('/api/v1/user/update', {
        method: 'POST',
        data,
    })
}
export async function deleteUser(id: number) {
}