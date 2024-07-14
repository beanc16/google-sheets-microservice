import DotnetResponses from 'dotnet-responses';
import express from 'express';

const { Success } = DotnetResponses;

export const ping = (_: express.Request, res: express.Response): void =>
{
    Success.json({
        res,
        message: "Pong",
    });
};
