import { Component} from '@angular/core';
import { CREATOR } from '@app/audit/internal-audit.service';

@Component({
  selector: 'dps-not-print',
  templateUrl: './app-not-print.component.html',
  styleUrls: ['./app-not-print.component.scss'],
  providers: [{ provide: CREATOR, useValue: 'NotPrintComponent' }],
  standalone: false
})
export class AppNotPrintComponent {
  title = 'dps-client';

}
