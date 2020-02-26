/**
 * Module dependencies.
 */

const express = require('express');

const router = express.Router();

router.get('*', require('./partials'));

module.exports = router;
