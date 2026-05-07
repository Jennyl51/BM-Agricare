import { apiRequest } from './api';
export function getProductsList() { return apiRequest('/products'); }
