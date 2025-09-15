import { inject, Injectable, Injector } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { delay, filter, map, skip, take, tap } from 'rxjs/operators';
import { ToastService } from '@app/shared/toast/toast.service';

export class ModalClose {
  constructor(
    public modalRef: NgbModalRef,
    public closeResult: any,
    public modalOpenObservables?: Subject<boolean> | BehaviorSubject<boolean>,
    public canClose?: (injector: Injector) => Observable<boolean>
  ) {}
}

export const modalCloseOnBrowserBackBtnGuard = <T>(component: T,
                                                currentRoute: ActivatedRouteSnapshot,
                                                currentState: RouterStateSnapshot,
                                                nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const modalCloseOnBrowserBackBtnGuard = inject(ModalCloseOnBrowserBackBtnGuard);
  //TODO this may not be the same instance for the addBBRGroutes function in each module.
  return modalCloseOnBrowserBackBtnGuard.canDeactivate<T>(component, currentRoute, currentState, nextState);
};

@Injectable({
  providedIn: 'root'
})
export class ModalCloseOnBrowserBackBtnGuard  {
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private injector = inject(Injector);
  private toastService = inject(ToastService);

  private openModals: NgbModalRef[] = [];
  private closeInstructions: ModalClose[] = [];
  private popTo = '';
  private ignoreRouterResettingDueToNavigationCancel = false;

  constructor() {

    this.modalService.activeInstances.subscribe( (result: NgbModalRef[]) => {
      this.openModals = result;
    });

    this.router.events.pipe(
      filter( ev => ev instanceof NavigationStart && ev.navigationTrigger === 'popstate'),
      map( ev => ev as NavigationStart),
    ).subscribe( (event) => {
      this.popTo = event.url;
    });

    this.router.events.pipe(
      filter( ev => ev instanceof NavigationEnd),
      map( ev => ev as NavigationEnd),
    ).subscribe( () => {
      this.popTo = '';
    });
  }

  canDeactivate<T>(component: T,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.ignoreRouterResettingDueToNavigationCancel)
      return false;
    if (this.popTo.length > 0 && this.modalService.hasOpenModals()) {
      let firstCloseInstructionWithCanClose: ModalClose | undefined;
      const hiddenObs: Observable<void>[] = [];
      let error = false;
      this.openModals.reverse().forEach( modal => {
        let instIndex = -1;
        let i = 0;
        for (let inst of this.closeInstructions) {
          if (modal == inst.modalRef) {
            instIndex = i;
          }
          i++;
        }
        if (instIndex < 0) {
          this.toastService.show('Please close the modal before navigating away from the page.', {
            classname: 'bg-danger text-white',
            delay: 8000
          });
          error = true;
        } else {
          if (this.closeInstructions[instIndex].canClose !== undefined && firstCloseInstructionWithCanClose === undefined) {
            firstCloseInstructionWithCanClose = this.closeInstructions[instIndex];
          } else {
            hiddenObs.push(modal.hidden);
            modal.close(this.closeInstructions[instIndex].closeResult);
            this.closeInstructions[instIndex].modalOpenObservables?.next(false);
          }
        }
      });
      if (firstCloseInstructionWithCanClose !== undefined && firstCloseInstructionWithCanClose.canClose !== undefined) {
        this.ignoreRouterResettingDueToNavigationCancel = true;
        let injector = this.injector;
        if (component && Object.hasOwn(component, 'injector'))
          injector = (<{ injector: Injector }><unknown>component).injector;
        return firstCloseInstructionWithCanClose.canClose(injector).pipe(take(1), tap(canClose => {
          //note: give the browser time to reset navigation after navigation cancel
          of(null).pipe(delay(150)).subscribe(() => this.ignoreRouterResettingDueToNavigationCancel = false);
          if (canClose)
            firstCloseInstructionWithCanClose?.modalRef.close(firstCloseInstructionWithCanClose?.closeResult);
        }));
      }
      this.closeInstructions = [];
      if (error) {
        this.popTo = '';
        return false;
      } else {
        return merge(...hiddenObs).pipe(skip(hiddenObs.length - 1), map(() => true));
      }
    } else {
      return true;
    }
  }

  addCloseResult(closeInstruction: ModalClose): void {
    this.closeInstructions.unshift(closeInstruction);
  }

  removeCloseResult(closeInstruction: ModalClose): void {
    let index = this.closeInstructions.indexOf(closeInstruction);
    if (index > -1)
      this.closeInstructions.splice(index, 1);
  }
}
