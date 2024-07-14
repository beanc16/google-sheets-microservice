import DotnetResponses from 'dotnet-responses';
import type express from 'express';
import Joi from 'joi';

const { ValidationError } = DotnetResponses;

export const validateJoiSchema = (schema: Joi.AnySchema, payload: unknown, res: express.Response): unknown =>
{
    const { value, error } = schema.validate(payload);

    if (error)
    {
        ValidationError.json({
            res,
            error,
        });
    }

    return value;
}
