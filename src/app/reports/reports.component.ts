import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'dps-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: false
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly unsub$ = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }

}
