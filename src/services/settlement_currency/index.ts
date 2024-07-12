import { request } from '@umijs/max';

export async function getSettlementCurrencies(query) {
  return request('/api/v1/settlement_currency/list', {
    method: 'POST',
    data: query,
  });
}

export async function addSettlementCurrency(data) {
  return request('/api/v1/settlement_currency/create', {
    method: 'POST',
    data,
  });
}

export async function updateSettlementCurrency(data) {
  return request(`/api/v1/settlement_currency/update`, {
    method: 'POST',
    data,
  });
}

export async function deleteSettlementCurrency(data) {
  return request(`/api/v1/settlement_currency/delete`, {
    method: 'POST',
    data,
  });
}
