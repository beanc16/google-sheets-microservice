/************
 * REQUIRES *
 ************/

import loggingTelemetry from '@beanc16/logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { config } from './constants.js';
import { errorRoutes } from './all/index.js';
import { v1Routes } from './v1/index.js';

// Setup
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Telemetry
const {
    logger,
    express: {
        errorHandler,
        logEndpointDuration,
    },
} = loggingTelemetry;



/********************
 * START MIDDLEWARE *
 ********************/

app.use((req, res, next) => logEndpointDuration(req, res, next, logger));



/*******************
 * EXTERNAL ROUTES *
 *******************/

app.use('/api/v1', v1Routes);
app.use('/', errorRoutes);



/******************
 * END MIDDLEWARE *
 ******************/

app.use((
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => errorHandler(err, req, res, next));



/********
 * PORT *
 ********/

app.listen(config.port, function ()
{
    logger.info(`App listening on port ${config.port}`);
});