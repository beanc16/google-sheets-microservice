import DotnetResponses from 'dotnet-responses';
import express from 'express';
import { GetRangesParameters, GoogleSheetsClient } from '../services/googleSheetsClient.js';
import { MajorDimension, SpreadSheetId, spreadsheetIds, spreadsheetIdsToEnum } from '../../constants.js';
import { validateJoiSchema } from '../validation/validators.js';
import { appendSchema, getPageTitlesSchema, getRangeSchema, getRangesSchema, updateSchema } from '../validation/sheets.js';
import { CompositeKeyRecord } from '../services/CompositeKeyRecord.js';
import { logger } from '@beanc16/logger';

const { Success, InternalServerError, getResponseByStatusCode } = DotnetResponses;

const handleGoogleSheetsClientError = (res: express.Response, err: any) =>
{
    const {
        errors: [error] = [],
        status,
    } = err;

    // Google sheets error
    if (status)
    {
        const Response = getResponseByStatusCode(status);
        Response.json({
            res,
            error,
        });
    }

    // Unknown error
    else
    {
        logger.error(err);
        InternalServerError.json({
            res,
            error: err,
        });
    }
};

// TODO: Type ranges later
const parseGetRangesInput = (ranges: any[]): CompositeKeyRecord<[string, MajorDimension], GetRangesParameters> => {
    const parsedRanges: CompositeKeyRecord<[string, MajorDimension], GetRangesParameters> = ranges.reduce((
        acc: CompositeKeyRecord<[string, MajorDimension], GetRangesParameters>,
        cur: any // TODO: Type this later
    ) => {
        const {
            spreadsheetId: unparsedSpreadsheetId,
            spreadsheet,
            range,
            majorDimension = MajorDimension.Rows,
        } = cur;

        const spreadsheetId = unparsedSpreadsheetId ?? spreadsheetIds[spreadsheet as SpreadSheetId];

        const parameters = acc.Get([spreadsheetId, majorDimension]) || {
            spreadsheetId,
            ranges: [],
            majorDimension,
        };

        if (!parameters.ranges!.includes(range)) {
            const newParameters = {
                ...parameters,
                ranges: parameters.ranges!.concat(range),
            };
            acc.Add([spreadsheetId, majorDimension], newParameters);
        }

        return acc;
    }, new CompositeKeyRecord<[string, MajorDimension], GetRangesParameters>());

    return parsedRanges;
};

export const getRanges = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            ranges = [],
        } = {},
        body = {},
    } = req;

    validateJoiSchema(getRangesSchema, body, res);

    const parsedRanges = parseGetRangesInput(ranges);

    try
    {
        const promises = Object.values(parsedRanges.GetAll()).map((parameter) =>
            GoogleSheetsClient.getRanges(parameter)
        );
        const results = await Promise.all(promises);

        // Add spreadsheet name to the results if it exists
        const parsedResults = results.map((result) => {
            const { spreadsheetId } = result;
            const spreadsheet = spreadsheetIdsToEnum[spreadsheetId as string];
            return {
                spreadsheet,
                ...result,
            };
        });

        Success.json({
            res,
            data: parsedResults,
        });
    }
    catch (err: any)
    {
        handleGoogleSheetsClientError(res, err);
    }
};

export const getRange = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetId,
            spreadsheet,
            range,
            majorDimension = MajorDimension.Rows,
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(getRangeSchema, body, res);

    try
    {
        const { values = [] } = await GoogleSheetsClient.getRange({
            spreadsheetId: spreadsheetId ?? spreadsheetIds[spreadsheet as SpreadSheetId],
            range: range,
            majorDimension: majorDimension,
        });

        Success.json({
            res,
            data: values!,
        });
    }
    catch (err: any)
    {
        handleGoogleSheetsClientError(res, err);
    }
};

export const getSheetTitles = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetId,
            spreadsheet,
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(getPageTitlesSchema, body, res);

    try
    {
        const titles = await GoogleSheetsClient.getPageTitles({
            spreadsheetId: spreadsheetId ?? spreadsheetIds[spreadsheet as SpreadSheetId],
        });

        Success.json({
            res,
            data: { titles },
        });
    }
    catch (err: any)
    {
        handleGoogleSheetsClientError(res, err);
    }
};

export const update = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetId,
            spreadsheet,
            range,
            majorDimension = MajorDimension.Rows,
            values: inputValues = [],
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(updateSchema, body, res);

    try
    {
        const {
            updatedData: {
                values = [],
            } = {},
        } = await GoogleSheetsClient.update({
            spreadsheetId: spreadsheetId ?? spreadsheetIds[spreadsheet as SpreadSheetId],
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                range,
                majorDimension,
                values: inputValues,
            },
        });

        Success.json({
            res,
            data: values!,
        });
    }
    catch (err: any)
    {
        handleGoogleSheetsClientError(res, err);
    }
};

export const append = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetId,
            spreadsheet,
            range,
            majorDimension = MajorDimension.Rows,
            values: inputValues = [],
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(appendSchema, body, res);

    try
    {
        const {
            updates: {
                updatedData: {
                    values = [],
                } = {},
            } = {},
        } = await GoogleSheetsClient.append({
            spreadsheetId: spreadsheetId ?? spreadsheetIds[spreadsheet as SpreadSheetId],
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                range,
                majorDimension,
                values: inputValues,
            },
        });

        Success.json({
            res,
            data: values!,
        });
    }
    catch (err: any)
    {
        handleGoogleSheetsClientError(res, err);
    }
};

// TODO: Make endpoints for each operation in google sheets client
