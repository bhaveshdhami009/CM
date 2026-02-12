// This file is used when you run 'ng serve'
export const environment = {
  production: false,
  // API URL for development. It's an empty string or '/'
  // because the proxy will handle forwarding to localhost:3000.
  // It is NOT 'http://localhost:3000/api' because that would cause CORS errors.
  apiUrl: '/api' 
};