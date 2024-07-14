import express from 'express';

import { healthCheckRoutes } from './routes/healthCheck.js';
// import { ptuRoutes } from './routes/ptu.js';
import { sheetsRoutes } from './routes/sheets.js';

export const v1Routes = express();

v1Routes.use('/ping', healthCheckRoutes);
// v1Routes.use('/ptu', ptuRoutes); // TODO: ONLY UNCOMMENT FOR LOCAL DEVELOPMENT, DELETE LATER
v1Routes.use('/sheets', sheetsRoutes);
