import { Injectable, TemplateRef, inject } from '@angular/core';
import { of } from 'rxjs';
import { delay, filter, map, switchMap, take } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Constants } from '@assets/constants/constants';
import { InternalAuditService } from '@app/audit/internal-audit.service';

export class Toast {
  index: any;
  textOrTpl: any;
  classname: any;
  delay: any;
  autohide: any;
  dismiss: any;
  context: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService extends InternalAuditService {
  private router = inject(Router);

  public toasts: Array<Toast> = [];

  constructor() { super('ToastService'); }

  static calculateDelay(textOrTpl: string | TemplateRef<any>): number {
    if (textOrTpl instanceof TemplateRef) {
      return 7000;
    } else {
       return Math.min(Math.max(textOrTpl.length * 75, 4000), 10000);
    }
  }

  private static isAutoHideNotExplicitlyFalse(ah: boolean): boolean {
    return !(!ah && ah !== undefined);
  }

  /**
   * Appends the supplied toast + configuration to the list of toasts to display
   *
   * @param textOrTpl ??
   * @param options ??
   */
  show(textOrTpl: string | TemplateRef<any>, options: any = {}): Toast {
    if (options.delay === undefined) {
      options = {...options, delay: ToastService.calculateDelay(textOrTpl)};
    }
    const i = this.toasts.length > 0 ? this.toasts[this.toasts.length - 1].index + 1 : 0;
    options = {...options, index: i};
    if (this.toasts.length >= 3 && ToastService.isAutoHideNotExplicitlyFalse(this.toasts[0].autohide)) {
      this.toasts.shift();
    }
    if (this.toasts.length >= 3 && ToastService.isAutoHideNotExplicitlyFalse(this.toasts[this.toasts.length - 3].autohide)) {
      this.toasts.splice(this.toasts.length - 3, 1);
    }
    const toast = {textOrTpl, ...options};
    this.toasts.push(toast);
    if (ToastService.isAutoHideNotExplicitlyFalse(toast.autohide)) {
      of([]).pipe(delay(toast.delay)).subscribe(() => this.remove(toast));
    }
    if (toast.dismiss === Constants.DISMISS_ON_NAVIGATE) {
      of(toast).pipe(
        switchMap( toast =>
          this.router.events.pipe(
            filter( ev => ev instanceof NavigationEnd),
            take(1),
            map( () => toast)
          ))
      ).subscribe( toast => this.remove(toast));
    }
    return toast;
  }

  /**
   * removes the given toast from the array.
   *
   * @param toast to remove
   */
  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  /**
   * Shortcut method to display a success toast
   *
   * @param textOrTpl ???
   */
  success(textOrTpl: string | TemplateRef<any>): Toast {
    return this.show(textOrTpl, {
      classname: 'bg-dpsgreen text-white',
      delay: ToastService.calculateDelay(textOrTpl)
    });
  }

  /**
   * Shortcut method to display a danger toast
   *
   * @param textOrTpl ???
   * @param dismiss
   * @param autoHide
   */
  danger(textOrTpl: string | TemplateRef<any>, dismiss: string = '', autoHide: boolean = false): Toast {
    return this.show(textOrTpl, {
      classname: 'bg-danger text-white',
      autohide: autoHide,
      dismiss: dismiss,
    });
  }

  /**
   * Shortcut method to display a primary toast
   *
   * @param textOrTpl ???
   */
  primary(textOrTpl: string | TemplateRef<any>): Toast {
    return this.show(textOrTpl, {
      classname: 'bg-primary text-white',
      delay: ToastService.calculateDelay(textOrTpl)
    });
  }

  /**
   * Shortcut method to display a warning toast
   *
   * @param textOrTpl ???
   */
  warning(textOrTpl: string | TemplateRef<any>): Toast {
    return this.show(textOrTpl, {
      classname: 'bg-warning text-black',
      delay: ToastService.calculateDelay(textOrTpl)
    });
  }

  /**
   * Shortcut method to display a burnt (dark themed) toast
   *
   * @param textOrTpl ???
   * @param delay
   */
  burnt(textOrTpl: string | TemplateRef<any>, delay: number = 0): Toast {
    return this.show(textOrTpl, {
      classname: 'bg-dpsblue-750 text-white',
      delay: delay <= 0 ? ToastService.calculateDelay(textOrTpl) : delay
    });
  }
}
