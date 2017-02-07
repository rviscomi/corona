#!/usr/bin/env nodejs
const http = require('http');
const url = require('url');
const dotenv = require('dotenv')
dotenv.config({path: __dirname + '/.env'});

const github = require('./github');

const ORIGIN_WHITELIST = new Set([
  'http://localhost:3000',
  'http://104.131.141.123',
  'https://rviscomi.github.io'
]);
const INPUT_PATTERN = /^([a-z0-9](-?[a-z0-9]){0,100})$/i;

http.createServer((req, res) => {
  const requestUrl = url.parse(req.url, true);
  const user = requestUrl.query.user;
  const repo = requestUrl.query.repo;
  const cursor = requestUrl.query.cursor || null;
  if (requestUrl.pathname != '/') {
    res.statusCode = 404;
    res.end();
    return;
  }
  if (!user || !repo ||
      !INPUT_PATTERN.test(user) || !INPUT_PATTERN.test(repo)) {
    res.statusCode = 400;
    res.end();
    return;
  }

  if (ORIGIN_WHITELIST.has(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }

  res.setHeader('Content-Type', 'application/json');

  github.getEverything(user, repo, cursor).then(response => {
    res.statusCode = 200;
    res.end(JSON.stringify(response));
  }).catch(error => {
    res.statusCode = 500;
    res.end(JSON.stringify({error}));
  });
}).listen(3061, 'localhost');

console.log('API server running at http://localhost:3061/');
