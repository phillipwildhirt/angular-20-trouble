import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';
import { ModuleDragService } from './module-drag.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ModuleDraggableItem } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { DashboardViewService } from '@app/dashboard/dashboard-view.service';
import { addClassesWithRenderer, createElementWithRenderer, setStyleWithRenderer } from '@app/shared/utilities-and-functions/add-classes-with-renderer.function';

@Directive({
  selector: '[dpsModuleDraggable]',
  standalone: true,
})

export class ModuleDraggableDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private dragService = inject(ModuleDragService);

  @Input('dpsModuleDraggable')
  set dpsDraggable(item: ModuleDraggableItem | null) {
    if (item) {
      this.item = item;
    }
  }

  @Input() public isDraggableMode$ = new BehaviorSubject<boolean>(false);

  /**
   * Add in other view service to be nexted for isDragging$: BehaviorSubject<boolean>
   * @private
   */
  @Input() public moduleViewService!: DashboardViewService;

  private onDragStart?: CallableFunction;
  private onDragEnd?: CallableFunction;

  //@ts-ignore
  private item: ModuleDraggableItem;
  private image?: Element | null;
  private readonly unsub$ = new Subject<void>();

  constructor() {
    // 3
    this.renderer.addClass(this.elementRef.nativeElement, 'dps-draggable');
  }

  // 4
  ngOnInit(): void {
    this.isDraggableMode$.pipe(takeUntil(this.unsub$), distinctUntilChanged())
        .subscribe((v: boolean) => v ? this.addDragEvents() : this.removeDragEvents());
  }

  // 5
  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    this.removeDragEvents();
  }

  /**
   * @desc responsible for removing the drag events from the directive
   */
  private removeDragEvents(): void {
    // Remove events
    if (this.onDragStart) {
      if (this.elementRef!.nativeElement.parentNode) {
        this.renderer.setProperty(this.elementRef!.nativeElement, 'draggable', false);
        this.removeDraggableStyleAfterDragMode();
        this.onDragStart();
        if (this.onDragEnd)
          this.onDragEnd();
      }
    }
  }

  /**
   * @desc responsible for adding the drag events to the directive
   * @note transfers drag RowColumn data using the Drag and Drop API (Browser)
   * @note known CSS issue where a draggable element cursor can't be set while dragging in Chrome
   */
  private addDragEvents(): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'draggable', true);
    this.addDraggableStyleForDragMode();
    this.onDragStart = this.renderer.listen(
      this.elementRef.nativeElement, 'dragstart', (event: DragEvent): void => {
        this.dragService.startDrag(this.item.zones, this.moduleViewService);
        this.createDragImage(this.elementRef.nativeElement);
        // Transfer the rowColumn location using Drag and Drop API (Browser)
        event.dataTransfer!.setDragImage(this.image ?? this.elementRef.nativeElement, this.elementRef.nativeElement.getBoundingClientRect().width / 2, this.elementRef.nativeElement.getBoundingClientRect().height / 2);
        event.dataTransfer!.setData('Text', this.item.data.rowColumn.toString());
      });

    this.onDragEnd = this.renderer.listen(
      this.elementRef.nativeElement, 'dragend', (): void => {
        this.dragService.endDrag(this.moduleViewService);
      });
  }

  private createDragImage(el: Element) {
    this.image = el.querySelector('#drag-image-placeholder');
    if (this.image) {
      addClassesWithRenderer(this.renderer, this.image, 'position-absolute overflow-hidden top-0 start-0'.split(' '));
      setStyleWithRenderer(this.renderer, this.image, {
        'min-width': `${ el.getBoundingClientRect().width }px`,
        width: `${ el.getBoundingClientRect().width }px`,
        'max-width': `${ el.getBoundingClientRect().width }px`,
        'min-height': `${ el.getBoundingClientRect().height }px`,
        height: `${ el.getBoundingClientRect().height }px`,
        'max-height': `${ el.getBoundingClientRect().height }px`
      });
    }
  }

  private resetDragImage(el: Element) {
    if (this.image) {
      const replacement = this.renderer.createElement('div');
      this.renderer.setAttribute(replacement, 'id', 'drag-image-placeholder');
      this.renderer.insertBefore(el, replacement, this.image);
      this.renderer.removeChild(el, this.image);
    }
  }

  /**
   * @desc Removes the overlay box after DragMode mode ends
   */
  private removeDraggableStyleAfterDragMode(): void {
    if (this.elementRef.nativeElement && this.elementRef.nativeElement.querySelector('.remove-drag-area')) {
      this.resetDragImage(this.elementRef.nativeElement);
      this.renderer.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement.querySelector('.remove-drag-area'));
    }
  }

  /**
   * @desc Adds the overlay box when DragMode mode begins, and adds Icon and Text child elements.
   */
  private addDraggableStyleForDragMode(): void {
    const fillBox = createElementWithRenderer(
      this.renderer,
      'div',
      {
        'height': '100%',
        'width': '100%',
        'position': 'absolute',
        'left': '0',
        'top': '0',
        'z-index': '1003',
      },
      ['remove-drag-area', 'flex-center']
    );
    const fillBoxStyle = createElementWithRenderer(
      this.renderer,
      'div',
      {
        'height': '100%',
        'width': '100%',
        'opacity': '.5',
        'background-color': 'var(--bs-body-bg)',
        'position': 'absolute',
        'left': '0',
        'top': '0'
      },
      ['border', 'border-primary', 'border-3', 'rounded']
    );
    const centerContainerBg = createElementWithRenderer(
      this.renderer,
      'div',
      {'background': 'radial-gradient(rgba(var(--bs-body-bg-rgb),.9) 0%, rgba(var(--bs-body-bg-rgb),.8) 40%, transparent 70%)'},
      ['flex-center']
    );
    const centerContainer = createElementWithRenderer(
      this.renderer,
      'div',
      {'opacity': '.5'},
      ['flex-center', 'flex-wrap', 'my-7', 'mx-9', 'gap-4']
    );
    const centerDrag = createElementWithRenderer(
      this.renderer,
      'i',
      {},
      ['bi', 'bi-arrows-move', 'icon-7', 'text-primary']
    );
    const tip = createElementWithRenderer(
      this.renderer,
      'p',
      {},
      ['text-primary', 'text-center']
    );
    this.renderer.appendChild(tip, this.renderer.createText('Drag to Rearrange'));
    this.renderer.appendChild(this.elementRef.nativeElement, fillBox);
    this.renderer.appendChild(fillBox, fillBoxStyle);
    this.renderer.appendChild(fillBox, centerContainerBg);
    this.renderer.appendChild(centerContainerBg, centerContainer);
    this.renderer.appendChild(centerContainer, centerDrag);
    this.renderer.appendChild(centerContainer, tip);
  }
}
