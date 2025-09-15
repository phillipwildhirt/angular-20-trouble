import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject, InjectionToken } from '@angular/core';
import { delay, distinctUntilChanged,  takeUntil, tap } from 'rxjs/operators';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { animate, style, transition, trigger, useAnimation } from '@angular/animations';
import { hideAnimation, showAnimation } from '@app/shared/animations/show-hide.animation';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { MessagesModService } from '@app/dashboard/messages-mod/messages-mod.service';
import { CREATOR } from '@app/audit/internal-audit.service';

export const MOD_SERVICE = new InjectionToken<string>('MOD_SERVICE');

@Component({
  selector: 'dps-messages-mod',
  templateUrl: './messages-mod.component.html',
  styleUrls: ['./messages-mod.component.scss'],
  providers: [
    { provide: MOD_SERVICE, useClass: MessagesModService },
    { provide: CREATOR, useValue: 'MessagesModComponent' }
  ],
  animations: [
    trigger('showHide', [
      transition(':enter', [
        useAnimation(showAnimation, { params: { time: 150 } })
      ]),
      transition(':leave', [
        useAnimation(hideAnimation, { params: { time: 150 } })
      ]),
    ]),
    trigger('animateOnRemove', [
      transition('true => void', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ],
  standalone: false
})
export class MessagesModComponent implements OnInit, OnDestroy {
  dashboardViewService = inject(DashboardViewService);
  messagesModService = inject<MessagesModService>(MOD_SERVICE);
  private cdr = inject(ChangeDetectorRef);

  private readonly unsub$ = new Subject<void>();

  // @ts-ignore
  @Input() module: ModuleDraggableItem;

  width = 0;
  height = 0;
  public collapsed = false;
  public viewAdjust$ = new BehaviorSubject<boolean>(false);
  public dataLoading$ = new BehaviorSubject<boolean>(true);

  ngOnInit(): void {
    this.dashboardViewService.messagesDraggable.data.collapsed$.pipe(distinctUntilChanged(), takeUntil(this.unsub$)).subscribe( (v: boolean) => {
      this.collapsed = v;
    });
    this.dashboardViewService.viewAdjust$.pipe(
      takeUntil(this.unsub$),
      distinctUntilChanged(),
      tap( v => {
        this.onViewAdjust(v);
      }),
      delay(10)
    ).subscribe( v => v ? this.cdr.detach() : this.cdr.reattach());

    this.dataLoading$.next(false);

  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  public onExpandCollapse(): void {
    if (this.collapsed) {
      this.dashboardViewService.onExpand(this.module.data.name);
    }
  }

  private onViewAdjust(v: boolean): void {
    this.viewAdjust$.next(v);
  }
}
