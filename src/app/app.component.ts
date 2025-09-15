import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntil, tap } from 'rxjs/operators';
import { CREATOR } from '@app/audit/internal-audit.service';


@Component({
  selector: 'dps-root',
  templateUrl: './app.component.html',
  providers: [{ provide: CREATOR, useValue: 'AppComponent' }],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private titleService = inject(Title);

  private readonly unsub$ = new Subject<void>();
  title = 'dps-client';

  savedUrl = '';

  constructor() {
  }

  ngOnInit(): void {

    this.router.events.pipe(
      takeUntil(this.unsub$),
      tap((event) => {

        // console.log(event, (event as any)['url']  ? (event as any).url : '')
        let route: ActivatedRoute = this.router.routerState.root;
        let routeTitle = '';
        while (route!.firstChild) {
          route = route.firstChild;
        }
        if (route.snapshot.data['title']) {
          routeTitle = route!.snapshot.data['title'];
        }
        if (routeTitle) {
          const title = `DPS | ${ routeTitle }`;
            this.titleService.setTitle(title);
        }
        if (event instanceof NavigationEnd) {
          this.savedUrl = event.urlAfterRedirects;
          // console.log(event.url)
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }
}
