import { Matrix } from '../modules/SwatchMatrix';
import { SwatchMapModel } from '../models/SwatchMapModel';

export const mapSwatchesToGrid = (grid: Matrix.Grid | undefined, mapper: SwatchMapModel) => {
    if (grid === undefined) return
    
    grid.columns.forEach(function (column) {
        let neutralTargets = column.rows[12].isNeutral;
        let targets = mapper.newTargets(neutralTargets);

        column.rows.forEach(function (row, index) {
            // @ts-ignore: Object is possibly 'null'.
            row.weight = undefined;
            if (targets.includes(row.l_target)) {
                // @ts-ignore: Object is possibly 'null'.
                row.weight = mapper.weights()[index];
            }
        });

        //
        // The pinned may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isPinned === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                // need to test if a .isUserDefined is in the slot!
                let testing = column.rows[index];
                if (testing.isUserDefined == false) {
                    swatch.weight = column.rows[index].weight;
                    // @ts-ignore: Object is possibly 'null'.
                    column.rows[index].weight = undefined;
                }
            }
        });

        //
        // The userDefinedSwatch may not slot neatly into the L*5 matrix. If defined
        // swatch is not present, then insert into matrix, replacing for closest match.
        //
        column.rows.filter((swatch) => {
            if (swatch.isUserDefined === true && swatch.weight === undefined) {
                let index = getClosestIndex(swatch, targets);
                swatch.weight = column.rows[index].weight;
                // @ts-ignore: Object is possibly 'null'.
                column.rows[index].weight = undefined;
            }
        });
    });

    let result = removeUndefinedWeightSwatches(grid)
    
    // @ts-ignore: Object is possibly 'null'.
    result.columns.forEach(function (column) {
        insertBlackWhiteNeutrals(column)
    })

    return result
}

export const formatData = (data: any) => {
    let grid = JSON.parse(data) as Matrix.Grid;
    return grid;
}

const removeUndefinedWeightSwatches = (grid: Matrix.Grid | undefined) => {
    if (grid === undefined) return
    grid.columns.forEach(function (column, index) {
        let weightOptimizedSwatches = column.rows.filter((swatch) => {
            return swatch.weight !== undefined;
        });
        grid.columns[index].rows = weightOptimizedSwatches;
    });

    return grid;
}

const getClosestIndex = (swatch: Matrix.Swatch, targets: Array<any>) => {
    let m = swatch.l_target === 85 ? -2.5 : 0;
    var closest = targets.reduce(function (prev, curr) {
        return Math.abs(curr - (swatch.lightness + m)) < Math.abs(prev - (swatch.lightness + m)) ? curr : prev;
    });
    return targets.indexOf(closest);
}

const insertBlackWhiteNeutrals = (column: any) => {
    if (column.semantic === "neutral") {
        // @ts-ignore
        column.rows.unshift({ 
            semantic: "neutral", 
            weight: "000", 
            hex: "#FFFFFF", 
            LAB: {L: 100, a: 0, b: 0},
            l_target: 100,
            lightness: 100,
            WCAG2_W_30: false,
            WCAG2_W_45: false,
            WCAG2_K_30: true,
            WCAG2_K_45: true,
        });
        // @ts-ignore
        column.rows.push({ 
            semantic: "neutral", 
            weight: "950", 
            hex: "000000", 
            LAB: {L: 0, a: 0, b: 0},
            l_target: 0,
            lightness: 0,
            WCAG2_W_30: true,
            WCAG2_W_45: true,
            WCAG2_K_30: false,
            WCAG2_K_45: false,
        });
    }
}

export * as Mapper from '.';