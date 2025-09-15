import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, inject } from '@angular/core';
import { ModuleDragService } from './module-drag.service';
import { ModuleDroppableEventObject, ModuleDroppableZone } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { createElementWithRenderer } from '@app/shared/utilities-and-functions/add-classes-with-renderer.function';
import { MODULE_VIEW_SERVICE } from '@app/shared/module-drag-and-drop-resize/module-view.service';

// 1
@Directive({
  selector: '[dpsModuleDroppable]',
  standalone: true,
})

export class ModuleDroppableDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private dragService = inject(ModuleDragService);
  private moduleViewService = inject(MODULE_VIEW_SERVICE);

  //@ts-ignore
  private onDragEnter: CallableFunction;
  //@ts-ignore
  private onDragLeave: CallableFunction;
  //@ts-ignore
  private onDragOver: CallableFunction;
  //@ts-ignore
  private onDrop: CallableFunction;

  public zone: ModuleDroppableZone = {
    zone: 'dpsZone'
  };

  // Allow options input by using [dpsDroppable]='{}'
  @Input('dpsModuleDroppable')
  set dpsDroppable(zone: ModuleDroppableZone) {
    if (zone) {
      this.zone = zone;
    }
  }

  // Drop Event Emitter
  @Output() public dpsOnDroppableComplete = new EventEmitter<ModuleDroppableEventObject>();

  constructor() {
    this.renderer.addClass(this.elementRef.nativeElement, 'dps-droppable');
  }

  ngOnInit(): void {
    /**
     *  @desc Add available zone.
     *  @note This exposes the zone to the service so a draggable element can update
     *  @note The js-dps-droppable classes have to be added to your droppable stylesheets
      */
    this.dragService.addAvailableZone(this.zone.zone, {
      begin: () => {
        if (this.zone.zone === 'delete') {
          this.renderer.addClass(this.elementRef.nativeElement, 'js-dps-droppable--delete--target');
        } else {
          this.renderer.addClass(this.elementRef.nativeElement, 'js-dps-droppable--target');
          this.addDropHereStyleForDragMode();
        }
      },
      end: () => {
        if (this.zone.zone === 'delete') {
          this.renderer.removeClass(this.elementRef.nativeElement, 'js-dps-droppable--delete--target');
        } else {
          this.renderer.removeClass(this.elementRef.nativeElement, 'js-dps-droppable--target');
          this.removeDropHereStyleAfterDragMode();
        }
      }
    });
    this.addOnDragEvents();
  }

  // 5
  ngOnDestroy(): void {
    // Remove zone
    this.dragService.removeAvailableZone(this.zone.zone);

    // Remove events
    this.onDragEnter();
    this.onDragLeave();
    this.onDragOver();
    this.onDrop();
  }

  /**
   * @desc responsible for adding the drag events
   */
  private addOnDragEvents(): void {
    // Drag Enter
    this.onDragEnter = this.renderer.listen(
      this.elementRef.nativeElement, 'dragenter', (event: DragEvent): void => {
        this.handleDragEnter(event);
      });
    // Drag Leave
    this.onDragLeave = this.renderer.listen(
      this.elementRef.nativeElement, 'dragleave', (event: DragEvent): void => {
        this.handleDragLeave(event);
      });
    // Drag Over
    this.onDragOver = this.renderer.listen(
      this.elementRef.nativeElement, 'dragover', (event: DragEvent): void => {
        this.handleDragOver(event);
      });
    // Drag Drop
    this.onDrop = this.renderer.listen(
      this.elementRef.nativeElement, 'drop', (event: DragEvent): void => {
        this.handleDrop(event);
      });
  }

  /**
   * @desc responsible for handling the dragenter event
   * @param event
   */
  // 7
  private handleDragEnter(event: DragEvent): void {
    if (this.dragService.accepts(this.zone.zone)) {
      // Prevent default to allow drop
      event.preventDefault();
      // Add styling
      if (this.zone.zone === 'delete') {
        this.renderer.addClass(event.target, 'js-dps-droppable--delete--zone');
      } else {
        this.renderer.addClass(event.target, 'js-dps-droppable--zone');
      }
    }
  }

  /**
   * @desc responsible for handling the dragleave event
   * @param event
   */
  private handleDragLeave(event: DragEvent): void {
    if (this.dragService.accepts(this.zone.zone)) {
      // Remove styling
      this.renderer.removeClass(event.target, 'js-dps-droppable--zone');
      this.renderer.removeClass(event.target, 'js-dps-droppable--delete--zone');
    }
  }

  /**
   * @desc responsible for handling the dragOver event
   * @param event
   */
  private handleDragOver(event: DragEvent): void {
    if (this.dragService.accepts(this.zone.zone)) {
      // Prevent default to allow drop
      event.preventDefault();
    }
  }

  /**
   * @desc responsible for handling the drop event
   * @note May need to specify further the 'If' statement if other droppables will be used during viewAdjust time
   * @param event
   */
  private handleDrop(event: DragEvent): void {
    // Remove styling
    if (event.dataTransfer!.getData('Text')) {
      this.renderer.removeClass(event.target, 'js-dps-droppable--zone');
      this.renderer.removeClass(event.target, 'js-dps-droppable--delete--zone');
      // Emit successful event
      const data = event.dataTransfer!.getData('Text');
      this.dpsOnDroppableComplete.emit({
        data: {
          rowColumn: parseInt(data)
        },
        zone: this.zone
      });
      this.dragService.endDrag(this.moduleViewService);
    }
  }

  /**
   * @desc Removes the overlay box after DragMode mode ends
   */
  private removeDropHereStyleAfterDragMode(): void {
    if (this.elementRef.nativeElement) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.elementRef.nativeElement.querySelector('.remove-drop-here-area'));
    }
  }

  /**
   * @desc Adds the overlay box when DragMode mode begins, and adds Icon and Text child elements.
   */
  private addDropHereStyleForDragMode(): void {
    const fillBox = createElementWithRenderer(
      this.renderer,
      'div',
      {
        'height': '100%',
        'width': '100%',
        'position': 'absolute',
        'overflow': 'hidden',
        'left': '0',
        'top': '0',
        'z-index': '1004'
      },
      ['remove-drop-here-area', 'flex-center', 'p-4']
    );
    const centerContainerBg = createElementWithRenderer(
      this.renderer,
      'div',
      {'background': 'radial-gradient(rgba(var(--bs-body-bg-rgb),.8) 0%, rgba(var(--bs-body-bg-rgb),.7) 40%, transparent 70%)'},
      ['flex-center']
    );
    const centerContainer = createElementWithRenderer(
      this.renderer,
      'div',
      {},
      ['flex-center', 'flex-wrap', 'my-9', 'mx-9', 'gap-4']
    );
    const centerDrag = createElementWithRenderer(
      this.renderer,
      'i',
      {},
      ['bi', 'bi-box-arrow-in-down', 'icon-7', 'text-dpsgreen']
    );
    const tip = createElementWithRenderer(
      this.renderer,
      'p',
      {},
      ['text-dpsgreen', 'text-center']
    );
    this.renderer.appendChild(tip, this.renderer.createText('Drop Here'));
    this.renderer.appendChild(this.elementRef.nativeElement, fillBox);
    this.renderer.appendChild(fillBox, centerContainerBg);
    this.renderer.appendChild(centerContainerBg, centerContainer);
    this.renderer.appendChild(centerContainer, centerDrag);
    this.renderer.appendChild(centerContainer, tip);
  }
}
