import { SimpleChange } from '@angular/core';

export class SimpleChangeTyped<T> extends SimpleChange {
  previousValue!: T;
  currentValue!: T;

  constructor(previousValue: T, currentValue: T, firstChange: boolean) {
    super(previousValue, currentValue, firstChange);
  };
}
