import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgForOf } from '@angular/common';
import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbAccordionConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselComponent, CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { CarouselService } from 'ngx-owl-carousel-o/lib/services/carousel.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeoService } from 'src/app/shared/services/seo.service';
import { environment } from 'src/environments/environment';

export class CarouselData {
  id?: string;
  text: string;
  dataMerge?: number;
  width?: number;
  dotContent?: string;
  src?: string;
  dataHash?: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
	templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [NgbModule, NgForOf, CarouselModule],
  animations: [
    trigger('activeSlide', [
      state('active', style({
        transform: 'scale(1)',
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
  
})

export class OverviewComponent implements OnInit {

  @ViewChild('carousel', { static: true }) carousel: CarouselComponent;
  metaDataInfo: Subscription;
  constructor(
    private route: ActivatedRoute,
    private seoService: SeoService,
    config: NgbAccordionConfig
  ) { 
    config.closeOthers = true;   
  }
  slides: CarouselData[];

  activeSlides: SlidesOutputData;
  
  contentSlider: OwlOptions = {
    loop: true,
    autoWidth: true, 
    autoHeight: true,
    margin: 20,
    autoplay: false,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    center: true,
    slideBy: 1,
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
      480: {
        items: 3,
      },
      740:{
        items: 3,
      },
      940: {
        items: 3,
      },
    },
  };

  ngOnInit(): void {
    this.metaDataInfo = this.route.data.pipe(map(({metaInfo})=> metaInfo)).subscribe(meta => {
			if(meta?.status){
				this.setMetaInfo(meta.data);
			} else {
				this.setMetaInfo();
			}
		});
    this.slides  = [
      {id: 'slide-1', text: 'Secure Payments', src: 'assets/images/about/slider/slider-1.svg'},
      {id: 'slide-2', text: 'All Indian brands', src: 'assets/images/about/slider/slider-2.svg'},
      {id: 'slide-3', text: '24*7 Helpdesk', src: 'assets/images/about/slider/slider-3.svg'},
      {id: 'slide-4', text: 'Available Pan-India', src: 'assets/images/about/slider/slider-4.svg'},
      {id: 'slide-5', text: 'Buyer Protection', src: 'assets/images/about/slider/slider-5.svg'},
      {id: 'slide-6', text: 'Multiple Industries', src: 'assets/images/about/slider/slider-6.svg'},
      {id: 'slide-7', text: 'Secure Payments', src: 'assets/images/about/slider/slider-1.svg'},
      {id: 'slide-8', text: 'All Indian brands', src: 'assets/images/about/slider/slider-2.svg'},
    ];
   
  }

  ngOnChanges(changes: SimpleChanges): void{
    
  }
  setMetaInfo(data: any = null) {

		const metaInfo = environment.config.metaInfo;
		
		const metaTitle = (data?.meta_title) ? data.meta_title : metaInfo.title;
   		this.seoService.setTitle(metaTitle);
    
		const metaDesc = (data?.meta_description) ? data.meta_description : metaInfo.description;
		const metaKeywords = (data?.meta_description) ? data.meta_keywords : metaInfo.keywords;
		const metaTags = [
		  { name: 'title', content: metaTitle },
		  { name: 'description', content: metaDesc},
		  { name: 'keywords', content: metaKeywords}        
		]; 
		const metaGraph = [
		  { property: 'og:title', content: (data?.open_graph) ? data.open_graph.og_title : metaInfo.og_title },
		  { property: 'og:site_name', content: (data?.open_graph) ? data.open_graph.og_sitename : metaInfo.og_sitename },
		  { property: 'og:url', content: metaInfo.og_url },
		  { property: 'og:locale', content: metaInfo.og_locale },
		  { property: 'og:description', content: (data?.open_graph) ? data.open_graph.og_description : metaInfo.og_description },
		  { property: 'og:type', content: (data?.open_graph) ? data.open_graph.og_type : metaInfo.og_type},
		  { property: 'og:image', content: (data?.open_graph) ? data.open_graph.og_image : metaInfo.og_image },
		  { property: 'og:image:width', content: '600' },
		  { property: 'og:image:height', content: '600' },		  
		  { property: 'og:image:alt', content: '' },    
		  { property: 'twitter:card', content: (data?.twitter_card) ? data.twitter_card.twt_card : metaInfo.twt_card },
		  { property: 'twitter:site', content: metaInfo.twt_site },
		  { property: 'twitter:creator', content: metaInfo.twt_site },
		  { property: 'twitter:url', content: metaInfo.twt_url },
		  { property: 'twitter:title', content: (data?.twitter_card) ? data.twitter_card.twt_title : metaInfo.twt_title },
		  { property: 'twitter:description', content: (data?.twitter_card) ? data.twitter_card.twt_description : metaInfo.twt_description },
		  { property: 'twitter:image', content: (data?.twitter_card) ? data.twitter_card.twt_image : metaInfo.twt_image }
		];
	 
		this.seoService.setMetaTags(metaTags);
		this.seoService.setMetaGrapLd(metaGraph);
		
		const robots = (data?.robots) ? data.robots : metaInfo.robots;
		this.seoService.setRobots(robots);
		
	}
  
  getPassedData(data: SlidesOutputData) {
    
    this.activeSlides = data;
    let carouselSlides = this.carousel as any; 
    let carouselService = carouselSlides.carouselService as CarouselService;
   
    //console.log(carouselService);

    data.slides.findIndex((x, index) =>{
      if(index == 1){
        carouselService.slidesData?.findIndex((y, index2) => {
          if(y.id == x.id){           
            y.classes.center = true;
          } else {
            y.classes.center = false;
          }
        })
        x.center = true;
      } else {
        x.center = false;
      }
    });
    
  }

  getData(data: SlidesOutputData) {    
    let carouselSlides = this.carousel as any;
    
    let carouselService = carouselSlides.carouselService as CarouselService;
    data.slides.findIndex((x, index) =>{
      if(index == 1){
        carouselService.slidesData?.findIndex((y, index2) => {
          if(y.id == x.id){
            y.classes.center = true;
          } else {
            y.classes.center = false;
          }
        })
        x.center = true;
      } else {
        x.center = false;
      }
    });
    
  }
  getChanged(data: SlidesOutputData) {
    

    // let carouselSlides = this.carousel as any;   
    // let carouselService = carouselSlides.carouselService as CarouselService;
    // data.slides.findIndex((x, index) =>{
    //   if(index == 1){
    //     x.classes.center = true;
    //     carouselService.slidesData?.findIndex((y, index2) => {
    //       if(y.id == x.id){
    //         y.classes.center = true;
    //       } else {
    //         y.classes.center = false;
    //       }
    //     })
    //   } else {
    //     x.classes.center = false;
    //   }
    // });
  }
  
  lastPanelId: string = null;
  defaultPanelId: string = "panel1";

  panelShadow($event: NgbPanelChangeEvent, shadow) {
    //console.log($event);

    const { nextState } = $event;

    const activePanelId = $event.panelId;
    const activePanelElem = document.getElementById(activePanelId);

    if (!shadow.isExpanded(activePanelId)) {
      activePanelElem.parentElement.classList.add("open");
    }

    if(!this.lastPanelId) this.lastPanelId = this.defaultPanelId;

    if (this.lastPanelId) {
      const lastPanelElem = document.getElementById(this.lastPanelId);

      if (this.lastPanelId === activePanelId && nextState === false)
        activePanelElem.parentElement.classList.remove("open");
      else if (this.lastPanelId !== activePanelId && nextState === true) {
        lastPanelElem.parentElement.classList.remove("open");
      }

    }

    this.lastPanelId = $event.panelId;
  }

  ngOnDestroy(){
    this.metaDataInfo.unsubscribe()
  }
}
export interface NgbPanelChangeEvent {
  nextState: boolean;
  panelId: string;
  preventDefault: () => void;
}
