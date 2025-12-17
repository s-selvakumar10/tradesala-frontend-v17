import { OnInit, ElementRef, Input, Directive, Inject, HostListener, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stickyClass]'
})
export class CategoryStickyDirective implements OnInit{

  private _topMarker: HTMLElement;
  private _bottomMarker: HTMLElement;

  @Input() stickyStartId: string = 'sticky-start';
  @Input() stickyBottomId: string = 'sticky-bottom';
  @Input() stickyClass: string = 'sticky';

  @Input() ieOnly: boolean = true;
  @Input() isMobile: boolean = true;

  constructor(
      @Inject(DOCUMENT)
      private _document: Document,
      private _element: ElementRef,
      private _renderer: Renderer2) {
  }

  ngOnInit() {
    this._topMarker = this._document.getElementById(this.stickyStartId);
    this._bottomMarker = this._document.getElementById(this.stickyBottomId);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    let agent = window.navigator.userAgent;
    let ie = agent.indexOf('MSIE') > 0 || agent.indexOf('Trident/') > 0;
    let isMobile = document.documentElement.clientWidth > 991;
    let enabled = ie || !this.ieOnly;

    if (this._topMarker && this._bottomMarker && enabled && isMobile) {

      var y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      let startPosition = this._topMarker.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
      let bottomPos = this._bottomMarker.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
      let stopPosition = bottomPos - this._element.nativeElement.offsetHeight;
      let headerHeight = this._document.querySelector('#navbar.sticky');
      if (y > startPosition) {
        this._renderer.addClass(this._element.nativeElement, this.stickyClass);

        if (y > stopPosition) {
          this._renderer.setStyle(this._element.nativeElement, 'top', '' + (stopPosition - y) + 'px');
        } else {
          //   let topPosition = headerHeight.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
          //   let fixedTop = headerHeight.getBoundingClientRect().height + 50;
            
          //  if(topPosition > 200){
          //       this._renderer.setStyle(this._element.nativeElement, 'top', + fixedTop + 'px');
          //  } else {
          //       this._renderer.setStyle(this._element.nativeElement, 'top', 0);
          //  }
          //this._renderer.setStyle(this._element.nativeElement, 'top', + fixedTop + 'px');
        }

      } else {
        this._renderer.removeClass(this._element.nativeElement, this.stickyClass);
      }
    }
  }


}
