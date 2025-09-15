import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

export class MenuAssociation {
  constructor(
    public id: bigint,
    public subMenuId: bigint | null,
    public actionId: bigint | null,
    public sequence: number
  ) {}
}

export class Menu {
  public get name(): string {
      return this._name;
  }
  public set name(value: string) {
      this._name = value;
  }

  public get id(): number {
    return Number(this._id);
  }

  public set id(value: number) {
    this._id = BigInt(value);
  }

  public get type(): string {
    return this._type;
  }

  public set type(value: string) {
    this._type = value;
  }
  public get alias(): null | string {
    return this._alias;
  }
  public set alias(value: null | string) {
    this._alias = value;
  }

  constructor(
    private _id: bigint | null,
    private _name: string,
    private _type: string,
    private _alias: null | string
  ) {

  }
}

export class EditMenuForms {
  constructor(
    public renameForm: FormGroup<{oldName: FormControl<string>, rename: FormControl<string>, oldAlias?: FormControl<string | null>, alias?: FormControl<string | null>}> | undefined,
    public contextForm: FormControl<boolean> | undefined,
    public moduleForm: FormControl<boolean> | undefined,
    public authorizationForm: FormControl<boolean> | undefined,
    public renameUnsub$: Subject<void>,
    public contextUnsub$: Subject<void>,
    public moduleUnsub$: Subject<void>,
    public authorizationUnsub$: Subject<void>
  ) {}
}

export class MenuEditable extends Menu {
  constructor(
    public menu: Menu,
    // index here is the sequence order (not id)
    public subMenus: Map<number, number> | undefined,
    // index here is the sequence order (not id)
    public action: Map<number, number> | undefined,
    public edit: EditState,
    public rename: EditState,
    public forms: EditMenuForms | undefined
  ) {
    super(BigInt(menu.id), menu.name, menu.type, menu.alias);
  }
  get id(): number {
    return Number(this.menu.id);
  }
  get name(): string {
    return this.menu.name;
  }
  get type(): string {
    return this.menu.type;
  }
  get alias(): null | string {
    return this.menu.alias;
  }
}


export class MenuAction {
  public get styling(): null | ActionStyling {
      return this._styling;
  }
  public set styling(value: null | ActionStyling) {
      this._styling = value;
  }

  public get active(): 'Y' | 'N' {
    return this._active;
  }

  public set active(value: 'Y' | 'N') {
    this._active = value;
  }

  public get roles(): string[] | null {
    return this._roles;
  }

  public set roles(value: string[] | null) {
    this._roles = value;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get url(): string {
    return this._url;
  }

  public set url(value: string) {
    this._url = value;
  }

  public get id(): number {
    return Number(this._id);
  }

  public set id(value: number) {
    this._id = BigInt(value);
  }

  public get tooltip(): null | string {
    return this._tooltip;
  }

  public set tooltip(value: null | string) {
    this._tooltip = value;
  }

  public get alias(): null | string {
    return this._alias;
  }
  public set alias(value: null | string) {
    this._alias = value;
  }

  public get locale(): string {
    return this._locale;
  }
  public set locale(value: string) {
    this._locale = value;
  }

  constructor(
    private _id: bigint,
    private _url: string,
    private _name: string,
    private _active: 'Y' | 'N',
    private _roles: string[] | null,
    private _styling: null | ActionStyling,
    private _tooltip: null | string,
    private _alias: null | string,
    private _locale: string | ''
  ) {}
}

export enum EditState {
  saved,
  failed,
  saving,
  false,
  true,
  trueChanges
}

export class MenuActionEditable extends MenuAction {
  constructor(
    public menuAction: MenuAction,
    public rename: EditState,
    public forms: EditMenuForms | undefined) {
    super(BigInt(menuAction.id), menuAction.url, menuAction.name, menuAction.active, menuAction.roles, menuAction.styling, menuAction.tooltip, menuAction.alias, menuAction.locale);
  }
  get id(): number {
    return Number(this.menuAction.id);
  }
  get url(): string {
    return this.menuAction.url;
  }
  get name(): string {
      return this.menuAction.name;
  }
  get active(): 'Y' | 'N' {
        return this.menuAction.active;
  }
  get roles(): null | string[] {
    return this.menuAction.roles;
  }
  get styling(): null | ActionStyling {
          return this.menuAction.styling;
  }
  get tooltip(): null | string {
    return this.menuAction.tooltip;
  }
  get alias(): null | string {
    return this.menuAction.alias;
  }
  get locale(): string {
    return this.menuAction.locale;
  }
}

export class ActionStyling {
  constructor(
    public classes: string | null,
    public inlineStyle: string | null,
  ) {}
}


