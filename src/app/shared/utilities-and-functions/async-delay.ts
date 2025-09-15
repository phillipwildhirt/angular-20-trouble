import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const asyncDelay = (delayTime: number = 0, func: () => void) => of([]).pipe(delay(delayTime)).subscribe(func);
