import { ActionStyling } from '@app/admin/menus/models/menu.model';

export class Action {
  public actionId: number;
  public actionUrl: string;
  public actionName: string;
  public actionAlias: string;
  public active: 'Y' | 'N';
  public styling: null | string;
  public actionStyling: ActionStyling;
  public updateSt: string;
  public updateUser: string;
  public tooltip: string;
  public roles: string[];
  public seq: number;
  public locale: string;


  constructor(data: any) {
    this.actionId = data.actionId ?? 0;
    this.actionUrl = data.actionUrl ?? '';
    this.actionName = data.actionName ?? '';
    this.actionAlias = data.actionAlias ?? '';
    this.active = data.active ?? 'N';
    this.styling = data.styling ?? null;
    this.updateSt = data.updateSt ?? '';
    this.updateUser = data.updateUser ?? '';
    this.tooltip = data.tooltip ?? '';
    this.roles = data.roles ?? [];
    this.seq = data.seq ?? '';
    this.locale = data.locale ?? '';

    this.actionStyling = this.styling ? JSON.parse(this.styling) : new ActionStyling(null, null);
  }
}
