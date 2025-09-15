import { Directive, ElementRef, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';

@Directive({
  selector: '[dpsIconFillAnimate]',
  standalone: true,
})
export class IconFillAnimateDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input('dpsIconFillAnimate') itemState$ = new BehaviorSubject<string>('none');
  fromState = 'none';
  dashboardViewService = inject(DashboardViewService);
  press = {color: '#5162A3', fromDelay: '100ms', fromTime: '200ms', toTime: '100ms'};
  hover = {color: '#8B97C5', fromDelay: '0', fromTime: '200ms', toTime: '100ms'};
  active = {color: '#4A5994', fromDelay: '0', fromTime: '200ms'};
  none = {color: '#AAB3D4', fromDelay: '0', fromTime: '100ms'};

  private readonly unsub$ = new Subject<void>();

  ngOnInit(): void {
    this.dashboardViewService.darkMode$.pipe(withLatestFrom(this.itemState$), takeUntil(this.unsub$)).subscribe(([v, state]) => {
      if (v === 'dark' || (v === 'system' && document.body.getAttribute('data-bs-theme') === 'dark')) {
        this.press.color = '#8B97C5';
        this.hover.color = '#AAB3D4';
        this.active.color = '#8B97C5';
        this.none.color = '#4A5994';
      } else {
        this.press.color = '#5162A3';
        this.hover.color = '#8B97C5';
        this.active.color = '#4A5994';
        this.none.color = '#AAB3D4';
      }
      this.changeAnimationElement(state, state);
      this.elementRef.nativeElement.beginElement();
    });
    this.itemState$.pipe(
      takeUntil(this.unsub$),
      distinctUntilChanged((prev: string, curr: string) => {
        if (prev !== curr) {
          this.fromState = prev;
          return false;
        }
        return true;
      }),
      map( (curr: string) => {
        return {fromState: this.fromState, toState: curr};
      }))
      .subscribe( v => {
        this.changeAnimationElement(v.fromState, v.toState);
        this.elementRef.nativeElement.beginElement();
    });
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

  changeAnimationElement(fromState: string, toState: string): void {
    const animateEl = this.elementRef.nativeElement;
    const setFromState = (settings: any) => {
      this.renderer.setAttribute(animateEl, 'from', settings.color);
      this.renderer.setAttribute(animateEl, 'dur', settings.fromTime);
      this.renderer.setAttribute(animateEl, 'begin', settings.fromDelay);
    };
    switch (fromState) {
      case 'press':
        setFromState(this.press);
        break;
      case 'active':
        setFromState(this.active);
        break;
      case 'hover':
        setFromState(this.hover);
        break;
      case 'none':
        setFromState(this.none);
        break;
    }
    switch (toState) {
      case 'press':
        this.renderer.setAttribute(animateEl, 'to', this.press.color);
        this.renderer.setAttribute(animateEl, 'dur', this.press.toTime);
        break;
      case 'active':
        this.renderer.setAttribute(animateEl, 'to', this.active.color);
        break;
      case 'hover':
        this.renderer.setAttribute(animateEl, 'to', this.hover.color);
        if (fromState !== 'press') { this.renderer.setAttribute(animateEl, 'dur', this.hover.toTime); }
        break;
      case 'none':
        this.renderer.setAttribute(animateEl, 'to', this.none.color);
        break;
    }
  }

}
