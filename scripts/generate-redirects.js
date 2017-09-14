/* eslint-disable import/no-commonjs */
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const redirects = `
/*      /index.html                         200
/api/*  ${process.env.API_ENDPOINT}/:splat  200
`;

writeFileSync(resolve(__dirname, '../build/_redirects'), redirects);
