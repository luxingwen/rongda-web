import { request } from '@umijs/max';

export async function getCustomers(query) {
  return request('/api/v1/customer/list', {
    method: 'POST',
    data: query,
  });
}

export async function addCustomer(data) {
  return request('/api/v1/customer/create', {
    method: 'POST',
    data,
  });
}

export async function updateCustomer(data) {
  return request(`/api/v1/customer/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteCustomer(data) {
  return request(`/api/v1/customer/delete`, {
    method: 'POST',
    data,
  });
}

export async function getCustomerInfo(data) {
  return request(`/api/v1/customer/info`, {
    method: 'POST',
    data,
  });
}

export async function getCustomerOptions() {
  return request('/api/v1/customer/all', {
    method: 'POST',
  });
}