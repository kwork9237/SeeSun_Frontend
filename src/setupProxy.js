const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 1. 일반 API용 프록시 (기본 설정)
  app.use(
    '/api', // 채팅 전송 같은 일반 POST 요청
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );

  // 2. SSE 전용 프록시 (버퍼링 방지 특약 설정)
  app.use(
    '/api/seesun/live/chat',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      ws: false, // 웹소켓이 아니라면 명시적으로 끔
      // 핵심: 프록시 레벨에서 버퍼링을 완전히 무시하도록 유도
      onProxyReq: (proxyReq, req, res) => {
        // SSE 요청은 타임아웃이 걸리지 않게 설정
        req.setTimeout(0);
      },
      onProxyRes: (proxyRes, req, res) => {
        // 응답이 오자마자 브라우저로 쏴버리게 헤더 강제
        proxyRes.headers['Connection'] = 'keep-alive';
        proxyRes.headers['Cache-Control'] = 'no-cache, no-transform';
        proxyRes.headers['Content-Type'] = 'text/event-stream';
        proxyRes.headers['X-Accel-Buffering'] = 'no';
      },
    })
  );
};