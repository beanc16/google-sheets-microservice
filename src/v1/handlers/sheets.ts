import { logger } from '@beanc16/logger';
import { GoogleSheetsMicroserviceFilter, GoogleSheetsMicroserviceFilterType } from '@beanc16/microservices-abstraction';
import DotnetResponses from 'dotnet-responses';
import express from 'express';

import { GetRangesParameters, GoogleSheetsClient } from '../services/googleSheetsClient.js';
import { MajorDimension } from '../../constants.js';
import { CompositeKeyRecord } from '../services/CompositeKeyRecord.js';
import { validateJoiSchema } from '../validation/validators.js';
import { appendSchema, getBatchPageTitlesSchema, getPageTitlesSchema, getRangeSchema, getRangesSchema, updateSchema } from '../validation/sheets.js';

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
            spreadsheetId,
            range,
            majorDimension = MajorDimension.Rows,
        } = cur;

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

        Success.json({
            res,
            data: results,
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
            range,
            majorDimension = MajorDimension.Rows,
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(getRangeSchema, body, res);

    try
    {
        const { values = [] } = await GoogleSheetsClient.getRange({
            spreadsheetId,
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

const filterTitles = (unfilteredTitles: string[], unprocessedFilters: GoogleSheetsMicroserviceFilter[]): string[] =>
{
    if (unprocessedFilters.length === 0)
    {
        return unfilteredTitles;
    }

    const filters = unprocessedFilters.map(filter =>
    {
        const valuesArray = filter.values.map(value => value.toLowerCase());
        const valuesSet = new Set(valuesArray);

        return {
            type: filter.type,
            valuesArray,
            valuesSet,
        };
    });

    const handlerMap: Record<GoogleSheetsMicroserviceFilterType, (
        title: string,
        values: {
            valuesArray: string[];
            valuesSet: Set<string>;
        },
    ) => boolean> =
    {
        [GoogleSheetsMicroserviceFilterType.CaseInsensitiveIncludes]: (title, { valuesArray }) =>
            valuesArray.some(value => title.toLowerCase().includes(value)),

        [GoogleSheetsMicroserviceFilterType.CaseInsensitiveExcludes]: (title, { valuesArray }) =>
            !valuesArray.some(value => title.toLowerCase().includes(value)),

        [GoogleSheetsMicroserviceFilterType.CaseInsensitiveMatch]: (title, { valuesSet }) =>
            valuesSet.has(title.toLowerCase()),

        [GoogleSheetsMicroserviceFilterType.CaseInsensitiveNoMatch]: (title, { valuesSet }) =>
            !valuesSet.has(title.toLowerCase()),
    };

    return unfilteredTitles.filter(title =>
    {
        const lowercaseTitle = title.toLowerCase();

        return filters.every(filter =>
        {
            return handlerMap[filter.type](lowercaseTitle, filter);
        });
    });
};

export const getSheetTitles = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetId,
            filters = [],
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(getPageTitlesSchema, body, res);

    try
    {
        const unfilteredTitles = await GoogleSheetsClient.getPageTitles({
            spreadsheetId,
        });

        const titles = filterTitles(unfilteredTitles, filters);

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

export const getBatchSheetTitles = async (req: express.Request, res: express.Response): Promise<void> =>
{
    const {
        body: {
            spreadsheetMetadata = [],
            filters = [],
        } = {},
        body = {}, // TODO: Type this later
    } = req;

    validateJoiSchema(getBatchPageTitlesSchema, body, res);

    // @ts-ignore -- TODO: Fix this later
    const { spreadsheetIdSet, spreadsheetIdToFilters } = spreadsheetMetadata.reduce((acc: {
        spreadsheetIdSet: Set<string>;
        spreadsheetIdToFilters: Record<string, string[]>;
    }, { spreadsheetId = '', filters: innerFilters = [] }) =>
    {
        acc.spreadsheetIdSet.add(spreadsheetId);
        acc.spreadsheetIdToFilters[spreadsheetId] = [
            ...filters,
            ...innerFilters,
        ];

        return acc;
    }, {
        spreadsheetIdSet: new Set<string>(),
        spreadsheetIdToFilters: {},
    });

    try
    {
        const clientResponse = await GoogleSheetsClient.getPageTitlesBatch({
            spreadsheetIds: [...spreadsheetIdSet],
        });

        const result = clientResponse.map(({ spreadsheetId, titles }) =>
        {
            return {
                spreadsheetId,
                titles: filterTitles(titles, filters),
            };
        })

        Success.json({
            res,
            data: result,
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
            spreadsheetId,
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
            spreadsheetId: spreadsheetId,
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
