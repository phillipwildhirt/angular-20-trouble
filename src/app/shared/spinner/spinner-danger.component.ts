import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'dps-spinner-danger',
  templateUrl: './spinner.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass,
    NgStyle
  ],
  styleUrls: ['./spinner-danger.component.scss']
})
export class SpinnerDangerComponent extends SpinnerComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
