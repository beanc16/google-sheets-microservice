
import { authenticateTokenServiceToService } from '@beanc16/jwt-helpers';
import express from 'express';
import * as handlers from '../handlers/sheets.js';

export const sheetsRoutes = express();

sheetsRoutes.post('/range', authenticateTokenServiceToService, handlers.getRange);
sheetsRoutes.post('/titles', authenticateTokenServiceToService, handlers.getSheetTitles);
sheetsRoutes.post('/range/append', authenticateTokenServiceToService, handlers.append);
sheetsRoutes.patch('/range', authenticateTokenServiceToService, handlers.update);

// Bulk endpoints
sheetsRoutes.post('/ranges', authenticateTokenServiceToService, handlers.getRanges);
sheetsRoutes.post('/batch/titles', authenticateTokenServiceToService, handlers.getBatchSheetTitles);
