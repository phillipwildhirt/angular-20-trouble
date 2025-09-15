import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

/**
 * To set custom colors or animation times duplicate this spinner and edit the Sass variables
 * in the scss file.
 *
 * Colors take hex or sass variables
 */


@Component({
  selector: 'dps-spinner',
  templateUrl: './spinner.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgClass,
    NgStyle
  ],
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  /**
   * @desc (optional) To trigger a checkmark end to the spinner set to true.
   * @param boolean
   */
  @Input() complete: boolean = false;

  /**
   * @desc (optional) Set a custom size for the spinner.
   * @param number in pixels
   */
  @Input() spinnerSize: number = 48;

  wasInitComplete = false;

  verticalAlignOffset = - this.spinnerSize * 0.02;
  checkSize = this.spinnerSize <= 40 ? this.spinnerSize : this.spinnerSize * .94;
  backgroundPosition = `${((this.spinnerSize - this.checkSize) * 0.5)}px ${((this.spinnerSize - this.checkSize) * 0.5)}px`;
  backgroundSize = `${this.checkSize}px ${this.checkSize}px`;

  ngOnInit(): void {
    this.wasInitComplete = this.complete;
    this.verticalAlignOffset = - this.spinnerSize * 0.02;
    this.checkSize = this.spinnerSize <= 40 ? this.spinnerSize : this.spinnerSize * .94;
    this.backgroundPosition = `${((this.spinnerSize - this.checkSize) * 0.5)}px ${((this.spinnerSize - this.checkSize) * 0.5)}px`;
    this.backgroundSize = `${this.checkSize}px ${this.checkSize}px`;
  }

}
