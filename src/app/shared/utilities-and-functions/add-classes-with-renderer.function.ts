import { Renderer2 } from '@angular/core';

export const addClassesWithRenderer = (rendererInstance: Renderer2, element: Element, classes: string[]): void => {
  classes.forEach( c => rendererInstance.addClass(element, c));
};

export const setStyleWithRenderer = (rendererInstance: Renderer2, element: Element, styles: {[k: string]: string}): void => {
  Object.entries(styles).forEach( ([k, v]) => rendererInstance.setStyle(element, k, v));
};

export const removeStyleWithRenderer = (rendererInstance: Renderer2, element: Element, styles: {[k: string]: string}): void => {
  Object.entries(styles).forEach( ([k,]) => rendererInstance.removeStyle(element, k));
};

export const createElementWithRenderer = (rendererInstance: Renderer2, elementName: string, styles: {[k: string]: string}, classes: string[]): Element => {
  const el = rendererInstance.createElement(elementName);
  setStyleWithRenderer(rendererInstance, el, styles);
  addClassesWithRenderer(rendererInstance, el, classes);
  return el;
};
