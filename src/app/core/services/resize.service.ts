import { EventManager } from '@angular/platform-browser';
import { fromEvent, Observable, Subject } from 'rxjs';
import { Inject, Injectable, PLATFORM_ID, Renderer2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  /**
   * Width of window
   */
  public windowWidth: any;
  /**
   * Makes resizeSubject become Observable
   * @returns Observable of resizeSubject
   */
  get onResize$(): Observable<Window> {
    return this.resizeSubject.asObservable();
  }

  /**
   * Subject of 'resize' event
   */
  private resizeSubject: Subject<Window>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    @Inject(DOCUMENT) private document: Document
  ) {
    this.resizeSubject = new Subject();
    //this.eventManager.addEventListener('window', 'resize', this.onResize.bind(this));
    fromEvent(this.document.defaultView, 'resize').subscribe((evt: UIEvent) => this.onResize(evt));
    fromEvent(this.document.defaultView, 'load').subscribe((evt: UIEvent) => this.onLoaded(evt));
    
  }

  /**
   * Handler of 'resize' event. Passes data throw resizeSubject
   * @param event Event Object of 'resize' event
   */
  private onResize(event: UIEvent) {
    this.resizeSubject.next(<Window>event.target);
  }

  /**
   * Handler of 'onload' event. Defines the width of window
   * @param event Event Object of 'onload' event
   */
  private onLoaded(event: UIEvent) {
    this.windowWidth = <Window>event.target;
  }
  
}
