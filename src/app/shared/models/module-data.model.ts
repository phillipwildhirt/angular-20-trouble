import { ComponentType } from '@angular/cdk/overlay';
import { MessagesModComponent } from '@app/dashboard/messages-mod/messages-mod.component';
import { QueryTaskModComponent } from '@app/dashboard/query-task-mod/query-task-mod.component';
import { NotificationsModComponent } from '@app/dashboard/notifications-mod/notifications-mod.component';
import { BehaviorSubject } from 'rxjs';
import { NotesModComponent } from '@app/dashboard/notes-mod/notes-mod.component';
import { ModulePrefData } from '@app/shared/models/module-pref-data';

export class ModuleData extends ModulePrefData {
  constructor(
    public readonly name: string,
    public readonly id: number,
    public readonly component: ComponentType<MessagesModComponent | QueryTaskModComponent | NotificationsModComponent | NotesModComponent>,
    public rowColumn: number,
    public readonly expanded$: BehaviorSubject<boolean>,
    public readonly collapsed$: BehaviorSubject<boolean>,
    public readonly width$: BehaviorSubject<number>,
    public readonly height$: BehaviorSubject<number>,
    public readonly top$: BehaviorSubject<number>,
    public readonly left$: BehaviorSubject<number>,
    public preferredWidth: number,
    public readonly minWidth: number,
    public preferredHeight: number,
    public readonly minHeight: number,
    readonly preferencesKey: string
  ) { super({name, id, rowColumn, preferredWidth, minWidth, preferredHeight, minHeight, preferencesKey}); }
}
