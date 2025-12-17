import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: 'img[lazyLoad]'
})
export class LazyLoadDirective {
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype;

    if (supports) {
      nativeElement.setAttribute('loading', 'lazy');
    } else {
      // fallback to IntersectionObserver
    }
  }
}
