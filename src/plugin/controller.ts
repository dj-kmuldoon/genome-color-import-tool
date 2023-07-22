import { showUI, on } from '@create-figma-plugin/utilities'
import { ImportGenomeHandler } from '../app/types'
import { returnVariableCollection, makeVariable, hexToFigmaColor, insertBlackWhiteNeutrals, zeroPad, COLLECTION, TINT } from './utilities'
import { Matrix } from '../genome/modules/SwatchMatrix';
import { importPaletteColors, importContextualTokens } from './helpers/variables'
const domain = "gnm"

export default function () {
  on<ImportGenomeHandler>('IMPORT_GENOME', async (grid: Matrix.Grid) => {
    const palette = await importPaletteColors(grid)
    await importContextualTokens(palette)
    figma.closePlugin()
  })
  showUI({ height: 300, width: 320 })
}

const _importContextualTokens = (alias: VariableCollection) => {

  const collection = returnVariableCollection(COLLECTION.CONTEXTUAL, true)

  setValuesForModes(collection, alias, "canvas/-", "neutral/000", "neutral/950")
  setValuesForModes(collection, alias, "canvas/p", "neutral/015", "neutral/900")
  setValuesForModes(collection, alias, "canvas/pp", "neutral/025", "neutral/800")

  setValuesForModes(collection, alias, "ink/~/ff", "neutral/950", "neutral/950")
  setValuesForModes(collection, alias, "ink/~/f", "neutral/800", "neutral/000")
  setValuesForModes(collection, alias, "ink/~/-", "neutral/600", "neutral/000")
  setValuesForModes(collection, alias, "ink/~/p", "neutral/400", "neutral/600")
  setValuesForModes(collection, alias, "ink/~/pp", "neutral/200", "neutral/300")
  setValuesForModes(collection, alias, "ink/~/ppp", "neutral/085", "neutral/700")

  setValuesForModes(collection, alias, "ink/inverse/-", "neutral/000", "neutral/950")
  setValuesForModes(collection, alias, "ink/inverse/p", "neutral/025", "neutral/900")
  setValuesForModes(collection, alias, "ink/inverse/pp", "neutral/050", "neutral/800")

  setValuesForModes(collection, alias, "ink/brand/f", "neutral/600", "neutral/100")
  setValuesForModes(collection, alias, "ink/brand/-", "primary/400", "primary/300")
  setValuesForModes(collection, alias, "ink/brand/p", "primary/200", "neutral/700")

  setValuesForModes(collection, alias, "thread/fff", "neutral/950", "neutral/000")
  setValuesForModes(collection, alias, "thread/ff", "neutral/200", "neutral/000")
  setValuesForModes(collection, alias, "thread/f", "neutral/075", "neutral/300")
  setValuesForModes(collection, alias, "thread/-", "neutral/050", "neutral/600")
  setValuesForModes(collection, alias, "thread/p", "neutral/025", "neutral/800")

  setValuesForModes(collection, alias, "paint/primary/f", "primary/600", "primary/600")
  setValuesForModes(collection, alias, "paint/primary/-", "primary/400", "primary/300")
  setValuesForModes(collection, alias, "paint/primary/p", "primary/200", "primary/100")
  setValuesForModes(collection, alias, "paint/primary/pp", "primary/025", "neutral/800")

  setValuesForModes(collection, alias, "paint/danger/f", "negative/600", "negative/600")
  setValuesForModes(collection, alias, "paint/danger/-", "negative/400", "negative/300")
  setValuesForModes(collection, alias, "paint/danger/p", "negative/200", "negative/200")
  setValuesForModes(collection, alias, "paint/danger/pp", "negative/025", "negative/700")
  setValuesForModes(collection, alias, "paint/danger/ppp", "negative/015", "negative/800")

  setValuesForModes(collection, alias, "paint/info/f", "info/600", "info/600")
  setValuesForModes(collection, alias, "paint/info/-", "info/400", "info/300")
  setValuesForModes(collection, alias, "paint/info/p", "info/200", "info/100")
  setValuesForModes(collection, alias, "paint/info/pp", "info/025", "info/700")
  setValuesForModes(collection, alias, "paint/info/ppp", "info/015", "info/800")

  setValuesForModes(collection, alias, "paint/warning/f", "highlight/200", "highlight/100")
  setValuesForModes(collection, alias, "paint/warning/-", "highlight/075", "highlight/085")
  setValuesForModes(collection, alias, "paint/warning/p", "highlight/050", "highlight/085")
  setValuesForModes(collection, alias, "paint/warning/pp", "highlight/025", "highlight/700")
  setValuesForModes(collection, alias, "paint/warning/ppp", "highlight/015", "highlight/800")

  setValuesForModes(collection, alias, "paint/black/-", "neutral/950", "neutral/950")
  setValuesForModes(collection, alias, "paint/black/p", "neutral/800", "neutral/900")
  setValuesForModes(collection, alias, "paint/black/pp", "neutral/600", "neutral/600")
  setValuesForModes(collection, alias, "paint/black/ppp", "neutral/400", "neutral/400")

  setValuesForModes(collection, alias, "paint/white/-", "neutral/000", "neutral/000")
  setValuesForModes(collection, alias, "paint/white/p", "neutral/015", "neutral/015")
  setValuesForModes(collection, alias, "paint/white/pp", "neutral/025", "neutral/025")
  setValuesForModes(collection, alias, "paint/white/ppp", "neutral/050", "neutral/050")

  setValuesForModes(collection, alias, "stamp/light/-", "neutral/000", "neutral/000")
  setValuesForModes(collection, alias, "stamp/light/p", "neutral/050", "neutral/050")
  setValuesForModes(collection, alias, "stamp/light/pp", "neutral/075", "neutral/075")
  setValuesForModes(collection, alias, "stamp/light/ppp", "neutral/100", "neutral/100")

  setValuesForModes(collection, alias, "stamp/dark/f", "neutral/800", "neutral/800")
  setValuesForModes(collection, alias, "stamp/dark/-", "neutral/600", "neutral/600")
  setValuesForModes(collection, alias, "stamp/dark/p", "neutral/400", "neutral/400")
  setValuesForModes(collection, alias, "stamp/dark/pp", "neutral/200", "neutral/200")
  setValuesForModes(collection, alias, "stamp/dark/ppp", "neutral/085", "neutral/085")

  setValuesForModes(collection, alias, "stamp/primary/f", "primary/600", "primary/600")
  setValuesForModes(collection, alias, "stamp/primary/-", "primary/400", "primary/400")
  setValuesForModes(collection, alias, "stamp/primary/p", "primary/200", "primary/200")
  setValuesForModes(collection, alias, "stamp/primary/pp", "primary/025", "neutral/025")
  setValuesForModes(collection, alias, "stamp/primary/ppp", "primary/015", "neutral/015")

  setValuesForModes(collection, alias, "chroma/neutral/active/~", "neutral/800", "neutral/000")
  setValuesForModes(collection, alias, "chroma/neutral/base/~", "neutral/600", "neutral/000")
  setValuesForModes(collection, alias, "chroma/neutral/hover/~", "neutral/400", "neutral/600")
  setValuesForModes(collection, alias, "chroma/neutral/disabled", "neutral/200", "neutral/300")

  setValuesForModes(collection, alias, "chroma/neutral/active", "neutral/800", "neutral/000")
  setValuesForModes(collection, alias, "chroma/neutral/base", "neutral/600", "neutral/000")
  setValuesForModes(collection, alias, "chroma/neutral/hover", "neutral/400", "neutral/600")
  setValuesForModes(collection, alias, "chroma/neutral/disabled", "neutral/200", "neutral/300")
}

const setValuesForModes = (collection: VariableCollection, alias: VariableCollection, name: string, lightMode: string, darkMode: string) => {
  const variable = makeVariable(`${domain}/${name}`, collection, "COLOR")
  variable.setValueForMode(
    collection.modes[0].modeId, // Light Mode
    figma.variables.createVariableAlias(makeVariable(`${domain}/${lightMode}`, alias, "COLOR"))
  )
  variable.setValueForMode(
    collection.modes[1].modeId, // Dark Mode
    figma.variables.createVariableAlias(makeVariable(`${domain}/${darkMode}`, alias, "COLOR"))
  )
}
