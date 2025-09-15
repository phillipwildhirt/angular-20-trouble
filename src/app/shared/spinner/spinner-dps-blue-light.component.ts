import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'dps-spinner-dps-blue-light',
  templateUrl: './spinner.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass,
    NgStyle
  ],
  styleUrls: ['./spinner-dps-blue-light.component.scss']
})
export class SpinnerDPSBlueLightComponent extends SpinnerComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
