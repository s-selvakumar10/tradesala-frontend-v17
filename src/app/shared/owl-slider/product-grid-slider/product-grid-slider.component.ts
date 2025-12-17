import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent, SlidesOutputData, OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselService } from 'ngx-owl-carousel-o/lib/services/carousel.service';
import { Subscription } from 'rxjs';
import { delay, filter } from 'rxjs/operators';
import { Product } from 'src/app/core/models/product';
import { ResizeService } from 'src/app/core/services/resize.service';

@Component({
  selector: 'app-product-grid-slider',
  templateUrl: './product-grid-slider.component.html',
  styleUrls: ['./product-grid-slider.component.scss'],
  animations: [
    trigger('activeSlide', [
      state('active', style({
        transform: 'scale(1.4)',
        opacity: 1,
      })),
      state('inActive', style({
        transform: 'scale(0.7)',
        opacity: 1,
      })),
      transition('active => inActive', [
        animate('0.5s')
      ]),
      transition('inActive => active', [
        animate('0.5s')
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductGridSliderComponent implements OnInit {

  @Input() title: String;
  @Input() products: Array<Product>;
  @Input() width: number;
  @Input() setWidth: number;
  @Input() slideOption: any = {};
  @Input() isLoading: boolean;

  @Input() options: OwlOptions = {
    autoWidth: true,
    loop: false,
    autoplay: false,
    lazyLoad:true,
    merge: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    nav: true,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 4,
      },
      940: {
        items: 7,
      },
    },
  };
  
  
  activeSlides: SlidesOutputData;

  @ViewChild('carousel', { static: true }) carousel: CarouselComponent;

  @HostListener('window:resize', ['$event'])
  onResize() {
      this._winResizeWatcher();
  }

  @HostListener('window:onload', ['$event'])
  onLoad() {
      this._winResizeWatcher();
  }

  carouselWindowWidth: number;
  resizeSubscription: Subscription;
  
  constructor(
    private el: ElementRef,   
    private resizeService: ResizeService
  ) {}

  ngOnInit(): void {
    
    this.carouselWindowWidth = this.el.nativeElement.querySelector(
      '.owl-carousel'
    ).clientWidth;
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
  
  private _winResizeWatcher() {
    if (Object.keys(this.options.responsive).length) {      
      const anyService = this.carousel as any;
      const carouselService = anyService.carouselService as CarouselService;
      this.resizeSubscription = this.resizeService.onResize$
        .pipe(
          filter(() => this.carouselWindowWidth !== this.el.nativeElement.querySelector('.owl-carousel').clientWidth),
          delay(carouselService.settings.responsiveRefreshRate)
        )
        .subscribe(() => {
          carouselService.onResize(this.el.nativeElement.querySelector('.owl-carousel').clientWidth);
          this.carouselWindowWidth = this.el.nativeElement.querySelector('.owl-carousel').clientWidth;
        });
    }
  }
  
  
}
