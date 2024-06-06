const express = require('express');

const rootHandler = require('./handlers/root');
const rootPayloadMiddleware = require('./middlewares/rootPayload');

const router = express.Router();

router.post('/', rootPayloadMiddleware, rootHandler);

module.exports = router;
