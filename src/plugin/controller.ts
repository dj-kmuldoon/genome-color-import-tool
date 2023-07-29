import { showUI, on } from '@create-figma-plugin/utilities'
import { ImportCollateHandler, ImportGenomeHandler } from '../app/types'
import { Matrix } from '../genome/modules/SwatchMatrix';
import { importPaletteColors, importContextualTokens } from './helpers/variables'
import { importPaletteColorStyles } from './helpers/render'
import { loadFonts, figmaRGBToHex } from './utilities'
import chroma from "chroma-js";

let processedColorStyles: string[] = []

export default function () {

  on<ImportCollateHandler>('IMPORT_COLLATE', async (grid: Matrix.Grid) => {
    insertSemanticPaletteVariables()
    insertLiveCoverageDefinitiveColorVariables()

    insertNeutralPaletteVariables()
    insertLightenAlphasPaletteVariables()
    insertDarkenAlphasPaletteVariables()
    insertSocialPaletteVariables()
    
    const localPaintStyles = figma.getLocalPaintStyles();
    const localPaintStylesFiltered = localPaintStyles.filter(item => !processedColorStyles.includes(item.name) && item.name.includes("/palettes/"))
    console.log("ALL DONE (PALETTES) ->", localPaintStylesFiltered.map(item => item.name))

  })


  on<ImportGenomeHandler>('IMPORT_GENOME', async (grid: Matrix.Grid) => {
    await loadFonts()
    const palette = await importPaletteColors(grid)
    await importContextualTokens(palette)
    await importPaletteColorStyles(grid)
    figma.closePlugin()
  })

  showUI({ height: 340, width: 320 })

}

const makeVariable = (name: string, collection: VariableCollection, type: VariableResolvedDataType) => {
  let variable = getVariables(collection).find((item: { name: string }) => item.name === name);
  if (!variable) variable = figma.variables.createVariable(name, collection.id, type)
  // if (shouldInsertContextualModes(collection)) {
  //     collection.renameMode(collection!.modes[0].modeId, MODE.LIGHT)
  //     collection.addMode(MODE.DARK)
  // }
  return variable
}

const getVariables = (collection: any) => {
  return collection?.variableIds.map((id: string) => {
    return figma.variables.getVariableById(id)
  })
}

const returnVariableCollection = (name: string, create: boolean): VariableCollection => {
  const collections = figma.variables.getLocalVariableCollections()
  let collection = collections.find(item => item.name === name);
  if (!collection && create) {
    collection = figma.variables.createVariableCollection(name)
  }
  return collection!
}

const hexToFigmaColor = (hex: string, alpha: number | null) => {
  const rgba = chroma(hex).rgba()
  return {
    r: rgba[0] / 255,
    g: rgba[1] / 255,
    b: rgba[2] / 255,
    a: (alpha ? alpha / 100 : rgba[3])
  }
}

const insertLiveCoverageDefinitiveColorVariables = () => {
  
  const localPaintStyles = figma.getLocalPaintStyles();
  const localPalletePaintStyles = localPaintStyles.filter((style) => style.name.includes("/palettes/") && style.name.includes("Live Coverage/"));
  const localPalletePaintStylesNames = localPalletePaintStyles.map((style) => style.name)

  const collection = returnVariableCollection("definitive", true)

  localPalletePaintStyles.map((paintStyle) => {

    const paintStyleName = paintStyle.name 
    const xA = paintStyleName.split("/")
    const xB = xA[xA.length - 1];
    const split_string = xB.split(/(\d+)/)
    const xC = split_string.filter(Boolean);

      processedColorStyles.push(paintStyleName)

      const p1 = xC.shift()
      const p2 = xC.join("")
      const pathName = `Live Coverage/${p1}/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))
      variable.description = paintStyle.description

  })
}

const insertSemanticPaletteVariables = () => {
  const semanticNames = ["primary", "secondary", "tertiary", "positive", "negative", "highlight", "attention", "info", "system"]
  const localPaintStyles = figma.getLocalPaintStyles();
  const localPalletePaintStyles = localPaintStyles.filter((style) => style.name.includes("/palettes/"));
  const localPalletePaintStylesNames = localPalletePaintStyles.map((style) => style.name)
  console.log("local palette paint style names ->", localPalletePaintStylesNames)

  const collection = returnVariableCollection("palette", true)

  localPalletePaintStyles.map((paintStyle) => {

    const paintStyleName = paintStyle.name 
    const xA = paintStyleName.split("/")
    const xB = xA[xA.length - 1];
    const split_string = xB.split(/(\d+)/)
    const xC = split_string.filter(Boolean);
    if (semanticNames.includes(xC[0])) {

      processedColorStyles.push(paintStyleName)

      const p1 = xC.shift()
      const p2 = xC.join("")
      const pathName = `brand/${p1}/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))
      variable.description = paintStyle.description

    } else {
      console.log(`${paintStyle.name}`)
    }

  })

}

const insertNeutralPaletteVariables = () => {
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = returnVariableCollection("palette", true)

  const localPalleteNeutralPaintStyles = localPaintStyles.filter((style) => style.name.includes("/neutral"));

  console.log("localPalleteNeutralPaintStyles length ->", localPalleteNeutralPaintStyles.length)

  const n000 = makeVariable("brand/neutral/000", collection, "COLOR")
  n000.setValueForMode(collection!.defaultModeId, hexToFigmaColor("#FFFFFF", null))
  processedColorStyles.push("NK-WSJ/palettes/white")

  localPalleteNeutralPaintStyles.map((paintStyle, index) => {

    const paintStyleName = paintStyle.name
    processedColorStyles.push(paintStyleName)

    const xA = paintStyleName.split("/")
    const xB = xA[xA.length - 1];
    const split_string = xB.split(/(\d+)/)
    const xC = split_string.filter(Boolean);

    const p1 = xC.shift()
    const p2 = xC.join("")
    const pathName = `brand/${p1}/${p2}`
    const variable = makeVariable(pathName, collection, "COLOR")
    const paint = (paintStyle.paints[0] as any)
    const hex = figmaRGBToHex(paint.color)
    variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))
    variable.description = paintStyle.description
    console.log(paintStyleName)

  })

  const n950 = makeVariable("brand/neutral/950", collection, "COLOR")
  n950.setValueForMode(collection!.defaultModeId, hexToFigmaColor("#000000", null))
  processedColorStyles.push("NK-WSJ/palettes/black")

}

const insertLightenAlphasPaletteVariables = () => {
  const filter = "palettes/white"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = returnVariableCollection("palette", true)

  const localPalleteLightenPaintStyles = localPaintStyles.filter((style) => style.name.includes(filter));
  const localPalleteLightenPaintStylesNames = localPalleteLightenPaintStyles.map((style) => style.name)
  
  localPalleteLightenPaintStyles.map((paintStyle, index) => {

    const paintStyleName = paintStyle.name

    const xA = paintStyleName.split("/")
    const xB = xA[xA.length - 1];
    const split_string = xB.split(/(\d+)/)
    const xC = split_string.filter(Boolean);

    if (xC.length > 1) {
      processedColorStyles.push(paintStyleName)

      const p1 = xC.shift()
      const p2 = xC.join("")
      const pathName = `brand/alpha/lighten/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)

      const aaa = paint.color
      const bbb = paint.opacity
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, {r: 1, g: 1, b: 1, a:bbb})
    }

  })
}

const insertDarkenAlphasPaletteVariables = () => {
  const filter = "palettes/black"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = returnVariableCollection("palette", true)

  const localPalleteLightenPaintStyles = localPaintStyles.filter((style) => style.name.includes(filter));
  const localPalleteLightenPaintStylesNames = localPalleteLightenPaintStyles.map((style) => style.name)

  localPalleteLightenPaintStyles.map((paintStyle, index) => {

    const paintStyleName = paintStyle.name

    const xA = paintStyleName.split("/")
    const xB = xA[xA.length - 1];
    const split_string = xB.split(/(\d+)/)
    const xC = split_string.filter(Boolean);

    if (xC.length > 1) {

      processedColorStyles.push(paintStyleName)

      const p1 = xC.shift()
      const p2 = xC.join("")
      const pathName = `brand/alpha/darken/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)

      const aaa = paint.color
      const bbb = paint.opacity
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, {r: 0, g: 0, b: 0, a:bbb})
    }

  })
}

const insertSocialPaletteVariables = () => {
  const filter = "palettes/social"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = returnVariableCollection("social", true)

  const styles = localPaintStyles.filter((style) => style.name.includes(filter));

  styles.map((paintStyle, index) => {

    const paintStyleName = paintStyle.name
    const xA = paintStyleName.split("/social")
    const xB = xA[xA.length - 1];
    const pathName = `${xB}`

    const paint = (paintStyle.paints[0] as any)
    const hex = figmaRGBToHex(paint.color)

    const variable = makeVariable(pathName, collection, "COLOR")
    variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))

    processedColorStyles.push(paintStyleName)

  })
}