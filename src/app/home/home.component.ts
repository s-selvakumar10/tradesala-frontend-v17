import {
	Component,
	Inject,
	NgZone,
	OnDestroy,
	OnInit,
	PLATFORM_ID
} from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Product } from '../core/models/product';
import { ProductService } from '../core/services/product.service';
import { CollapseCatMenuService } from '../header/collapse-cat-menu/collapse-cat-menu.service';
import { ApiService } from '../shared/services/api.service';
import { SessionFlow } from '../helper/session-flow';
import { ResizeService } from '../core/services/resize.service';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { SeoService } from '../shared/services/seo.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from '../shared/login-popup/login-popup.component';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DeliveryPincodeModalComponent } from '../shared/delivery-pincode-modal/delivery-pincode-modal.component';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
	public allCategoryMenuOpen: boolean = true;

	public trendingproducts$: Array<Product>;
	public featuredproducts$: Array<Product>;
	public newArraivalproducts$: Array<Product>;
	public specialproducts$: Array<Product>;
	isLoading: boolean = false;
	bestProduct: any = [];
	public otherProducts$: Array<Product>;


	public options1: OwlOptions = {
		loop: false,
		autoplay: false,
		lazyLoad: true,
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
				items: 2,
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
		responsiveRefreshRate: 50
	};
	public options2: OwlOptions;
	public options3: OwlOptions;
	public options4: OwlOptions;

	currentJustify = 'end';
	deviceId: string;

	public isMobile: boolean = false;
	screenwidth: any;
	resizeSub: Subscription;

	schema = {};
	modalOptions: NgbModalOptions;
	metaDataInfo: Subscription;
	
	bannerImages:{top: any, middle: any, bottom: any} = {
		top: [],
		middle: [],
		bottom: []
	};
	loadImage = false;

	constructor(
		private route: ActivatedRoute,
		private collapseCatMenuService: CollapseCatMenuService,
		private productService: ProductService,
		public restApi: ApiService,
		private meta: Meta,
		private title: Title,
		private seoService: SeoService,
		public mobileDetect: SessionFlow,
		private resizeService: ResizeService,
		private modalService: NgbModal,
		private zoneRef: NgZone,
		private authService: AuthService,
    	private apiService: ApiService,
		@Inject(PLATFORM_ID) private platformId: Object,
	) {
		this.isMobile = this.mobileDetect.isMobile;
		this.modalOptions = {
			backdrop: 'static',
			backdropClass: 'registerBackdrop',
			ariaLabelledBy: 'modal-basic-title',
			centered: true
		}
		
		
	}
	ngOnInit(): void {

		this.metaDataInfo = this.route.data.pipe(map(({metaInfo})=> metaInfo)).subscribe(meta => {
			if(meta?.status){
				this.setMetaInfo(meta.data);
			} else {
				this.setMetaInfo();
			}
		});
		this.apiService.get('v1/banner').pipe(map(res => res)).subscribe((res: any)=> {
			this.bannerImages = res.data;			
		});
		
		if (isPlatformBrowser(this.platformId)) {
			this.screenwidth = window.innerWidth;
		}
		// this.metaDataInfo.subscribe(data => {			
		// 	if(data){

		// 	} else {
		// 		this.addMetaInfo();
		// 	}
		// })
		

		this.setJsonSchema();

		let baseOptions = this.options1;

		//this.options2 = { ...baseOptions, ...{autoWidth: true,responsive: {940: {items: 6}}} };
		this.options2 = { ...baseOptions };
		this.options3 = { ...baseOptions };
		this.options4 = { ...baseOptions };


		this.productService.getTrendingProducts().subscribe((res) => {
			if (res) {
				this.trendingproducts$ = res;
				this.isLoading = true;
			}

		});

		this.productService.getFeaturedProducts().subscribe((res) => {
			if (res) {
				this.featuredproducts$ = res;
				this.isLoading = true;
			}

		});

		this.productService.getNewArraivalProducts().subscribe((res) => {
			if (res) {
				this.newArraivalproducts$ = res;
				this.isLoading = true;
			}

		});

		this.productService.getSpecialProducts().subscribe((res) => {
			if (res) {
				this.specialproducts$ = res;
				this.isLoading = true;
			}

		});


		this.restApi.getAll<any>(`v1/products/best`)
			.pipe(map((resp) => resp))
			.subscribe((resp) => {
				this.bestProduct = resp;
			});

		this.collapseCatMenuService.statusUpdated.emit(true);

	}
	
	ngAfterViewInit(): void {
		
		this.zoneRef.run(() => {
			if(!this.authService.getAuthorizationToken() && isPlatformBrowser(this.platformId)){				
				setTimeout(() => {
					if(!this.modalService.hasOpenModals()){
						//this.modalService.open(LoginPopupComponent, this.modalOptions);
						this.modalService.open(DeliveryPincodeModalComponent, this.modalOptions);
					}
				}, 4000);
				
			}
			
			
		})
		
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
	addMetaInfo() {
		const metaInfo = environment.config.metaInfo;
		const logo = environment.frontEndUrl + '/assets/images/logo.png';

		this.meta.updateTag({ property: 'og:title', content: metaInfo.title });
		this.meta.updateTag({ property: 'og:site_name', content: environment.appName });
		this.meta.updateTag({ property: 'og:url', content: environment.frontEndUrl });
		this.meta.updateTag({ property: 'og:description', content: metaInfo.description });
		this.meta.updateTag({ property: 'og:type', content: 'website' });
		this.meta.updateTag({ property: 'og:image', content: logo });
		this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

		this.meta.updateTag({ property: 'twitter:card', content: 'summary' });
		this.meta.updateTag({ property: 'twitter:site', content: '@tradesala' });
		this.meta.updateTag({ property: 'twitter:url', content: environment.frontEndUrl });
		this.meta.updateTag({ property: 'twitter:title', content: metaInfo.title });
		this.meta.updateTag({ property: 'twitter:description', content: metaInfo.description });
		this.meta.updateTag({ property: 'twitter:image', content: logo });

	}
	setJsonSchema() {
		this.schema = {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: environment.config.appName,
			url: isPlatformBrowser(this.platformId) ? location.origin : ''
		};
		this.seoService.setJsonLd(this.schema);
	}

	calculateInnerWidth() {
		if (this.screenwidth <= 800) {
			this.isMobile = this.mobileDetect.isMobile;
		} else {
			this.isMobile = false;
		}
		this.resizeSub = this.resizeService.onResize$.pipe(filter((event) => event.innerWidth <= 768)).subscribe((event) => {
			if (event.innerWidth <= 768) {
				this.isMobile = true;/*  */
			} else {
				this.isMobile = false;
			}

		});
	}
	simpleClone(obj: any) {
		return Object.assign({}, obj);
	}
	ngOnDestroy(): void {
		this.collapseCatMenuService.statusUpdated.emit(false);
		if(this.metaDataInfo){
			this.metaDataInfo.unsubscribe();
		}
	}

}
