import { Component, TemplateRef, inject } from '@angular/core';
import { Toast, ToastService } from '@app/shared/toast/toast.service';
import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { NgTemplateOutlet } from '@angular/common';
import { CREATOR } from '@app/audit/internal-audit.service';

/**
 * https://ng-bootstrap.github.io/#/components/toast/examples#howto-global
 */
@Component({
  selector: 'dps-toast',
  template: `
    <div id="toastParent" [@toastEnter]="toastService.toasts.length > 0 ? toastService.toasts[toastService.toasts.length - 1].index : -1" class="text-end">
      @if (toastService.toasts.length > 1) {
        <button class="btn btn-sm btn-outline-secondary border-0" (click)="closeAll()">Dismiss All<i class="ms-2 bi-x fs-5 mb-n2"></i></button>
      }
      @for (toast of toastService.toasts; track trackByFunc($index, toast)) {
        <ngb-toast #toastRef
                   [class]="toast.classname + ' mb-1'"
                   [autohide]="false"
                   [@toastLeave]="toastService.toasts.length">
          <div class="flex-between">
            @if (isTemplate(toast)) {
              <ng-template [ngTemplateOutlet]="toast.textOrTpl" [ngTemplateOutletContext]="toast.context"/>
            } @else {
              {{ toast.textOrTpl }}
            }
            <button type="button" class="btn-close btn-close-white ms-2" (click)="close(toast)"></button>
          </div>
        </ngb-toast>
      }
    </div>
  `,
  styles: [
    ':host {position: fixed; bottom: 0; right: 0; margin: 0.5em; z-index: 1200;}',
    'ngb-toast {max-width: 200em !important; position: relative}'
  ],
  animations: [
    trigger('toastEnter', [
      transition(':increment', [
        group([
          query(':enter', [
            style({ opacity: 0, marginTop: '-100px', transform: 'translateY(100px)' }),
            animate('400ms ease-out', style({ opacity: 1, marginTop: '0', transform: 'translateY(0)' }))
          ], { optional: true }),
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }),
            animate('600ms ease-out', style({ opacity: 0, transform: 'translateX(100px)' }))
          ], { optional: true }),
          animateChild()
        ])
      ])
    ]),
    trigger('toastLeave', [
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('600ms ease-out', style({ opacity: 0, transform: 'translateX(100px)' }))
      ]),
    ]),
  ],
  imports: [
    NgbToast,
    NgTemplateOutlet
  ],
  providers: [{ provide: CREATOR, useValue: 'ToastComponent' }]
})
export class ToastComponent {
  toastService = inject(ToastService);


  isTemplate(toast: any): boolean {
    return toast.textOrTpl instanceof TemplateRef;
  }

  close(toast: Toast): void {
    this.toastService.remove(toast);
  }

  closeAll(): void {
    for (const toast of this.toastService.toasts) {
      this.toastService.remove(toast);
    }
  }

  trackByFunc(index: number, toast: Toast): number {
    return toast.index;
  }
}
