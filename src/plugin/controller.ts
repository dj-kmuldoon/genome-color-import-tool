import { showUI, on } from '@create-figma-plugin/utilities'
import { ImportGenomeHandler } from '../app/types'
import { Matrix } from '../genome/modules/SwatchMatrix';
import { importPaletteColors, importContextualTokens } from './helpers/variables'
import { importPaletteColorStyles } from './helpers/render'
import { loadFonts } from './utilities'

export default function () {
  on<ImportGenomeHandler>('IMPORT_GENOME', async (grid: Matrix.Grid) => {
    await loadFonts()
    const palette = await importPaletteColors(grid)
    await importContextualTokens(palette)
    await importPaletteColorStyles(grid)
    figma.closePlugin()
  })
  showUI({ height: 300, width: 320 })
}