import DotnetResponses from 'dotnet-responses';
import express from 'express';

const { InvalidUrl } = DotnetResponses;

export const allErrors = (_: express.Request, res: express.Response): void =>
{
    InvalidUrl.json({ res });
};
