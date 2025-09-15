import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const MODULE_VIEW_SERVICE = new InjectionToken<ModuleViewService>('MODULE_VIEW_SERVICE');

export interface ModuleViewService {
  isDragging$: BehaviorSubject<boolean>;
}
