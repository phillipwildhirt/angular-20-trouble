export class ModulePrefData {
  public name: string;
  public readonly id: number;
  public rowColumn: number;
  public preferredWidth: number;
  public readonly minWidth: number;
  public preferredHeight: number;
  public readonly minHeight: number;
  readonly preferencesKey: string;
  public expanded: boolean;
  public collapsed: boolean;

  constructor(modulePrefData?: any) {
    this.name = modulePrefData?.name ?? undefined;
    this.id = modulePrefData?.id ?? undefined;
    this.rowColumn = modulePrefData?.rowColumn ?? undefined;
    this.preferredWidth = modulePrefData?.preferredWidth ?? undefined;
    this.minWidth = modulePrefData?.minWidth ?? undefined;
    this.preferredHeight = modulePrefData?.preferredHeight ?? undefined;
    this.minHeight = modulePrefData?.minHeight ?? undefined;
    this.preferencesKey = modulePrefData?.preferencesKey ?? undefined;
    this.expanded = modulePrefData?.expanded ?? undefined;
    this.collapsed = modulePrefData?.collapsed ?? undefined;
  }
}
