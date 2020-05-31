'use strict';
import api from "./services/api";

const path = require('path')
const express = require('express');

// Constants
const PORT = 80;
const HOST = '0.0.0.0'

// App
const app = express();
app.use('/api', api);
app.use('/', express.static(path.join(__dirname, '../', 'frontend')))

app.listen(PORT, HOST);
console.log(`\n -> Running on http://localhost:${PORT}`);
console.log(` -> Serving pages from ${path.join(__dirname, '../', 'frontend')}\n`)