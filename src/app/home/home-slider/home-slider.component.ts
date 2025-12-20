import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { CarouselComponent, SlidesOutputData, OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselService } from 'ngx-owl-carousel-o/lib/services/carousel.service';
import { Subscription } from 'rxjs';
import { delay, filter} from 'rxjs/operators';
import { ResizeService } from 'src/app/core/services/resize.service';
import { Image } from 'src/app/shared/owl-slider/image';

@Component({
  selector: 'app-home-slider',
  templateUrl: './home-slider.component.html',
  styleUrls: ['./home-slider.component.scss'],
  animations: [
    trigger('activeSlide', [
      state('active', style({
        transform: 'scale(1.4)',
        opacity: 1,
      })),
      state('inActive', style({
        transform: 'scale(0.7)',
        opacity: 0.8,
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
export class HomeSliderComponent implements OnInit {
  sliderEnabled: boolean = false;
  loadImage = true;
  public _sliderImages: any = [];
  @Input('sliderImages') set sliderImages(value: any){
    this._sliderImages = value;
    if(value.length){
      this.sliderEnabled = true;
      this.loadImage = true;
    }
    
  }
  get sliderImages(): any { return this._sliderImages; }
	
  activeSlides: SlidesOutputData;
  isLoading: boolean = false;
 
  //imagesData: Image[];
  homeSlideOptions: OwlOptions = {
    loop: true,
    animateOut: 'animate__animated animate__fadeOut',
    animateIn: 'animate__animated animate__fadeIn',
    autoplay: true,
    autoplaySpeed:3000,
    autoplayHoverPause:true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    nav: false,
    navSpeed: 700,
    navText: [ '<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>' ],
    items: 1,
    responsive: {
      0: { 
        items: 1
      }
    }  
  };
  carouselWindowWidth: number;
  resizeSubscription: Subscription;

  @ViewChild('carousel', { static: true }) carousel: CarouselComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
      //this._winResizeWatcher();
  }

  constructor(
    private el: ElementRef,
    private resizeService: ResizeService
  ) { }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.sliderEnabled = true;
    // }, 2000);
   
    
    this.changeOptions();
    
  }
  ngOnChanges(simpleChange: SimpleChange){
    // if(this.sliderImages?.length){
    //   this.loadImage = true;
    //   // this.sliderImages = this.sliderImages.map((item, i) => {
    //   //   console.log(item);
    //   //   return {'src': item.image, 'alt': 'slide ' +i, 'title': 'slide ' +i}
    //   // })
    // } else {
    //   this.loadImage = false;
    // }
  }
  ngAfterContentInit(){
    // this.imagesData = [
    //   {
    //     src: 'assets/images/home-slider/new/2.jpg',
    //     alt: 'slide 3',
    //     title: 'slide 3'
    //   },
    //   {
    //     src: 'assets/images/home-slider/new/3.jpg',
    //     alt: 'slide 4',
    //     title: 'slide 4'
    //   },
    //   {
    //     src: 'assets/images/home-slider/new/4.jpg',
    //     alt: 'slide 5',
    //     title: 'slide 5'
    //   },
    //   {
    //     src: 'assets/images/home-slider/new/5.jpg',
    //     alt: 'slide 1',
    //     title: 'slide 1'
    //   },
    //   {
    //     src: 'assets/images/home-slider/new/1.jpg',
    //     alt: 'slide 2',
    //     title: 'slide 2'
    //   } 
    // ];
    //this.sliderEnabled = true;
    
  }

  changeOptions() {
    this.homeSlideOptions = { ...this.homeSlideOptions, loop: true, responsiveRefreshRate: 50 } // this will make the carousel refresh
    
  }

  getPassedData(data: SlidesOutputData){
    this.activeSlides = data;   
    if(this.activeSlides){
      this.isLoading = true;
    } else {
      this.isLoading = false;
    }
  }
  getData(data: SlidesOutputData) {
    this.activeSlides = data;    
    if(this.activeSlides){
      this.isLoading = true;
      this.sliderEnabled = true;
      this.carouselWindowWidth = this.el.nativeElement.querySelector(
        '.owl-carousel'
      ).clientWidth;
     
    } else {
      this.isLoading = false;
    }
  }
  _winResizeWatcher() {        
    if (Object.keys(this.homeSlideOptions.responsive).length) {  
      let anyService = this.carousel as any;    
      let carouselService = anyService.carouselService as CarouselService;    
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
  ngOnDestroy(): void {
   if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
  
}
