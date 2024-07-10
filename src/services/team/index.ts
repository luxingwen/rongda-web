import { request } from '@umijs/max';

export async function getTeams(query) {
  return request('/api/v1/team/list', {
    method: 'POST',
    data: query,
  });
}

export async function addTeam(data) {
  return request('/api/v1/team/create', {
    method: 'POST',
    data,
  });
}

export async function updateTeam(data) {
  return request(`/api/v1/team/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteTeam(data) {
  return request(`/api/v1/team/delete`, {
    method: 'POST',
    data,
  });
}
