export type NumericCatalogOption = {
  id: number;
  key: string;
  label: string;
};

export function catalogToSelectOptions(catalog: readonly NumericCatalogOption[]) {
  return catalog.map((item) => ({
    label: item.label,
    value: String(item.id),
  }));
}
