import { Action } from '@app/shared/models/action.model';
import { SubMenu } from '@app/shared/models/sub-menu.model';

export class MenuGroup {

  constructor(
    public id: number,
    public name: string,
    public type: string,
    public alias: string,
    public actions: Action[],
    public subMenus: SubMenu[]) {
  }
}
