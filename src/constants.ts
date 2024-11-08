import fs from 'fs';

export enum SpreadSheetId {
    PtuEdenEncounterTables = 'ptuEdenEncounterTables',
}

export const spreadsheetIds = {
    [SpreadSheetId.PtuEdenEncounterTables]: '1n5cs_kQX26sWuRK3cYTyoIDDylinw7IvppYPjizilhY',
};

export const spreadsheetIdsToEnum = Object.entries(spreadsheetIds).reduce((acc, [name, id]) => {
    acc[id] = name as SpreadSheetId;
    return acc;
}, {} as Record<string, SpreadSheetId>);

export enum MajorDimension {
    Rows = 'ROWS',
    Columns = 'COLUMNS',
}

// ---> TODO: Delete local-only code later
export interface PokedexEntry
{
    name: string;
    habitats: string[];
    alternateNames?: string[];
}

const readPokedexes = () =>
{
    try
    {
        const pokedexDirectory = 'src/v1/files/ptu/pokedexes';
        const pokedexFiles = fs.readdirSync(pokedexDirectory);
    
        const combinedPokedex = pokedexFiles.reduce((acc, cur) =>
        {
            const data = fs.readFileSync(`${pokedexDirectory}/${cur}`);
            const parsedData = JSON.parse(data.toString()) as PokedexEntry[];
    
            parsedData.forEach((dexEntry) =>
            {
                const { name } = dexEntry;
                acc[name] = dexEntry;
            });
    
            return acc;
        }, {} as Record<string, PokedexEntry>);
    
        return combinedPokedex;
    }

    catch (error)
    {
        return {} as Record<string, PokedexEntry>;
    }
};

export const pokedex = readPokedexes();
export const getPokemonFromPokedex = (pokemonName: string): PokedexEntry | undefined =>
{
    if (pokedex[pokemonName])
    {
        return pokedex[pokemonName];
    }

    const pokedexEntry = Object.values(pokedex).find(({ alternateNames = [] }) => {
        return alternateNames.includes(pokemonName);
    });

    return pokedexEntry;
};
// <---
