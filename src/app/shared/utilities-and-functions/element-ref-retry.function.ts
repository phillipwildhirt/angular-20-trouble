import { Observable, of } from 'rxjs';
import { map, retry, take } from 'rxjs/operators';

/**
 * Safe way to retry getting an ElementRef used in a @ViewChild.
 Pass in a function that returns the ElementRef, and the observable
 will retry any number of times after any amount of delay.
 If the retry count is exhausted the observable will end with an error.
 * @param getRef Function, () => returns an ElementRef;
 * @param count Number, (optional) default is 20;
 * @param delay Number, (optional) default is 1ms;
 * @return Observable<ElementRef>
 */

export const elementRefRetry = (getRef: () => (any | undefined | null), count: number = 20, delay: number = 1): Observable<any> => {
  return of(0).pipe(
    map(() => {
      const ref = getRef();
      if (ref !== undefined && ref !== null) { return ref;
      } else { throw 'Unable to find ElementRef. Try increasing count or delay.'; }}),
    take(1),
    retry( {count, delay}));
};

export const nodeListRefRetry = (getRef: () => (NodeList | undefined | null), count: number = 20, delay: number = 1): Observable<NodeList> => {
  return of(0).pipe(
    map(() => {
      const ref = getRef();
      if (ref !== undefined && ref !== null && ref.length > 0) { return ref;
      } else { throw 'Unable to find NodeList. Try increasing count or delay.'; }}),
    take(1),
    retry( {count, delay}));
};

