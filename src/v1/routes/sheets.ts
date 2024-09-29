
import { authenticateTokenServiceToService } from '@beanc16/jwt-helpers';
import express from 'express';
import * as handlers from '../handlers/sheets.js';

export const sheetsRoutes = express();

sheetsRoutes.post('/range', authenticateTokenServiceToService, handlers.getRange);
sheetsRoutes.post('/ranges', authenticateTokenServiceToService, handlers.getRanges);
sheetsRoutes.patch('/range', authenticateTokenServiceToService, handlers.update);
