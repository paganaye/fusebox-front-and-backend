'use strict';
const path = require('path')
const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0'


// App
const app = express();
app.use('/', express.static(path.join(__dirname, '../', 'frontend')))

app.listen(PORT, HOST);
console.log(` -> Running on http://${HOST}:${PORT}`);
console.log(` -> Serving pages from ${path.join(__dirname, '../', 'frontend')}`)