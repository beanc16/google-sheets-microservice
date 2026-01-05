import { GoogleSheetsMicroserviceFilterType } from '@beanc16/microservices-abstraction';
import Joi from 'joi';
import { MajorDimension } from '../../constants.js';

const validMajorDimensions = Object.keys(MajorDimension);
const validFilters = Object.values(GoogleSheetsMicroserviceFilterType);

// Resuable Schemas
const stringSchema = Joi.string().required();
const majorDimensionSchema = Joi.string().valid(...validMajorDimensions).optional();

// Get Range
const baseGetRange = {
    range: stringSchema,
    majorDimension: majorDimensionSchema,
};

const getTitlesFilters = Joi.array().items(
    Joi.object({
        type: Joi.string().valid(...validFilters).required(),
        values: Joi.array().items(stringSchema).min(1).max(500).required(),
    }).optional(),
).max(5000).optional();

export const getRangeSchema = Joi.object({
    spreadsheetId: stringSchema,
    ...baseGetRange,
}).required();

export const getRangesSchema = Joi.object({
    ranges: Joi.array().items(
        getRangeSchema
    ).min(1).max(5000).required(),
}).required();

export const getPageTitlesSchema = Joi.object({
    spreadsheetId: stringSchema,
    filters: getTitlesFilters,
}).required();

export const getBatchPageTitlesSchema = Joi.object({
    spreadsheetMetadata: Joi.array().items(
        Joi.object({
            spreadsheetId: stringSchema,
            filters: getTitlesFilters,
        }).required(),
    ).unique().min(1).max(500).required(),
    filters: getTitlesFilters,
}).required();

// Update
const updateValuesSchema = Joi.array().items(
    Joi.array().items(stringSchema).min(1).max(500).required()
).min(1).max(1000).required();

export const updateSchema = Joi.object({
    spreadsheetId: stringSchema,
    ...baseGetRange,
    values: updateValuesSchema,
}).required();

export const appendSchema = updateSchema;
