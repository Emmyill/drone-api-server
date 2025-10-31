// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const configsRouter = require('./routes/configs');
const statusRouter  = require('./routes/status');
const logsRouter    = require('./routes/logs');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/configs', configsRouter);
app.use('/status', statusRouter);
app.use('/logs', logsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API Server listening on port ${port}`));
