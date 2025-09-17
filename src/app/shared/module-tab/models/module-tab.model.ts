import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/';
import { BehaviorSubject, Observable, pairwise, Subject, SubjectLike } from 'rxjs';
import { TabState } from '@app/shared/module-tab/models/tab-state.type';
import { SaveState } from '@app/shared/models/save-state.enum';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

export class ModuleTab<T extends string, K extends string> {
  key: K;
  title: T;
  state: TabState;
  badge: string;
  icon: string;
  subText: boolean;
  dismissible: boolean | 'true' | 'false';
  loading: boolean | 'true' | 'false';
  hasSaveState: boolean | 'true' | 'false';
  readonly saveState$ = new BehaviorSubject<SaveState>(SaveState.none);
  readonly unsub$ = new Subject<void>;
  ignoreClosingMouseClick: boolean;
  tooltipWindowClass: string;
  tooltipPlacementOptions: PlacementArray;
  closeTabEvent: SubjectLike<void>;
  includeShadow: boolean;
  urlRoute?: string;

  /** If you include a saveState$ observable to the constructor, <b>YOU MUST next unsub when you delete or re-set the Module Tab</b> in a map or discard this object.
   * @Example: style.component.ts at setStylePageTabs$() */
  constructor(data: {
                key: K,
                title: T,
                state?: TabState,
                badge?: string,
                icon?: string,
                subText?: boolean,
                dismissible?: boolean | 'true' | 'false',
                loading?: boolean | 'true' | 'false',
                /** If true, YOU MUST next unsub when you delete or re-set the Module Tab in a map or discard this object
                 * See style.component.ts setStylePageTabs$() for an example. */
                hasSaveState?: boolean | 'true' | 'false'
                /** If provided, YOU MUST next unsub when you delete or re-set the Module Tab in a map or discard this object
                 * See style.component.ts setStylePageTabs$() for an example. */
                saveState$?: Observable<SaveState>;
                ignoreClosingMouseClick?: boolean,
                tooltipWindowClass?: string,
                tooltipPlacementOptions?: PlacementArray,
                closeTabEvent?: SubjectLike<void>,
                includeShadow?: boolean,
                urlRoute?: string,
              }
  ) {
    this.key = data.key;
    this.title = data.title;
    this.state = data.state ?? '';
    this.badge = data.badge ?? '';
    this.icon = data.icon ?? '';
    this.subText = data.subText ?? false;
    this.dismissible = data.dismissible ?? false;
    this.loading = data.loading ?? false;
    this.hasSaveState = data.hasSaveState ?? false;
    if (coerceBooleanProperty(this.hasSaveState) && data.saveState$ === undefined)
      this.savedToNoneSub();
    if (data.saveState$) {
      this.savedToNoneSub();
      data.saveState$.pipe(takeUntil(this.unsub$)).subscribe((v) => this.saveState$.next(v));
    }
    this.ignoreClosingMouseClick = data.ignoreClosingMouseClick ?? false;
    this.tooltipWindowClass = data.tooltipWindowClass ?? '';
    this.tooltipPlacementOptions = data.tooltipPlacementOptions ?? 'auto';
    this.closeTabEvent = data.closeTabEvent ?? new Subject<void>();
    this.urlRoute = data.urlRoute;
    this.includeShadow = data.includeShadow ?? true;
  }

  savedToNoneSub(): void {
    this.saveState$.pipe(
      distinctUntilChanged(),
      pairwise(),
      debounceTime(1000),
      takeUntil(this.unsub$)
    ).subscribe(([prev, curr]) => {
      if (prev !== curr && curr === SaveState.saved) this.saveState$.next(SaveState.none);
    });
  }
}
