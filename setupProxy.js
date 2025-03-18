const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'http://localhost:5001',
      ws: true,
      changeOrigin: true
    })
  );

  app.use(
    createProxyMiddleware('/api', {
      target: 'http://localhost:5001',
      changeOrigin: true
    })
  );
};
