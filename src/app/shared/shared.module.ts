import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbActiveModal, NgbModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModule,
    StoreModule,
    PortalModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModule,
  ],

  providers: [
    NgbActiveModal,
    DatePipe,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
}
