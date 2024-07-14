import { auth, sheets, sheets_v4 } from '@googleapis/sheets';

export type GetRangesParameters = sheets_v4.Params$Resource$Spreadsheets$Values$Batchget;

export class GoogleSheetsClient
{
    static #client: sheets_v4.Sheets;

    static #parseCredentials(): object
    {
        const stringifiedCredentials = Buffer.from(process.env.GOOGLE_SHEETS_KEYFILE_BASE64_ENCODED ?? '', 'base64').toString();
        return JSON.parse(stringifiedCredentials) as object;
    }

    static #initialize(): sheets_v4.Sheets
    {
        if (!this.#client) {
            const credentials = this.#parseCredentials();

            const googleAuthClient = new auth.GoogleAuth({
                credentials,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                ],
            });

            this.#client = sheets({
                version: 'v4',
                auth: googleAuthClient,
            });
        }

        return this.#client;
    }

    static async getRange(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Get): Promise<sheets_v4.Schema$ValueRange>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.get(parameters);
        return rows.data;
    }

    static async getRanges(parameters: GetRangesParameters): Promise<sheets_v4.Schema$BatchGetValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.batchGet(parameters);
        return rows.data;
    }

    static async update(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Update): Promise<sheets_v4.Schema$UpdateValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.update(parameters);
        return rows.data;
    }

    static async batchUpdate(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchupdate): Promise<sheets_v4.Schema$BatchUpdateValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.batchUpdate(parameters);
        return rows.data;
    }

    static async clear(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Clear): Promise<sheets_v4.Schema$ClearValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.clear(parameters);
        return rows.data;
    }

    static async batchClear(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Batchclear): Promise<sheets_v4.Schema$BatchClearValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.batchClear(parameters);
        return rows.data;
    }

    static async append(parameters: sheets_v4.Params$Resource$Spreadsheets$Values$Append): Promise<sheets_v4.Schema$AppendValuesResponse>
    {
        this.#initialize();

        const rows = await this.#client.spreadsheets.values.append(parameters);
        return rows.data;
    }
}
