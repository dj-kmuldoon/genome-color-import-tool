import { Matrix } from '../../genome/modules/SwatchMatrix'
import { hexToRgb } from '../utilities'

const rootName = 'palette' as String;
const swatchWidth = 140;
const swatchHeight = 44;
const localPaintStyles = figma.getLocalPaintStyles();
const styleNames = localPaintStyles.map((style) => style.name);

export const importPaletteColorStyles = async (grid: Matrix.Grid) => {
    if (!paintStyleExists(grid)) {
        populateFigmaColorStyles(grid);
        // createPaintStylesBW();
        createPaintStyleEffects();
        figma.closePlugin()
    } else {
        updateFigmaColorStyles(grid);
        figma.closePlugin()
    }
}

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

function updateSwatchLabel(swatch: Matrix.Swatch) {
    let name = createFrameName(swatch);
    let frameNode = figma.currentPage.findOne((n) => n.name === name) as FrameNode;
    let result = frameNode.children[0] as TextNode;

    let label = swatch.hex.toUpperCase();
    if (swatch.isUserDefined) label = '⭐️ ' + label;
    if (swatch.isPinned) label = '📍 ' + label;

    result.characters = label;
    result.name = result.characters + ' (L*' + swatch.lightness + ')';
    result.fills =
        swatch.WCAG2_W_45 || swatch.WCAG2_W_30
            ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
            : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    result.fontName =
        swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
            ? { family: 'Inter', style: 'Bold' }
            : { family: 'Inter', style: 'Regular' };

    return result;
}

function updateFigmaColorStyles(grid: Matrix.Grid) {
    grid.columns.forEach(function (column) {
        column.rows.forEach(function (swatch) {
            const name = createPaintStyleName(swatch);
            const paintStyle = getPaintStyleWithPathName(name)[0];
            updatePaintStyle(swatch, paintStyle);
            updateSwatchLabel(swatch);
        });
    });
}

function populateFigmaColorStyles(grid: Matrix.Grid) {
    const nodes: any = [];

    let offsetX = swatchWidth / 2;
    let offsetY = 0;

    grid.columns.forEach(function (column, colIdx, colArray) {
        console.log("column semantic ->", column.semantic);
        nodes.push(createSemanticLabel(column, offsetX));

        column.rows.forEach(function (swatch, rowIdx) {
            if (colIdx === 0) {
                nodes.push(createWeightLabel(swatch, offsetNeutralColumn(column, offsetY))); 
            }
            nodes.push(createSwatchFrame(swatch, createPaintStyle(swatch), offsetX, offsetNeutralColumn(column, offsetY)));
            if (colIdx + 1 === colArray.length) {
                nodes.push(createTargetLabel(grid.columns[0].rows[rowIdx], offsetX, offsetY));
            }

            offsetY = offsetY + swatchHeight;
        });

        offsetX = offsetX + swatchWidth;
        offsetY = 0;
    });

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
}

const offsetNeutralColumn = (column:any, offsetY:number) => {
    if (column.semantic != "neutral") return offsetY
    return offsetY - (swatchHeight)
}

function getPaintStyleWithPathName(name: string) {
    return figma.getLocalPaintStyles().filter((obj) => {
        return obj.name === name;
    });
}

function paintStyleExists(grid: Matrix.Grid) {
    let swatch = grid.columns[0].rows[0];
    let painStyleName = createPaintStyleName(swatch);
    return styleNames.includes(painStyleName) ? true : false;
}

function updatePaintStyle(swatch: Matrix.Swatch, style: PaintStyle) {
    const result = style;
    result.description = createPaintStyleDescription(swatch);
    result.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];
    return result;
}

function createPaintStyle(swatch: Matrix.Swatch) {
    const r = figma.createPaintStyle();
    r.name = createPaintStyleName(swatch);
    r.description = createPaintStyleDescription(swatch);
    r.paints = [{ type: 'SOLID', color: hexToRgb(swatch.hex) }];
    return r;
}

function createPaintStylesBW() {
    const k = figma.createPaintStyle();
    k.name = rootName + '/' + 'neutral' + '/' + 'b&w' + '/' + 'black';
    k.paints = [{ type: 'SOLID', color: hexToRgb('#000000') }];

    const w = figma.createPaintStyle();
    w.name = rootName + '/' + 'neutral' + '/' + 'b&w' + '/' + 'white';
    w.paints = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
}

function createPaintStyleEffects() {
    let alphas = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

    alphas.forEach((alpha) => {
        const a = figma.createPaintStyle();
        a.name = rootName + '/' + 'alpha' + '/' + 'black' + '/' + 'black' + zeroPad(alpha, 3);
        a.paints = [{ type: 'SOLID', opacity: alpha / 100, color: hexToRgb('#000000') }];
        a.description = 'black (' + alpha + '% opacity)';
    });

    alphas.forEach((alpha) => {
        const a = figma.createPaintStyle();
        a.name = rootName + '/' + 'alpha' + '/' + 'white' + '/' + 'white' + zeroPad(alpha, 3);
        a.paints = [{ type: 'SOLID', opacity: alpha / 100, color: hexToRgb('#FFFFFF') }];
        a.description = 'white (' + alpha + '% opacity)';
    });
}

function createWeightLabel(swatch: Matrix.Swatch, offsetY: number) {
    const result = figma.createText();
    result.name = 'weight' + '-' + swatch.weight.toString();
    result.characters = swatch.weight.toString();
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    result.fontName = { family: 'Inter', style: 'Bold' };
    result.fontSize = 16;
    result.resize(swatchWidth / 2, swatchHeight);
    result.x = -16;
    result.y = offsetY;

    figma.currentPage.appendChild(result);
    return result;
}

function createTargetLabel(swatch: Matrix.Swatch, offsetX: number, offsetY: number) {
    const result = figma.createText();
    // result.name = 'target-' + swatch.l_target.toString();
    // result.characters = 'L*' + swatch.l_target.toString();
    result.textAlignHorizontal = 'LEFT';
    result.textAlignVertical = 'CENTER';
    result.fontSize = 14;
    result.resize(swatchWidth / 2, swatchHeight);
    result.x = offsetX + swatchWidth + 24;
    result.y = offsetY;
    return result;
}

function createSwatchFrame(swatch: Matrix.Swatch, style: PaintStyle, x: number, y: number) {
    const result = figma.createFrame();
    result.name = createFrameName(swatch);
    result.fillStyleId = style.id;
    result.layoutMode = 'HORIZONTAL';
    result.primaryAxisAlignItems = 'CENTER';
    result.counterAxisAlignItems = 'CENTER';
    result.resize(swatchWidth, swatchHeight);
    result.appendChild(createSwatchLabel(swatch));
    result.x = x;
    result.y = y;
    return result;
}

function createSwatchLabel(swatch: Matrix.Swatch) {
    const result = figma.createText();
    let label = swatch.hex.toUpperCase();
    if (swatch.isUserDefined) label = '⭐️ ' + label;
    if (swatch.isPinned) label = '📍 ' + label;
    result.characters = label;
    result.name = result.characters + ' (L*' + swatch.lightness + ')';
    result.fills =
        swatch.WCAG2_W_45 || swatch.WCAG2_W_30
            ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
            : [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    result.fontName =
        swatch.WCAG2_W_30 && !swatch.WCAG2_W_45
            ? { family: 'Inter', style: 'Bold' }
            : { family: 'Inter', style: 'Regular' };
    result.fontSize = 16;
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    return result;
}

function createSemanticLabel(column: Matrix.Column, offsetX: number) {
    const result = figma.createText();
    result.name = ('semantic' + '-' + column.semantic) as string;
    result.characters = column.semantic as string;
    result.textAlignHorizontal = 'CENTER';
    result.textAlignVertical = 'CENTER';
    result.fontName = { family: 'Inter', style: 'Bold' };
    result.fontSize = 16;
    result.resize(swatchWidth, swatchHeight);
    result.x = offsetX;
    result.y = (column.semantic != "neutral" ? -66 : -110)
    figma.currentPage.appendChild(result);
    return result;
}

function createFrameName(swatch: Matrix.Swatch) {
    return swatch.semantic + swatch.weight.toString();
}

function createPaintStyleDescription(swatch: Matrix.Swatch) {
    let result = [];
    result.push('$' + rootName + '-' + swatch.semantic + '-' + swatch.weight + '\n');
    result.push('\n');
    result.push('hex: : ' + swatch.hex.toUpperCase() + '\n');
    result.push('L*: ' + swatch.lightness + ' (' + swatch.l_target + ')' + '\n');
    result.push('\n');
    result.push('#FFFFFF-4.5:1: ' + swatch.WCAG2_W_45 + '\n');
    result.push('#FFFFFF-3.0:1: ' + swatch.WCAG2_W_30 + '\n');
    result.push('#000000-4.5:1: ' + swatch.WCAG2_K_45 + '\n');
    result.push('#000000-3.0:1: ' + swatch.WCAG2_K_30 + '\n');
    return result.join('');
}

function createPaintStyleName(swatch: Matrix.Swatch) {
    let result = [rootName];
    result.push(swatch.semantic);
    result.push(swatch.semantic + swatch.weight.toString());
    return result.join('/');
}