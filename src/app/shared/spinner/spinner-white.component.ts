import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'dps-spinner-white',
  templateUrl: './spinner.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass,
    NgStyle
  ],
  styleUrls: ['./spinner-white.component.scss']
})
export class SpinnerWhiteComponent extends SpinnerComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
