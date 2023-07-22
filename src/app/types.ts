import { EventHandler } from '@create-figma-plugin/utilities'
import { Matrix } from '../../src/genome/modules/SwatchMatrix';

export interface ImportGenomeHandler extends EventHandler {
  name: 'IMPORT_GENOME'
  handler: (code: Matrix.Grid) => void
}

export interface ImportTokensHandler extends EventHandler {
  name: 'IMPORT_TOKENS'
  handler: (code: string) => void
}

export interface ReportErrorHandler extends EventHandler {
  name: 'REPORT_ERROR'
  handler: (error: string) => void
}

export interface ReportSuccessHandler extends EventHandler {
  name: 'REPORT_SUCCESS'
  handler: (msg: string) => void
}
