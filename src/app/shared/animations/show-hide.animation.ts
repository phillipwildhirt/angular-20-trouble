import { animate, animation, style } from '@angular/animations';

export const showAnimation = animation([
  style({opacity: 0}),
  animate('{{ time }}ms', style({opacity: 1})),
]);

export const hideAnimation = animation([
  style({opacity: 1}),
  animate('{{ time }}ms', style({opacity: 0}))
]);
