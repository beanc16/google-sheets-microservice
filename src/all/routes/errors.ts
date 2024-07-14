import express from 'express';

import * as handlers from '../handlers/errors.js';

export const errorRoutes = express();

errorRoutes.all('/*', handlers.allErrors);