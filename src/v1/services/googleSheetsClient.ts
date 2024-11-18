import { auth, sheets, sheets_v4 } from '@googleapis/sheets';
import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher'; // For batching requests

export type GetRangesParameters = sheets_v4.Params$Resource$Spreadsheets$Values$Batchget;

interface GetPageTitlesBatchParameters
{
    spreadsheetIds: string[];
}

interface GetPageTitlesBatchResponse
{
    spreadsheetId: string;
    titles: string[];
}

export class GoogleSheetsClient
{
    private static client: sheets_v4.Sheets;
    private static batchClient: sheets_v4.Sheets;

    private static parseCredentials(): object
    {
        const stringifiedCredentials = Buffer.from(process.env.GOOGLE_SHEETS_KEYFILE_BASE64_ENCODED ?? '', 'base64').toString();
        return JSON.parse(stringifiedCredentials) as object;
    }

    private static getBaseClientConfig(): sheets_v4.Options
    {
        const credentials = this.parseCredentials();

        const googleAuthClient = new auth.GoogleAuth({
            credentials,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        return {
            version: 'v4',
            auth: googleAuthClient,
        };
    }

    private static async initialize(): Promise<sheets_v4.Sheets>
    {
        if (!this.client)
        {
            const config = this.getBaseClientConfig();
            this.client = sheets(config);
        }

        if (!this.batchClient)
        {
            const config = this.getBaseClientConfig();
            this.batchClient = sheets({
                ...config,
                fetchImplementation: batchFetchImplementation(),
            });
        }

        return this.client;
    }

    private static parseTitles(sheets: sheets_v4.Schema$Sheet[])
    {
        const titles = sheets.reduce<string[]>((acc, { properties = {} }) => 
        {
            const { title } = properties;

            if (title)
            {
                acc.push(title);
            }

            return acc;
        }, []);

        return titles;
    }

    public static async getPageTitles(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Get): Promise<string[]>
    {
        await this.initialize();

        const {
            data: {
                sheets = [],
            },
        } = await this.client.spreadsheets.get({
            spreadsheetId: parameters.spreadsheetId,
            fields: 'sheets/properties/title',
        });

        return this.parseTitles(sheets);
    }

    public static async getPageTitlesBatch({ spreadsheetIds }: GetPageTitlesBatchParameters): Promise<GetPageTitlesBatchResponse[]>
    {
        await this.initialize();

        const promises = spreadsheetIds.map(async (spreadsheetId) =>
        {
            const {
                data: {
                    sheets = [],
                },
            } = await this.batchClient.spreadsheets.get({
                spreadsheetId,
                fields: 'sheets/properties/title',
            });

            const titles = this.parseTitles(sheets);

            return { spreadsheetId, titles };
        });

        return await Promise.all(promises);
    }

    public static async getRange(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Get): Promise<sheets_v4.Schema$ValueRange>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.get(parameters);
        return rows.data;
    }

    public static async getRanges(parameters: GetRangesParameters): Promise<sheets_v4.Schema$BatchGetValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchGet(parameters);
        return rows.data;
    }

    public static async update(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Update): Promise<sheets_v4.Schema$UpdateValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.update(parameters);
        return rows.data;
    }

    public static async batchUpdate(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate): Promise<sheets_v4.Schema$BatchUpdateValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchUpdate(parameters);
        return rows.data;
    }

    public static async clear(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Clear): Promise<sheets_v4.Schema$ClearValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.clear(parameters);
        return rows.data;
    }

    public static async batchClear(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchclear): Promise<sheets_v4.Schema$BatchClearValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchClear(parameters);
        return rows.data;
    }

    public static async append(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Append): Promise<sheets_v4.Schema$AppendValuesResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.append(parameters);
        return rows.data;
    }

    public static async batchGetByDataFilter(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchgetbydatafilter): Promise<sheets_v4.Schema$BatchGetValuesByDataFilterResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchGetByDataFilter(parameters);
        return rows.data;
    }

    public static async batchUpdateByDataFilter(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdatebydatafilter): Promise<sheets_v4.Schema$BatchUpdateValuesByDataFilterResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchUpdateByDataFilter(parameters);
        return rows.data;
    }

    public static async batchClearByDataFilter(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchclearbydatafilter): Promise<sheets_v4.Schema$BatchClearValuesByDataFilterResponse>
    {
        await this.initialize();

        const rows = await this.client.spreadsheets.values.batchClearByDataFilter(parameters);
        return rows.data;
    }
}
