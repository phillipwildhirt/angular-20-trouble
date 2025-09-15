import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const buildSpecificModules = [StoreDevtoolsModule.instrument({maxAge: 50, connectInZone: true})];
