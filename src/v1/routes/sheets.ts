
import { authenticateTokenServiceToService } from '@beanc16/jwt-helpers';
import express from 'express';
import * as handlers from '../handlers/sheets.js';

export const sheetsRoutes = express();

sheetsRoutes.get('/range', authenticateTokenServiceToService, handlers.getRange);
sheetsRoutes.get('/ranges', authenticateTokenServiceToService, handlers.getRanges);
