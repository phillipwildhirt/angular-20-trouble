import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    StoreModule,
  ],
  exports: [
    CommonModule,
  ],

  providers: [
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
}
