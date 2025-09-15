import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, filter, merge, Subject, timer } from 'rxjs';
import { debounce, takeUntil } from 'rxjs/operators';
import { MessagesModService } from '@app/dashboard/messages-mod/messages-mod.service';
import { NotificationsModService } from '@app/dashboard/notifications-mod/notifications-mod.service';
import { isNonNull } from '@app/shared/utilities-and-functions/is-non-null.function';
import { MOD_SERVICE } from '@app/dashboard/messages-mod/messages-mod.component';

export const MessagingSearchBarIdsConstants = {
  TOTAL_SEARCHBAR_CONTAINER: 'messaging-total-searchbar-container',
  SEARCHBAR_RENDER_CONTAINER: 'messaging-searchbar-render-container',
  SEARCHBAR_AND_PILLS_FLEX: 'messaging-searchbar-and-pills-flex',
  SEARCHBAR: 'messaging-searchbar',
  PILLS_PREFIX: 'messaging-pills',
};

@Directive({
  selector: '[dpsHideDashboardMessagingSearchBar]',
})
export class DpsHideDashboardMessagingSearchBarDirective implements AfterViewInit, OnDestroy {
  private element = inject(ElementRef);
  private modService = inject<MessagesModService | NotificationsModService>(MOD_SERVICE);

  @Input() public parentElementRef: HTMLElement | undefined;
  @Input() public isMessages: boolean = true;

  private readonly unsub$ = new Subject<void>();

  ngAfterViewInit(): void {
    merge(
      this.modService.dashboardModHeaderSearchBarEvent.elementResized$.pipe(filter(v => v !== undefined)),
      this.modService.dashboardModHeaderSearchBarEvent.searchPerformed$
    ).pipe(
      debounce((e) => typeof e === 'string' ? timer(1) : timer(50)),
      takeUntil( this.unsub$ )
    ).subscribe( () => this.toggleHideShowElement());
  }

  ngOnDestroy() {
    this.unsub$.next();
    this.unsub$.complete();
  }

  toggleHideShowElement() {
    if (isNonNull(this.parentElementRef) && isNonNull(this.element.nativeElement)) {
      const unwrappedMargin = 12;
      const searchBarMinWidth = 270;
      const extraSpaceMinWidth = 125;
      const searchAndPillTotalArea: Element | null = this.element.nativeElement.querySelector('#' + MessagingSearchBarIdsConstants.TOTAL_SEARCHBAR_CONTAINER);
      const searchAndPillTotalAreaWidth = searchAndPillTotalArea?.clientWidth ?? 0;
      const searchAndPillContainer: Element | null = this.element.nativeElement.querySelector('#' + MessagingSearchBarIdsConstants.SEARCHBAR_AND_PILLS_FLEX);
      const searchBar: Element | null = this.element.nativeElement.querySelector('#' + MessagingSearchBarIdsConstants.SEARCHBAR);
      const searchBarWidth = searchBar?.clientWidth ?? 0;
      const lastSearchBoxOrPill: Element | null = searchAndPillContainer?.lastElementChild ?? null; // could be search box
      const firstSearchBoxOrPill: Element | null = searchAndPillContainer?.firstElementChild ?? null; // could be search box
      const isWrapped = lastSearchBoxOrPill && firstSearchBoxOrPill && lastSearchBoxOrPill !== firstSearchBoxOrPill
                                  ? Math.abs(lastSearchBoxOrPill.getBoundingClientRect().top - firstSearchBoxOrPill.getBoundingClientRect().top) > 24
                                  : false;
      const firstPill: Element | null = searchAndPillContainer ? Array.from(searchAndPillContainer?.children).filter(child => child.id.startsWith(MessagingSearchBarIdsConstants.PILLS_PREFIX))[0] : null; // could be same as lastPill
      const isPillsWrapped = lastSearchBoxOrPill && lastSearchBoxOrPill.id.startsWith(MessagingSearchBarIdsConstants.PILLS_PREFIX)
                                          && firstPill && firstPill !== lastSearchBoxOrPill
                                          && Math.abs(firstPill.getBoundingClientRect().top - lastSearchBoxOrPill.getBoundingClientRect().top) > 16;
      let searchPillsWidth = searchAndPillContainer && lastSearchBoxOrPill && lastSearchBoxOrPill.id.startsWith(MessagingSearchBarIdsConstants.PILLS_PREFIX)
                             ? lastSearchBoxOrPill.getBoundingClientRect().right - (searchBar && !isWrapped
                               ? searchBar.getBoundingClientRect().right
                               : searchAndPillContainer.getBoundingClientRect().left)
                             : 0;

      const searchBarAndPillsTooBig = searchBarWidth + searchPillsWidth + (!isWrapped ? 0 : unwrappedMargin) > searchAndPillTotalAreaWidth || isPillsWrapped || searchBarWidth === searchAndPillTotalAreaWidth - unwrappedMargin;
      const searchBarAndPillsOkayButNoExtraSpace =  searchBarWidth + searchPillsWidth + (!isWrapped ? 0 : unwrappedMargin) + extraSpaceMinWidth > searchAndPillTotalAreaWidth || isPillsWrapped;
      const roomForSearchBarAndPillsAndMore = searchBarMinWidth + searchPillsWidth + unwrappedMargin + extraSpaceMinWidth <= searchAndPillTotalAreaWidth && !isPillsWrapped;
      const onlyEnoughRoomForSearchBarAndPills = searchBarMinWidth + searchPillsWidth + unwrappedMargin <= searchAndPillTotalAreaWidth && !isPillsWrapped && searchBarMinWidth !== searchAndPillTotalAreaWidth - unwrappedMargin;


      if (searchBar)
       if (searchBarAndPillsTooBig)
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({ hideInput: true, disableInput: true });
        else if (searchBarAndPillsOkayButNoExtraSpace)
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({ hideInput: false, disableInput: true });
        else
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({ hideInput: false, disableInput: false });
      else
        if (roomForSearchBarAndPillsAndMore)
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({hideInput: false, disableInput: false});
        else if (onlyEnoughRoomForSearchBarAndPills)
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({hideInput: false, disableInput: true});
        else
          this.modService.dashboardModHeaderSearchBarEvent.searchbarHidden$.next({hideInput: true, disableInput: true});
    }
  }
}

export interface DashboardModHeaderSearchBarEvent {
  dashboardModHeaderSearchBarEvent: {
    elementResized$: Subject<Event | string | undefined>,
    searchbarHidden$: BehaviorSubject<{ hideInput: boolean, disableInput: boolean }>,
    searchPerformed$: Subject<void>
  }
}
