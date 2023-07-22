import {
  FileUploadButton,
  FileUploadDropzone,
  Container,
  Text,
  Bold,
  Muted,
  render,
  VerticalSpace, Banner, IconWarning32, Stack, IconCheckCircle32,
  Dropdown, DropdownOption, Button
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { Mapper } from '../src/genome/mapper';
import { Matrix } from '../src/genome/modules/SwatchMatrix';
import { SwatchMapModel } from '../src/genome/models/SwatchMapModel';
import { weightedTargets } from '../src/genome/constants/weightedTargets'

import styles from './styles.css'
import { ImportGenomeHandler, ImportTokensHandler, ReportErrorHandler, ReportSuccessHandler } from './types'

const optimizations: Array<DropdownOption> = [
  {value: '0', text: 'Non-optimized'},
  {value: '1', text: 'Genome'},
  {value: '2', text: 'IBM Carbon'},
  {value: '3', text: 'SalesForce Lightning'},
  {value: '4', text: 'Adobe Spectrum'},
  {value: '5', text: 'Ant'},
  {value: '6', text: 'Material'},
  {value: '7', text: 'Accessible Palette'},
  {value: '8', text: 'ColorBox'},
];

function Plugin() {
  const [errorMsg, setErrorMsg] = useState<string | null>()
  const [successMsg, setSuccessMsg] = useState<string | null>()
  const [selectedOptimization, setSelectedOptimization] = useState<string>('1');
  const [swatches, setSwatches] = useState<Matrix.Grid>();
  const [fileImported, setFileImported] = useState<boolean>(false);

  const handleSelectedOptimization = (event: Event) => {
    let value = (event.target as HTMLInputElement).value
    setSelectedOptimization(value)
  }

  const handleImport = (event: Event) => {
    const optimization = parseInt(selectedOptimization)
    const map = new SwatchMapModel(weightedTargets(optimization))
    let grid = Mapper.mapSwatchesToGrid(swatches, map)
    grid = Mapper.removeUndefinedWeightSwatches(grid);
    emit<ImportGenomeHandler>('IMPORT_GENOME', grid!)
  }

  const handleSelectedFiles = (files: Array<File>) => {
    const reader = new FileReader()
    reader.readAsText(files[0])

    reader.onloadend = () => {
      setFileImported(true)
      setSwatches(Mapper.formatData(reader.result));
      // setSuccessMsg("File uploaded")

      // let swts = Mapper.formatData(reader.result)
      // const optimization = parseInt(selectedOptimization)
      // const map = new SwatchMapModel(weightedTargets(optimization))
      // let grid = Mapper.mapSwatchesToGrid(swts, map)
      // grid = Mapper.removeUndefinedWeightSwatches(grid);
      // emit<ImportGenomeHandler>('IMPORT_GENOME', grid!)

      // if (typeof reader.result === 'string') {
      //   emit<ImportTokensHandler>('IMPORT_TOKENS', reader.result)
      // }
    }
  }

  useEffect(() => {
    on<ReportErrorHandler>('REPORT_ERROR', (errorMsg) => {
      setErrorMsg(errorMsg)
    });

    on<ReportSuccessHandler>('REPORT_SUCCESS', (msg) => {
      setSuccessMsg(msg)
    });
  }, [])

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <Stack space="small">
        {successMsg && <Banner icon={<IconCheckCircle32 />} variant="success">{successMsg}</Banner>}
        {errorMsg && <Banner icon={<IconWarning32 />} variant="warning">{errorMsg}</Banner>}
        <p><b>Select Optimization:</b></p>
        <Dropdown onChange={handleSelectedOptimization} options={optimizations} value={selectedOptimization} variant="border"/>
        <FileUploadDropzone acceptedFileTypes={['application/json']} onSelectedFiles={handleSelectedFiles}>
          <Text align="center">
            <Bold>Drop gcs file here</Bold>
          </Text>
          <VerticalSpace space="small" />
          <Text align="center">
            <Muted>or</Muted>
          </Text>
          <VerticalSpace space="small" />
          <FileUploadButton acceptedFileTypes={['application/json']} onSelectedFiles={handleSelectedFiles}>
            Select gcs file
          </FileUploadButton>
        </FileUploadDropzone>
        <Button disabled={!fileImported} onClick={handleImport}>Import</Button>
      </Stack>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
