import { showUI, on } from '@create-figma-plugin/utilities'
import { ImportCollateHandler, ImportGenomeHandler } from '../app/types'
import { Matrix } from '../genome/modules/SwatchMatrix';
import { importPaletteColors, importContextualTokens } from './helpers/variables'
import { importPaletteColorStyles } from './helpers/render'
import { loadFonts, figmaRGBToHex } from './utilities'

export default function () {

  on<ImportCollateHandler>('IMPORT_COLLATE', async (grid: Matrix.Grid) => {

    const returnVariableCollection = (name: string, create: boolean): VariableCollection => {
      const collections = figma.variables.getLocalVariableCollections()
      let collection = collections.find(item => item.name === name);
      if (!collection && create) {
        collection = figma.variables.createVariableCollection(name)
      }
      return collection!
    }

    const getVariables = (collection: any) => {
      return collection?.variableIds.map((id: string) => {
        return figma.variables.getVariableById(id)
      })
    }

    // const shouldInsertContextualModes = (collection: VariableCollection) => {
    //   return (collection.name === COLLECTION.CONTEXTUAL && !hasDarkLightModes(collection))
    // }

    const makeVariable = (name: string, collection: VariableCollection, type: VariableResolvedDataType) => {
      let variable = getVariables(collection).find((item: { name: string }) => item.name === name);
      if (!variable) variable = figma.variables.createVariable(name, collection.id, type)
      // if (shouldInsertContextualModes(collection)) {
      //     collection.renameMode(collection!.modes[0].modeId, MODE.LIGHT)
      //     collection.addMode(MODE.DARK)
      // }
      return variable
    }

    console.log("I can collate...")
    const localPaintStyles = figma.getLocalPaintStyles();
    const styleNames = localPaintStyles.map((style) => style.name);
    console.log(styleNames)

    const paintStyle = getPaintStyleWithPathName("palette/primary/primary400")[0]
    const name = paintStyle.name
    const paint = (paintStyle.paints[0] as any)
    const description = paintStyle.description

    console.log(paintStyle)
    console.log(name)
    console.log(figmaRGBToHex(paint.color))
    console.log(paint.color)
    console.log(description)

    const collection = returnVariableCollection("palette", true)
    const variable = makeVariable(`${name}`, collection, "COLOR")
    variable.setValueForMode(collection!.defaultModeId, paint.color)
    variable.description = description
    // const colorVariable = figma.variables.createVariable("color-variable", collection.id, "COLOR")

    function getPaintStyleWithPathName(name: string) {
      return figma.getLocalPaintStyles().filter((obj) => {
        return obj.name === name;
      });
    }
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