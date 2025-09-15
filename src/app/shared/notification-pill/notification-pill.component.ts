import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export class NotificationPill {
  constructor(public styleTag: string,
              public size: string,
              public value: string,
              public tooltip?: TemplateRef<any> | string) {}
}

@Component({
  selector: 'dps-notification-pill',
  template: `
    @if ((dataLoading$ | async) === false) {
    <div class="d-inline-block" [class]="size === 'sm' ? 'neg-top-sm' : 'neg-top-lg'">
      <div class="badge rounded-pill" [ngClass]="style + (++value > maxValue ? ' overflow-spacing' : '')">
        @if (++value > maxValue) {
          <span class="plus">+</span>
        }{{ ++value > maxValue ? maxValue : value }}
      </div>
    </div>
    }
  `,
  styleUrls: ['notification-pill.component.scss'],
  imports: [
    NgClass,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationPillComponent implements OnInit {
  /**
   * @desc styleTag is the bootstrap color for the background of the notification
   * @param string
   */
  @Input() public styleTag: string = 'primary';

  /**
   * @desc size can be either 'lg' for headings and tabs, or 'sm'
   * @param string
   */
  @Input() public size: string = 'lg';

  /**
   * @desc value is the text/number displayed in the search pill
   */
  @Input() public value: string = '1';

  /**
   * maxValue is the maximum number displayed in the search pill,
     the format will convert to +999 if the value is above this maxValue
   */
  @Input() public maxValue: number = 999;

  @Input() dataLoading$ = new BehaviorSubject<boolean>(false);

  public style = '';

  constructor() { }

  ngOnInit(): void {
    switch (this.styleTag) {
      case 'primary':
        this.style = 'bg-primary';
        break;
      case 'secondary':
        this.style = 'bg-secondary';
        break;
      case 'success':
        this.style = 'bg-success';
        break;
      case 'danger':
        this.style = 'bg-danger';
        break;
      case 'warning':
        this.style = 'bg-warning text-dark';
        break;
      case 'info':
        this.style = 'bg-info text-dark';
        break;
      case 'light':
        this.style = 'bg-light text-dark';
        break;
      case 'dark':
        this.style = 'bg-dark text-white';
        break;
      case 'dpsgreen':
        this.style = 'bg-dpsgreen';
        break;
      case 'dpsblue':
        this.style = 'bg-dpsblue';
        break;
      case 'ebizteal':
        this.style = 'bg-ebizteal';
        break;
      case 'gray-500':
        this.style = 'bg-gray-500';
        break;
      default:
        this.style = 'bg-primary';
    }
    switch (this.size) {
      case 'lg':
        this.style += '';
        break;
      case 'sm':
          this.style += ' badge-sm';
        break;
    }
  }

}
