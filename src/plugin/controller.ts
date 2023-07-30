import { showUI, on } from '@create-figma-plugin/utilities'
import { ImportCollateHandler, ImportGenomeHandler } from '../app/types'
import { Matrix } from '../genome/modules/SwatchMatrix';
import { importPaletteColors, importContextualTokens } from './helpers/variables'
import { importPaletteColorStyles } from './helpers/render'
import { loadFonts, figmaRGBToHex } from './utilities'
import chroma from "chroma-js";

const localPaintStyles = figma.getLocalPaintStyles();
let processedColorStyles: string[] = []

export default function () {

  on<ImportCollateHandler>('IMPORT_COLLATE', async (grid: Matrix.Grid) => {


    // const domain = "Factiva"
    const domain = "WSJ"
    // const domain = "OpenFin"

    insertSemanticPaletteVariables()
    insertLiveCoverageDefinitiveColorVariables()

    insertNeutralPaletteVariables()
    insertLightenAlphasPaletteVariables()
    insertDarkenAlphasPaletteVariables()
    insertSocialPaletteVariables()

    insertContextualVariables(domain, null, "interface")
    insertContextualVariables(domain, null, "ink")
    insertContextualVariables(domain, null, "interactive")
    insertContextualVariables(domain, "Opinion", "interface")
    insertContextualVariables(domain, "Opinion", "interactive")

    const remainingPaintStyles = localPaintStyles.filter(item => !processedColorStyles.includes(item.name))
    console.log("All that remains...", remainingPaintStyles.map(item => item.name))

    //
    // Let's get a list of all the colors in palette variables and see if we can find
    // a match for a given hex code...
    //

    const paletteCollection = getLocalVariableCollection("palette")
    const contextualCollection = getLocalVariableCollection("contextual")
    mapContextualToPaletteVariables(paletteCollection!, contextualCollection!)
    return

    const lightMode = contextualCollection!.modes![0].modeId
    const darkMode = contextualCollection!.modes![1].modeId

    contextualCollection!.variableIds.map(item => {

      const variable = figma.variables.getVariableById(item)
      const name = variable?.name

      const lightModeHex = figmaRGBToHex((variable!.valuesByMode[lightMode] as RGBA))
      const darkModeHex = figmaRGBToHex((variable!.valuesByMode[darkMode] as RGBA))

      const lightModeMatches = findMatchingColorVariablesInCollection(lightModeHex, paletteCollection!, paletteCollection!.modes![0].modeId)
      const darkModeMatches = findMatchingColorVariablesInCollection(darkModeHex, paletteCollection!, paletteCollection!.modes![0].modeId)

      console.log(`name:${contextualCollection!.name}/${name} lightModeHex:${lightModeHex} (${lightModeMatches[0].name}) darkModeHex:${darkModeHex} (${darkModeMatches[0].name})`)

    })
  })

  const mapContextualToPaletteVariables = (paletteCollection: VariableCollection, contextualCollection: VariableCollection) => {

    const lightMode = contextualCollection!.modes![0].modeId
    const darkMode = contextualCollection!.modes![1].modeId

    contextualCollection!.variableIds.map(item => {

      const variable = figma.variables.getVariableById(item)
      const name = variable?.name

      const lightModeHex = figmaRGBToHex((variable!.valuesByMode[lightMode] as RGBA))
      const darkModeHex = figmaRGBToHex((variable!.valuesByMode[darkMode] as RGBA))

      const lightModeMatches = findMatchingColorVariablesInCollection(lightModeHex, paletteCollection!, paletteCollection!.modes![0].modeId)
      const darkModeMatches = findMatchingColorVariablesInCollection(darkModeHex, paletteCollection!, paletteCollection!.modes![0].modeId)

      let lightModeVariableId =  lightModeMatches.length ? lightModeMatches[0].id : null
      let darkModeVariableId =  darkModeMatches.length ? darkModeMatches[0].id : null

      if (lightModeVariableId) {
        const variableAlias = figma.variables.getVariableById(lightModeVariableId)
        if (variableAlias) {
          variable!.setValueForMode(
            lightMode, 
            figma.variables.createVariableAlias(variableAlias)
          )
        }
      }

      if (darkModeVariableId) {
        const variableAlias = figma.variables.getVariableById(darkModeVariableId)
        if (variableAlias) {
          variable!.setValueForMode(
            darkMode, 
            figma.variables.createVariableAlias(variableAlias)
          )
        }
      }

      console.log(`name:${contextualCollection!.name}/${name} lightModeHex:${lightModeHex} (${lightModeMatches[0].name}) darkModeHex:${darkModeHex} (${darkModeMatches[0].name})`)

    })
  }

  const findMatchingColorVariablesInCollection = (searchHex: string, collection: VariableCollection, mode: string | null) => {

    if (mode === null) {mode = collection.modes![0].modeId}

    const result: { id: string; name: string; hex: string; mode: string; }[] = []

    collection.variableIds.map(item => {

      const variable = figma.variables.getVariableById(item)
      const name = variable?.name
      const rgba = (variable!.valuesByMode[mode!] as RGBA)
      const hex = figmaRGBToHex(rgba)

      if (hex.endsWith(searchHex.toLowerCase())) {
        // console.log(`a FOUND -> name:${collection.name}/${name} hex:${hex}`)
        result.push({id: variable!.id,name: `${collection.name}/${name}`, hex: hex, mode: mode! } )
      }

    })

    return result

  }


const getLocalVariableCollection = (key: (string)) : VariableCollection | null => {
  const localCollections = figma.variables.getLocalVariableCollections();
  const collectionId = localCollections.filter(item => item.name === key)[0].id
  return figma.variables.getVariableCollectionById(collectionId)
}


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

const createVariableCollection = (name: string, create: boolean): VariableCollection => {
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

  const collection = createVariableCollection("definitive", true)

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

  const collection = createVariableCollection("palette", true)

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
      const pathName = `~/${p1}/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))
      variable.description = paintStyle.description

    } 

  })

}

const insertNeutralPaletteVariables = () => {
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = createVariableCollection("palette", true)

  const localPalleteNeutralPaintStyles = localPaintStyles.filter((style) => style.name.includes("/neutral"));

  const n000 = makeVariable("~/neutral/000", collection, "COLOR")
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
    const pathName = `~/${p1}/${p2}`

    const variable = makeVariable(pathName, collection, "COLOR")
    const paint = (paintStyle.paints[0] as any)
    const hex = figmaRGBToHex(paint.color)
    variable.setValueForMode(collection!.defaultModeId, hexToFigmaColor(hex, null))
    variable.description = paintStyle.description

  })

  const n950 = makeVariable("~/neutral/950", collection, "COLOR")
  n950.setValueForMode(collection!.defaultModeId, hexToFigmaColor("#000000", null))
  processedColorStyles.push("NK-WSJ/palettes/black")

}

const insertLightenAlphasPaletteVariables = () => {
  const filter = "palettes/white"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = createVariableCollection("palette", true)

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
      const pathName = `~/alpha/lighten/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)

      const aaa = paint.color
      const bbb = paint.opacity
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, { r: 1, g: 1, b: 1, a: bbb })
    }

  })
}

const insertDarkenAlphasPaletteVariables = () => {
  const filter = "palettes/black"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = createVariableCollection("palette", true)

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
      const pathName = `~/alpha/darken/${p2}`
      const variable = makeVariable(pathName, collection, "COLOR")
      const paint = (paintStyle.paints[0] as any)

      const aaa = paint.color
      const bbb = paint.opacity
      const hex = figmaRGBToHex(paint.color)
      variable.setValueForMode(collection!.defaultModeId, { r: 0, g: 0, b: 0, a: bbb })
    }

  })
}

const insertSocialPaletteVariables = () => {
  const filter = "palettes/social"
  const localPaintStyles = figma.getLocalPaintStyles();
  const collection = createVariableCollection("social", true)

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

const insertContextualVariables = (domain: string, subdomain: (string | null), category: string) => {

  const remainingPaintStyles = localPaintStyles.filter(item => !processedColorStyles.includes(item.name))

  const fullDomain = (subdomain !== null ? `NK-${domain}-${subdomain}` : `NK-${domain}`)
  const localPaintStylesContextualInterfaceLightMode = remainingPaintStyles.filter(item => item.name.includes(`${fullDomain}/${category}/`))

  const collection = createVariableCollection("contextual", true)
  collection.renameMode(collection!.modes[0].modeId, "Light")
  if (collection!.modes.length == 1) collection.addMode("Dark")

  localPaintStylesContextualInterfaceLightMode.map(paintStyle => {

    let pathName =  paintStyle.name.replace(`${fullDomain}/${category}/${category}`, "")
    pathName = pathName.toLowerCase()

    const split_string = pathName.split(/(\d+)/)
    const xC = split_string.filter(Boolean);

    const pathNameParsed = xC.length > 1 ? `${subdomain ? subdomain.toLocaleLowerCase() : "~"}/${category}/${xC.join("/")}` : `~/${category}/~/${xC.join("/")}`

    const paint = (paintStyle.paints[0] as any)
    const hex = figmaRGBToHex(paint.color)
    const variable = makeVariable(pathNameParsed, collection, "COLOR")
    variable.setValueForMode(collection!.modes[0].modeId, hexToFigmaColor(hex, null))
    variable.description = paintStyle.description
    processedColorStyles.push(paintStyle.name)

    const toReplace = (subdomain === null ? `NK-${domain}` : `NK-${domain}-${subdomain}`)
    const darkModeCompanionStyleName = paintStyle.name.replace(`${toReplace}/`, `${toReplace}-Dark/`)

    const darkModeCompanionStyle = localPaintStyles.filter(item => item.name === darkModeCompanionStyleName)

    if (darkModeCompanionStyle.length) {
      const darkModeCompanionStyleItem = darkModeCompanionStyle[0]
      const paintDark = (darkModeCompanionStyleItem.paints[0] as any)
      const hexDark = figmaRGBToHex(paintDark.color)
      variable.setValueForMode(collection!.modes[1].modeId, hexToFigmaColor(hexDark, null))
      processedColorStyles.push(darkModeCompanionStyleItem.name)
    }

    // Now we can map to the palette colors optimistically...

  })
}