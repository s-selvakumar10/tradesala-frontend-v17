import { Component, Input, OnInit, OnDestroy, OnChanges, ViewChild, PLATFORM_ID, Inject, NgZone, ChangeDetectionStrategy, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ImgZoomService } from './../../shared/image-zoom/image-zoom.service';
import { ImgZoomComponent } from './../../shared/image-zoom/image-zoom.component';
import { Media } from 'src/app/core/models/product';
import { SlidesOutputData, OwlOptions } from 'ngx-owl-carousel-o';
import { SessionFlow } from 'src/app/helper/session-flow';
import { ResizeService } from 'src/app/core/services/resize.service';
import { Subscription } from 'rxjs';
import { filter} from 'rxjs/operators';
import { WINDOW } from 'src/app/shared/services/window.service';
import { MobileDeviceDetectorService } from 'src/app/core/services/device-detector.service';

@Component({
  selector: 'app-product-images',
  templateUrl: './product-images.component.html',
  styleUrls: ['./product-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ]
})
export class ProductImagesComponent implements OnInit, OnDestroy, OnChanges{
  @Input() media: Media;
  bigImage: string | boolean;
  images: any = [];
  isLoadingResults = false;
  @Input() width: number;
  @ViewChild('player') player: any;
  videoId: string;
  @Input()
  set id(id: string) {
    this.videoId = id;
  }
  videos: any = [];
  safeURL: any;
  displayedVideoImg: string;
  videoEnabled: boolean = false;
  imageEnabled: boolean = true;

  imgZoomOptions: {
    enableZoom: Boolean;
    imageStyle: string;
    resultStyle: string;
    containerStyle: string;
    lensStyle: string;
  };
  isMobile: boolean = false;
  isTablet: boolean = false;
  isDesktop: boolean = false;
  screenwidth: any;
  resizeSub: Subscription;
  beforeZoom = false;
  
  @ViewChild(ImgZoomComponent) zoom!: ImgZoomComponent;
  
  constructor(
   
    private render: Renderer2,
    private ngZone: NgZone,
    @Inject(DOCUMENT)
    private _document: Document,
    @Inject(WINDOW) private window: Window,
    private ngxImgZoom: ImgZoomService, 
    private mobileDetect: SessionFlow,
    private resizeService: ResizeService,
    @Inject(PLATFORM_ID) private platformId: any,
    public device: MobileDeviceDetectorService,
    @Inject('isServer') public isServer: boolean

  ) {
    this.ngxImgZoom.setZoomBreakPoints([
      { w: 100, h: 100 },
      { w: 150, h: 150 },
      { w: 200, h: 200 },
      { w: 250, h: 250 },
      { w: 300, h: 300 },
    ]);

    this.imageGallerySettings();
    this.isMobile =  this.device.isMobile();
    this.isTablet = this.device.isTablet();
    this.isDesktop = this.device.isDesktop();
  }
  

  ngOnInit(): void { 
    
    this.calculateInnerWidth();
    this.loadImages();

  }

  ngAfterViewInit(): void {    
    this.ngZone.run(() => {
      this.beforeZoom = false;
      if(this.videos.length > 0){
        this.playYoutube();
      }
    });

   
  }
 

  ngOnChanges(): void {
    this.loadImages();
  }
  calculateInnerWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.screenwidth = window.innerWidth;
    } 
    
    //.pipe(filter((event) => event.innerWidth <= 768))
    this.resizeSub = this.resizeService.onResize$.subscribe((event) => {
      this.screenwidth = event.innerWidth;
      
    });
  }
  playYoutube(): void {
    const tag = this._document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    this._document.body.appendChild(tag);
  }
   // Autoplay
  onReady(event) {
    this.player.mute();         
    this.player.playVideo();    
  }

  // Loop
  onStateChange(event) {
    if (event.data === 0) {
      this.player.playVideo();  
    }
  }
  loadImages():void { 
   
    this.bigImage = this.media.front_image;
    this.images = this.media.images ?? [];
    //this.images = [this.images, ...this.media.images, ...this.media.images];  
    this.videos = this.media.videos;
      
    this.videos?.forEach(video => {
      const youtubeId = this.YouTubeGetID(video.url);
      const thumbImg = 'https://img.youtube.com/vi/' + youtubeId + '/default.jpg'; 
      let thumbnail: any  = {
        'thumbnail': thumbImg
      } 
      Object.assign(video,  thumbnail);
    });
    //console.log(this.images[0]);
    this.bigImages(this.bigImage, this.images[0]);
    
    if(this.videos.length > 0){
      
      this.bigVideo(this.videos[0].url);
    }
    
   
  }
  bigImages(bigImage, image): void{
    this.bigImage = image;    
    this.imageEnabled = true;
    this.videoEnabled = false;    
  }
  bigVideo(video): void{    
    this.imageEnabled = false;
    this.videoEnabled = true;        
    this.videoId = this.YouTubeGetID(video);
  }
  YouTubeGetID(url){
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
 }
  imageGallerySettings() {
    
    const imageStyle = `
    width:360px; 
    height:360px;
    bottom:0;  
    left:0;  
    right:0;  
    top:0;  
    margin:0 auto;
    border-radius:10px;
    `;

    const resultStyle =`
      width:380px; 
      height:380px; 
      background-repeat: 
      no-repeat; 
      z-index: 2; 
      position:absolute;
     -webkit-box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); 
      top: 0;
      left: 100%;      
      visibility: hidden;
    `;

    const containerStyle = 'position: initial';

    const lensStyle = 'height: 100px; width: 100px;';

    const options = {
      imageStyle,
      resultStyle,
      containerStyle,
      enableZoom: true,
      lensStyle,
    };
    this.imgZoomOptions = options;
  }

  verticalImages: OwlOptions = {
    loop: false,
    autoplay: false,
    autoWidth: true,
    margin:10,
    animateOut: 'animate__animated animate__slideOutUp',
    animateIn: 'animate__animated animate__slideInUp',
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    center:false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    nav: true,
    items: 5,
    
  };
  activeSlides: SlidesOutputData;

  getData(data: SlidesOutputData) {
    this.activeSlides = data;
  }
  getPassedData(data: any) {
    this.activeSlides = data;
  }
  carouselChanged(evt: SlidesOutputData) {
    //console.log(evt);
  }

  ngOnDestroy() {
    this.imageGallerySettings();    
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
    
  }
}
