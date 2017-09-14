/* eslint-disable import/no-commonjs */
const { writeFileSync } = require('fs');
const { resolve } = require('path');

if (!process.env.API_ENDPOINT) throw new Error('API_ENDPOINT env var not set');

process.env.API_ENDPOINT = process.env.API_ENDPOINT.replace(/\/$/, '');

const redirects = `
/api/*  ${process.env.API_ENDPOINT}/:splat  200
/*      /index.html                         200
`;

writeFileSync(resolve(__dirname, '../build/_redirects'), redirects);
