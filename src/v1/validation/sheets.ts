import Joi from 'joi';
import { MajorDimension, spreadsheetIds } from '../../constants.js';

const validMajorDimensions = Object.keys(MajorDimension);
const validSpreadsheetIds = Object.keys(spreadsheetIds);

// Resuable Schemas
const stringSchema = Joi.string().min(1).required();
const spreadsheetSchema = Joi.string().valid(...validSpreadsheetIds).required();
const majorDimensionSchema = Joi.string().valid(...validMajorDimensions).optional();

// Get Range
const baseGetRange = {
    range: stringSchema,
    majorDimension: majorDimensionSchema,
};

export const getRangeSchema = Joi.alternatives([
    Joi.object({
        spreadsheet: spreadsheetSchema,
        ...baseGetRange,
    }),
    Joi.object({
        spreadsheetId: stringSchema,
        ...baseGetRange,
    }),
]).required();

export const getRangesSchema = Joi.object({
    ranges: Joi.array().items(
        getRangeSchema
    ).min(1).required(),
}).required();

// Update
const updateValuesSchema = Joi.array().items(
    Joi.array().items(
        Joi.string().required(),
    ).min(1).required()
).min(1).required();

const baseUpdate = {
    ...baseGetRange,
    values: updateValuesSchema,
};

export const updateSchema = Joi.alternatives([
    Joi.object({
        spreadsheet: spreadsheetSchema,
        ...baseUpdate,
    }),
    Joi.object({
        spreadsheetId: stringSchema,
        ...baseUpdate,
    }),
]).required();

export const appendSchema = updateSchema;
