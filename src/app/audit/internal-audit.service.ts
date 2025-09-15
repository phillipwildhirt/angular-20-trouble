import { Directive, inject, InjectionToken, isDevMode, OnDestroy } from '@angular/core';
import { now } from 'lodash-es';

export const CREATOR = new InjectionToken<'creator'>('creator');

@Directive()
export abstract class InternalAuditService implements OnDestroy {
  public creator: string = inject(CREATOR);

  protected component = '';
  protected createStamp: number;
  private componentsToLog: string[] = [];
  private componentsToSkip: string[] = [];
  private logSome = this.componentsToLog.length > 0;
  private logAll = this.componentsToSkip.length > 0;

  protected constructor(extender: string) {
    // console.log(this.constructor.name, extender, this.constructor.name === '_'+extender, creator)
    this.component = this.constructor.name ?? ('_' + extender);
    this.createStamp = now();
    this.whoAmI();
  }

  ngOnDestroy(): void {
    // note: remember to call super.ngOnDestroy();
    if (isDevMode() && this.shouldLog()) {
      if (this.creator.length > 0)
        console.log(this.component, 'created at', this.createStamp, 'by', this.creator, 'has been destroyed');
      else
        console.log(this.component, 'created at', this.createStamp, 'has been destroyed');
    }
  }

  whoAmI(): void {
    if (isDevMode() && this.shouldLog()) {
      if (this.creator.length > 0)
        console.log(this.component, 'created at', this.createStamp, 'by', this.creator);
      else
        console.log(this.component, 'created at', this.createStamp);
    }
  }

  private shouldLog(): boolean {
    if (this.logSome)
      return this.componentsToLog.map(v => '_' + v).some(v => v === this.component);
    else if (this.logAll)
      return !this.componentsToSkip.map(v => '_' + v).some(v => v === this.component);
    return false;
  }
}
