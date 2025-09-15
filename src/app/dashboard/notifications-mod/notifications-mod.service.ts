import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class NotificationsModService {
  public dashboardModHeaderSearchBarEvent = {
    elementResized$: new Subject<Event | string | undefined>(),
    searchbarHidden$: new BehaviorSubject<{ hideInput: boolean, disableInput: boolean }>({ hideInput: false, disableInput: false }),
    searchPerformed$: new Subject<void>(),
  };
}
