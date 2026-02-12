import { AsyncLocalStorage } from 'async_hooks';
// This acts as a global storage for the duration of a single request
export const requestContext = new AsyncLocalStorage();
export const getCurrentUser = () => {
    const store = requestContext.getStore();
    return store?.user;
};
//# sourceMappingURL=context.js.map