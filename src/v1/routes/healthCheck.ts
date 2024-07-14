import express from 'express';
import * as handlers from '../handlers/healthCheck.js';

export const healthCheckRoutes = express();

healthCheckRoutes.get('/', handlers.ping);
