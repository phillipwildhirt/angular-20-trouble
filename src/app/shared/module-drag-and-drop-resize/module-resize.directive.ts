import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, inject } from '@angular/core';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ModuleResizeEvent } from '@app/shared/module-drag-and-drop-resize/module-resize-event.model';


@Directive({
  selector: '[dpsModuleResize]',
  standalone: true,
})
export class ModuleResizeDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input('dpsModuleResize')
  set dpsResizeable(item: ModuleDraggableItem | null) {
    if (item) {
      this.item = item;
    }
  }

  @Input() isResizeMode$ = new BehaviorSubject<boolean>(false);
  @Input() axis: string = '';
  @Input() disabled: boolean = false;
  @Output() dpsOnResize = new EventEmitter<ModuleResizeEvent>();

  //@ts-ignore
  private onResizeStart: CallableFunction;
  // @ts-ignore
  private onResizeEnd: CallableFunction;
  // @ts-ignore
  private onResizeDrop: CallableFunction;
  // @ts-ignore
  private onDragOver: CallableFunction;

  //@ts-ignore
  private item: ModuleDraggableItem;
  private initialValue: [number, number] = [0, 0];

  private readonly unsub$ = new Subject<void>();

  constructor() {
    this.renderer.addClass(this.elementRef.nativeElement, 'dps-resizeable');
  }

  ngOnInit(): void {
    /**
     * @desc Add or Remove Events based on resizeMode
     */
    this.isResizeMode$.pipe(takeUntil(this.unsub$), distinctUntilChanged())
      .subscribe((v: boolean) => v ? this.addResizeEvents() : this.removeResizeEvents());
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    this.removeResizeEvents();
  }

  private removeResizeEvents(): void {
    // Remove events
    this.removeStyleAfterResizeMode();
    if (this.onResizeStart) {
      if (this.elementRef!.nativeElement) {
        this.renderer.setProperty(this.elementRef!.nativeElement, 'draggable', false);
        this.onResizeStart();
        this.onResizeEnd();
        this.onResizeDrop();
      }
    }
  }

  private addResizeEvents(): void {
    this.addStyleForResizeMode();
    if (!this.disabled) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'draggable', true);
      this.onResizeStart = this.renderer.listen(
        this.elementRef.nativeElement, 'dragstart', (event: DragEvent): void => {
          const resizeEl = this.elementRef.nativeElement;
          this.renderer.setStyle(resizeEl, 'background-color', 'var(--bs-body-bg)');
          this.renderer.addClass(resizeEl, 'border');
          this.renderer.addClass(resizeEl, 'border-primary');
          this.renderer.addClass(resizeEl, 'border-3');
          this.initialValue = [event.x, event.y];
        });

      this.onResizeEnd = this.renderer.listen(
        this.elementRef.nativeElement, 'dragend', (event: DragEvent): void => {
          const initial = this.axis === 'x' ? this.item.data.width$.value : this.item.data.height$.value;
          const final = this.axis === 'x' ? event.x - this.initialValue[0] : event.y - this.initialValue[1];
          const row = Math.floor(this.item.data.rowColumn / 10);
          const resizeEl = this.elementRef.nativeElement;
          this.renderer.removeStyle(resizeEl, 'background-color');
          this.renderer.removeClass(resizeEl, 'border');
          this.renderer.removeClass(resizeEl, 'border-primary');
          this.renderer.removeClass(resizeEl, 'border-3');
          this.dpsOnResize.next(new ModuleResizeEvent(this.axis, initial, final, row));
        });
      this.onResizeDrop = this.renderer.listen(
        this.elementRef.nativeElement.parentElement.parentElement, 'dragover', (event: DragEvent): void => {
          event.preventDefault();
        });
    }
  }
  /**
   * @desc Removes the styles and child elements from the Resize Area after the ResizeMode ends.
   */
  private removeStyleAfterResizeMode(): void {
    if (this.elementRef.nativeElement) {
      const resizeEl = this.elementRef.nativeElement;
      for (const child of this.elementRef.nativeElement.children) {
        this.renderer.removeChild(this.elementRef.nativeElement, child);
      }
      this.renderer.removeStyle(resizeEl, 'height');
      this.renderer.removeStyle(resizeEl, 'width');
      this.renderer.removeStyle(resizeEl, 'max-width');
      this.renderer.removeStyle(resizeEl, 'opacity');
      this.renderer.removeStyle(resizeEl, 'position');
      this.renderer.removeStyle(resizeEl, 'left');
      this.renderer.removeStyle(resizeEl, 'top');
      this.renderer.removeClass(resizeEl, 'flex-center');
      this.renderer.removeClass(resizeEl, this.axis === 'x' ? 'flex-column' : 'flex-row');
      this.renderer.removeClass(resizeEl, 'align-items-center');
      this.renderer.removeStyle(resizeEl, 'z-index');
      this.renderer.removeClass(resizeEl, 'rounded');
    }
  }
  /**
   * @desc Adds the Resize Area Styles when ResizeMode mode begins, and adds Icon and Text child elements.
   */
  private addStyleForResizeMode(): void {
    const resizeEl = this.elementRef.nativeElement;
    this.renderer.setStyle(resizeEl, 'height', this.axis === 'x' ? '100%' : '20px');
    this.renderer.setStyle(resizeEl, 'width', this.axis === 'x' ? '20px' : '100%');
    this.renderer.setStyle(resizeEl, 'max-width', this.axis === 'x' ? '20px' : '100%');
    this.renderer.setStyle(resizeEl, 'opacity', this.disabled ? '.35' : '.5');
    this.renderer.setStyle(resizeEl, 'position', 'absolute');
    this.renderer.setStyle(resizeEl, 'left', this.axis === 'x' ? 'calc(100% + 2px)' : '0');
    this.renderer.setStyle(resizeEl, 'top', this.axis === 'x' ? '0' : 'calc(100% + 2px)');
    this.renderer.addClass(resizeEl, 'flex-center');
    this.renderer.addClass(resizeEl, this.axis === 'x' ? 'flex-column' : 'flex-row');
    this.renderer.addClass(resizeEl, 'align-items-center');
    this.renderer.setStyle(resizeEl, 'z-index', '1');
    this.renderer.addClass(resizeEl, 'rounded');
    const centerDrag = this.renderer.createElement('i');
    this.renderer.addClass(centerDrag, 'bi');
    this.renderer.addClass(centerDrag, 'bi-arrows-expand');
    this.renderer.addClass(centerDrag, 'text-primary');
    this.renderer.setStyle(centerDrag, 'font-size', '1.25rem');
    this.renderer.setStyle(centerDrag, 'transform', this.axis === 'x' ? 'rotate(90deg)' : '');
    const text = this.renderer.createElement('p');
    this.renderer.setStyle(text, 'transform', this.axis === 'x' ? 'rotate(90deg)' : '');
    this.renderer.addClass(text, 'text-primary');
    this.renderer.addClass(text, 'text-nowrap');
    this.renderer.addClass(text, this.axis === 'x' ? 'mt-8' : 'ms-4');
    this.renderer.appendChild(text, this.renderer.createText(this.disabled ? 'Not Resizeable' : 'Drag to Resize'));
    if (!this.disabled) {
      this.renderer.appendChild(resizeEl, centerDrag);
    } else {
      this.renderer.setStyle(resizeEl, 'pointer-events', 'none');
    }
    this.renderer.appendChild(resizeEl, text);
  }

}
