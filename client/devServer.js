const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const Bundler = require('parcel-bundler');

const bundler = new Bundler('client/src/index.html', {});
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  ['/api/', '/graphql/'],
  createProxyMiddleware({
    target: 'http://localhost:4001',
    ws: true,
  })
);
app.use(bundler.middleware());
app.listen(PORT);
