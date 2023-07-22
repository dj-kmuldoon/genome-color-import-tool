import chroma from 'chroma-js'

export const TINT = {
    LIGHTEN: "lighten",
    DARKEN: "darken",
    ALPHAS: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
}

export const COLLECTION = {
    PALETTE: "palette",
    CONTEXTUAL: "contextual",
    DEFINITIVE: "definitive",
    SOCIAL: "social"
}

export const MODE = {
    LIGHT: "Light",
    DARK: "Dark",
    NULL: "Value"
}

const COLOR = {
    WHITE: "#FFFFFF",
    BLACK: "#000000"
}

export const returnVariableCollection = (name: string, create: boolean): VariableCollection => {
    const collections = figma.variables.getLocalVariableCollections()
    let collection = collections.find(item => item.name === name);
    if (!collection && create) {
        collection = figma.variables.createVariableCollection(name)
    }
    return collection!
}

export const getVariables = (collection: any) => {
    return collection?.variableIds.map((id: string) => {
        return figma.variables.getVariableById(id)
    })
}

export const makeVariable = (name: string, collection: VariableCollection, type: VariableResolvedDataType) => {
    let variable = getVariables(collection).find((item: { name: string }) => item.name === name);
    if (!variable) variable = figma.variables.createVariable(name, collection.id, type)
    if (shouldInsertContextualModes(collection)) {
        collection.renameMode(collection!.modes[0].modeId, MODE.LIGHT)
        collection.addMode(MODE.DARK)
    }
    return variable
}


const shouldInsertContextualModes = (collection: VariableCollection) => {
    return (collection.name === COLLECTION.CONTEXTUAL && !hasDarkLightModes(collection))
}

const hasDarkLightModes = (collection: VariableCollection) => {
    let modeNames = collection.modes.map(mode => { return mode.name })
    return arrayEquals(modeNames, [MODE.LIGHT, MODE.DARK])
}

const arrayEquals = (a: any, b: any) => {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export const hexToFigmaColor = (hex: string, alpha: number | null) => {
    const rgba = chroma(hex).rgba()
    return {
        r: rgba[0] / 255,
        g: rgba[1] / 255,
        b: rgba[2] / 255,
        a: (alpha ? alpha / 100 : rgba[3])
    }
}

export const insertBlackWhiteNeutrals = (column: any) => {
    if (column.semantic === "neutral") {
        // @ts-ignore
        column.rows.unshift({ semantic: "neutral", weight: "000", hex: COLOR.WHITE });
        // @ts-ignore
        column.rows.push({ semantic: "neutral", weight: "950", hex: COLOR.BLACK });
    }
}

export const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')