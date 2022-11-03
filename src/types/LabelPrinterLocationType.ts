export const labelPrinterLocationsList = ['Сигаево', 'Ст. Разина', 'Майская'] as const;

type ElementType < T extends ReadonlyArray < unknown > > = T extends ReadonlyArray<
    infer ElementType
    >
  ? ElementType
  : never

export type LabelPrinterLocationType = ElementType<typeof labelPrinterLocationsList>;