import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


function _window(): any {
  // return the global native browser window object
  return window;
}

@Injectable({
  providedIn: 'root'
})

export class WindowRefService {

  constructor(@Inject(DOCUMENT) private doc: Document) {}
  
  getWindow(): Window | null {
    return this.doc.defaultView;
  }

  getLocation(): Location {
    return this.doc.location;
  }

  createElement(tag: string): HTMLElement {
    return this.doc.createElement(tag);
  }

  get nativeWindow(): any {
    return _window();
  }
}
