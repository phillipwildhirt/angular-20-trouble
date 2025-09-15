import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { isEmpty } from 'lodash-es';

@Directive({
  selector: '[dpsClickOutEvent]',
  standalone: true,
})

/**
 * A directive for listening to all window clicks and emitting an event if the mouse clicks inside
   or outside of the element the directive is applied to.
 * @example Use on an HTML element as:
 * ```html
 * <div dpsClickOutEvent (clickOutEvent)="onClickOut()" (clickInEvent)="onClickIn()">
 *   <div>Any various amounts of children</div>
 * </div>
 * ```
 * where ``onClickOut()``/``onClickIn()`` are a methods called when the respective event occurs.
 *
 * It is recommended to filter these events that are being listened to so as not to cause excessive
   resource usage on every click. For example, put an if statement (``modal.isOpen()``).
 */
export class ClickOutEventDirective {
  private el = inject(ElementRef);


  /**
   * optional list of element ids to ignore on click event
   *@Optional
   */
  @Input() elementIdsToIgnoreClick: string[] = [];

  /**
   * This Output will emit on a mousedown OUTSIDE the element where the directive is applied, but
     not on a click inside the element or any children.
   * @returns EventEmitter<void>
   */
  @Output() clickOutEvent = new EventEmitter<void>();

  /**
   * This Output will emit on a mousedown INSIDE the element and any of its children where the directive is applied, but
     not on a click outside the element.
   * @returns EventEmitter<void>
   */
  @Output() clickInEvent = new EventEmitter<void>();
  @HostListener('window:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    let targetIdsFound: number = 0;
    this.elementIdsToIgnoreClick.forEach(id => {
      let parentElementFound = (event.target as HTMLElement)?.closest(`#${id}`);
      if (parentElementFound) targetIdsFound++;
    });
    if ((this.el.nativeElement !== event.target && !this.el.nativeElement.contains(event.target)) && (isEmpty(this.elementIdsToIgnoreClick) || targetIdsFound === 0)) {
        this.clickOutEvent.next();
    } else {
      this.clickInEvent.next();
    }
  }
}
