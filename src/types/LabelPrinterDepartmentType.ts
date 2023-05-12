export const labelPrinterDepartmentsList = [
  'Допечатная подготовка',
  'Участок печати',
  'Участок наградки',
  'Раскрой',
  'Швейный цех',
  'Термонож',
  'Упаковка',
  'Склад',
  'Вышивка',
  'Цех металлоконструкций',
  'Офис'
] as const;

type ElementType < T extends ReadonlyArray < unknown > > = T extends ReadonlyArray<
    infer ElementType
    >
  ? ElementType
  : never

export type LabelPrinterDepartmentType = ElementType<typeof labelPrinterDepartmentsList>