import { AsyncLocalStorage } from 'async_hooks';
import { User } from '../entities/User.js';

// This acts as a global storage for the duration of a single request
export const requestContext = new AsyncLocalStorage<{ user: User }>();

export const getCurrentUser = () => {
  const store = requestContext.getStore();
  return store?.user;
};