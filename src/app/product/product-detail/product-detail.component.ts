import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, NgZone, OnInit, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { Product, Review } from 'src/app/core/models/product';
import { ProductService } from 'src/app/core/services/product.service';
import { ResizeService } from 'src/app/core/services/resize.service';
import { SessionFlow } from 'src/app/helper/session-flow';
import { BreadcrumbService } from 'src/app/shared/breadcrumb/breadcrumb.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { SeoService } from 'src/app/shared/services/seo.service';
import { environment } from 'src/environments/environment';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { WINDOW } from 'src/app/shared/services/window.service';
import { MobileDeviceDetectorService } from 'src/app/core/services/device-detector.service';
//import * as deviceDetect from 'src/app/helper/device-detect'
import { DeliveryPincodeService } from 'src/app/shared/delivery-pincode.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DeliveryPincodeModalComponent } from 'src/app/shared/delivery-pincode-modal/delivery-pincode-modal.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product;
  qty = 0;
  productAvgRating: number = 0;
  relatedProducts$: Observable<Product[]>;
  recommendedProduct$: Observable<Product[]>;
  recommendedProductSub: Subscription;
  sellerProduct$: Observable<Product[]>;
  resizeSub: Subscription;
  routerSub: Subscription;
  checkPincodeSub$: Subscription;
  totalPrice: number;
  checkPincode = '';
  delivery: {data: any, status:boolean} = {
    data: [],
    status: false
  };
  deliveryErrMsg: {data: any, msg: string, status: boolean} = {
    data: [],
    msg: '',
    status: false,
  };
  stockClass: string = '';
  variantOutputObs$ = new BehaviorSubject<any>(null);
  variantData = {};
  
  currentJustify = 'start';

  isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  isMobile: boolean = false;
  isTablet: boolean = false;
  isDesktop: boolean = false;
  screenwidth: any;

  breadcrumbData: { displayName: string, route: string, terminal: boolean, url: string } = {
    displayName: '',
    route: '',
    terminal: true,
    url: ''
  };
  breadcrumbSubData: { displayName: string, route: string, terminal: boolean, url: string } = {
    displayName: '',
    route: '',
    terminal: true,
    url: ''
  };
  breadcrumbCategory: any = [];
  breadcrumbSubCategory: any = [];
  categories: any = [];
  schema: any;
  listReviews: Array<Review>;
  productOption: any = {};
  discountEnable = false;
  coupon = false;
  isQtyDiscountSlider = false;

  public options: OwlOptions = {
      loop: false,
      autoplay: false,
      autoWidth: true,
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
  };
  @Input('customOption') customOption: OwlOptions = {
    loop: false,
    autoplay: false,
    lazyLoad:true,
    margin: 5,
    merge: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,    
    nav: true,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 3,
      },
    },
  };

  benefitOpt: OwlOptions;
  discountOpt: OwlOptions;
  
  benefitsData = [ 
    {
      id: 'benefit-1',
      icon: 'assets/images/benefits/support-copy.svg',
      text: '24 x 7 Support'
    },
    {
      id: 'benefit-2',
      icon: 'assets/images/benefits/thumbs-up.svg',
      text: 'Homegrown Brands'
    },
    {
      id: 'benefit-3',
      icon: 'assets/images/benefits/password.svg',
      text: 'Secure Payments'
    },
    {
      id: 'benefit-4',
      icon: 'assets/images/benefits/receipt.svg',
      text: 'GST Invoice'
    },
    {
      id: 'benefit-5',
      icon: 'assets/images/benefits/return-purchase.svg',
      text: 'Easy Returns'
    },
    {
      id: 'benefit-6',
      icon: 'assets/images/benefits/floating-island-factory.svg',
      text: 'MSME Supported'
    }
  ]
  @ViewChild('stockText') stockText:ElementRef;
  public isFixed: boolean = false;
  @ViewChild('target') private targetElement: ElementRef;
  @ViewChild('scrollContainer') private scrollElement: ElementRef;
  
  isPincode = isPlatformBrowser(this.platformId) ? localStorage.getItem('delivery_pincode') : null;
  isPincode$ = new BehaviorSubject<any>(null);
  isShowPincode = false;
  pincodeUpdateQty = false;
  modalOptions:NgbModalOptions;
  constructor(
    private render: Renderer2,
    @Inject(DOCUMENT)
    private _document: Document,
    @Inject(WINDOW) private window: Window,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private meta: Meta,
    private title: Title,
    private el: ElementRef,
    private mobileDetect: SessionFlow,
    private resizeService: ResizeService,
    private seoService: SeoService,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private breadcrumbService: BreadcrumbService,
    public device: MobileDeviceDetectorService,
    private cd: ChangeDetectorRef,
    private deliveryPincodeService: DeliveryPincodeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
      //this.isMobile = this.mobileDetect.isMobile;
      // console.log(this.mobileDetect);
      this.isMobile =  this.device.isMobile();
      this.isTablet = this.device.isTablet();
      this.isDesktop = this.device.isDesktop();
      this.modalOptions = {
        backdrop:'static',
        backdropClass:'loginBackdrop',
        ariaLabelledBy: 'modal-basic-title', 
        centered: true
      }
      // console.log('Device Info',this.device.getDeviceInfo());
      // console.log('Device Info',deviceDetect.useDevice());
  }
  
  // @HostListener('window:scroll', ['$event']) onScroll(){
  //   return this.isScrolledIntoView();
  // }
  @HostListener('window:scroll', ['$event']) onscroll(event) {
    return this.isScrolledIntoView(event);
  }
  isScrolledIntoView(event) {
        console.log('scrolling element',event.target.scrollingElement.scrollTop);
        console.log('document',event.target.documentElement.scrollTop);
        console.log('inner Height',window.innerHeight);
        // console.log('client top',event.target.clientTop);
        // console.log('client Height',event.target.clientHeight);
        // console.log('offset top',event.target.offsetTop);
        // console.log('offset width',event.target.offsetWidth);
        // console.log('offset Height',event.target.offsetHeight);
        console.log('body scrolltop',event.target.body.scrollTop);
        console.log('body get rect',event.target.body.getBoundingClientRect());
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop);
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop - event.target.documentElement.scrollTop);
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop - event.target.documentElement.scrollTop);
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop - event.target.documentElement.scrollTop + window.innerHeight);
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop - event.target.documentElement.scrollTop + window.innerHeight - 200);
        console.log('document',event.target.body.getBoundingClientRect().top + event.target.body.scrollTop - event.target.documentElement.scrollTop + window.innerHeight - 200 < 0);
        const header = document.getElementById("navbar");
        const sticky = header.offsetHeight;     
        const t = this.scrollElement.nativeElement.getBoundingClientRect()
          , e = t.top >= 0
          , n = t.bottom <= this.window.innerHeight
          , o = this.targetElement.nativeElement.getBoundingClientRect()
          , i = o.top >= 0
          , r = o.bottom  <= this.window.innerHeight
          , b = t.bottom <= o.bottom
          , $imageContainer = this._document.querySelector('.images-gallery');
       
        // if((e && n || !e && n) && (i && r || !i && r) && b){
        //   this.isFixed = false;
        //   this.render.addClass($imageContainer, 'align-self-end');
        //   this.render.removeClass($imageContainer, 'align-self-start');
        // } else {
        //   this.isFixed = true;
        //   this.render.removeClass($imageContainer, 'align-self-end');
        //   this.render.addClass($imageContainer, 'align-self-start');
        // }
        //&& (this.window.scrollY < t.bottom - 25) 
        //console.log('scrolly = ', this.window.scrollY + ' sticky = ', sticky + ' height = ', t.height + ' bottom = ', t.bottom);
        
        if ( (this.window.scrollY > sticky ) && this.window.scrollY < t.height - 200){
          this.isFixed = true;
          this.render.setStyle($imageContainer, 'top', sticky + 'px');
          this.render.setStyle($imageContainer, 'width', t.width + 'px');
          this.render.removeClass($imageContainer, 'align-self-end');
          
        } else {
         
          this.isFixed = false;
          this.render.removeStyle($imageContainer, 'top');
          this.render.removeStyle($imageContainer, 'width');
          // //(Math.abs(t.top) < t.height) && 
          // if(this.window.scrollY > t.bottom){
          //   //this.render.setStyle($imageContainer, 'align-self', 'flex-center');
          //   this.render.addClass($imageContainer, 'align-self-end');
           
          // } else {
          //   //this.render.setStyle($imageContainer, 'align-self', 'flex-start');
          //   this.render.removeClass($imageContainer, 'align-self-end');
          // }
          
        }
        const productSticky = this.el.nativeElement?.querySelector('.product__sidebar .inner-content');
        if(productSticky){
          if(productSticky?.classList.contains('sticky')){
            const container = this.el.nativeElement?.querySelector('.container');
            const element = container.getBoundingClientRect();
            const left = (element.right - element.width) + 15;
            this.render.setStyle(productSticky, 'right',  Math.abs(left) + 'px');
          } else {
            this.render.removeStyle(productSticky, 'right');
          }
        }
        
    //}
}
  ngOnInit(): void {
    // if(this.isPincode !== null){
    //   this.isShowPincode = true;
    //   this.loadingPincode = true;
    // } else {
    //   this.isShowPincode = false;
    //   this.loadingPincode = false;
    // }
    this.addMetaInfo(this.product);
    this.setJsonSchema(this.product);
    this.initData();
    this.intiOwlCarousel();    
    this.calculateInnerWidth();   
    this.checkPincodeSub$ = this.deliveryPincodeService.pincodeObs$.pipe(       
        filter(pincode => pincode!==null),
        tap(pincode =>{          
          this.cartService.pincode= pincode;
          this.isPincode = pincode;
          this.isPincode$.next(pincode);         
          this.pincodeUpdateQty = false;
          if(this.product.shipping.smart_shipping){            
            if(!this.pincodeUpdateQty && this.qty > 0){
              this.isLoading.next(true);
              this.deliveryErrMsg = {data: [], msg: '', status: false};
              this.delivery = {data:[], status:false};
              if(this.product.has_variants){
                this.variantOutputObs$.pipe(filter(res => res !==null),take(1)).subscribe(data => {
                  if(data && data.shipping.smart_shipping){
                    let formData = {
                      "product_id": this.product.id,
                      "seller_id": this.product.seller.id,
                      "pincode": pincode,
                      "variant_id" : data.id,
                      "qty": this.qty
                    };            
                    this.postDeliveryPincode(formData);
                  }
                });
              } else {
                let formData = {
                  "product_id": this.product.id,
                  "seller_id": this.product.seller.id,
                  "pincode": pincode,
                  "qty": this.qty
                };                 
                this.postDeliveryPincode(formData)
              }
             
            }
          }   
          
        })
      ).subscribe();
    //}
    
    
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {    
    this.calculateInnerWidth();
    this.initData();
    this.productService.getProductReviews(this.product.slug).subscribe(reviews => {			
      this.listReviews = reviews;			
    });   
  }
  intiOwlCarousel(){
    this.benefitOpt = {...this.customOption, autoWidth: false};
    this.discountOpt = this.customOption;
    this.discountOpt.autoWidth = true;
    this.discountOpt.margin = 4;
    this.discountOpt.responsive = {
      0: {
        items: 4,
      },
      400: {
        items: 4,
      },
    }
  }
  initData() {
    //console.log('product Data',this.product);
    if(_.isEmpty(this.product.discounts)){
      this.discountEnable = false;
    } else {
      this.discountEnable = true;
    } 
   
    if(_.size(this.product.discounts.quantity_based_discount.discount) > 4){
      this.isQtyDiscountSlider = true;
    } else {
      this.isQtyDiscountSlider = false;
    }
    Object.assign(this.product, {applied_coupon: {product_based: false, qty_based: false}});
    this.breadcrumbCategory = [];
    this.breadcrumbSubCategory = [];

    //this.product.is_featured = true;

    this.breadcrumbService.changeBreadcrumb(
      this.route.snapshot,
      this.product.name
    );

    if(this.product.category){
      this.breadcrumbData.displayName = this.product.category.name;
      this.breadcrumbData.url = this.product.category.slug; 
      this.breadcrumbData.terminal = false;
      this.breadcrumbCategory.push(this.breadcrumbData);
    }

    if(this.product.sub_category){
      this.breadcrumbSubData.displayName = this.product.sub_category.name;
      this.breadcrumbSubData.url = this.product.sub_category.slug;
      this.breadcrumbSubData.terminal = false;
      this.breadcrumbSubCategory.push(this.breadcrumbSubData);
    }
    
    this.productAvgRating = this.ratingPercentCalc(
      this.product.rating_summary.average_rating,
      this.product.rating_summary.review_count
    );

    if(this.product.stock.stock_status == "In Stock"){
      this.stockClass = 'text-secondary';
    }

    if(this.product.stock.stock_status == "Out of Stock"){
      this.stockClass = 'text-danger';
    }

    this.recommendedProduct$ = this.productService.getRecommendedProducts(this.product.slug);
   
    this.sellerProduct$ = this.productService.getSellerProducts(this.product.slug);
  }
  updateQty($qty){
    this.pincodeUpdateQty = true;
    this.qty = $qty;
    const qty = $qty;   
    if(this.product.shipping.smart_shipping && (this.isPincode !== null && !_.isEmpty(this.isPincode))){
      this.isLoading.next(true); 
      this.deliveryErrMsg = {data: [], msg: '', status: false};
      this.delivery = {data:[], status:false};  
      if(this.product.has_variants){
        this.variantOutputObs$.pipe(filter(res => res !==null),take(1)).subscribe(data => {          
          if(data && data.shipping.smart_shipping){
            let formData = {
              "product_id": this.product.id,
              "seller_id": this.product.seller.id,
              "pincode": this.isPincode,
              "variant_id" : data.id,
              "qty": qty
            };            
            this.postDeliveryPincode(formData);
          }
        });
      } else {
        let formData = {
          "product_id": this.product.id,
          "seller_id": this.product.seller.id,
          "pincode": this.isPincode,
          "qty": qty
        };                 
        this.postDeliveryPincode(formData)
      }
     
    }
    

  }
  updateStockStatus(event){
    //console.log(event);
    let ele = this._document.getElementById('stockText');
    ele.textContent = event;
    
    if(event == "In Stock"){
      this.stockClass = 'text-secondary';
    } 
    if(event == "Out of Stock"){
      this.stockClass = 'text-danger';
    }
  }
  toggle(element: HTMLElement) {
    element.classList.toggle('show');
  }
  // toggle(collapse) {
  //   collapse.show = !collapse.show;
  // }
  calculateInnerWidth() {
   
    if (isPlatformBrowser(this.platformId)) {
      this.screenwidth = window.innerWidth;
    } 
   
    //.pipe(filter((event) => event.innerWidth <= 768))
    this.resizeSub = this.resizeService.onResize$.subscribe((event) => {      
      this.screenwidth = event.innerWidth;     
      const $imageContainer = this._document.querySelector('.images-gallery');
      if($imageContainer){
        this.isFixed = false;
        this.render.removeAttribute($imageContainer, 'style');
        //this.onScroll();
      }
     
    });
    
    this.routerSub = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd ),
      debounceTime(1000),
      distinctUntilChanged()
    )
    .subscribe((event: NavigationEnd) => {     
      if(event instanceof NavigationEnd){
        if (this.screenwidth <= 800) {
          this.isMobile = this.mobileDetect.isMobile;      
        } else {
          this.isMobile = false;
        }
      }      
    });
  }

  addTocart(product): void {
    this.cartService.addProduct(product.slug, 1,product.seller.id, {}, false);
  }

  ratingPercentCalc(rating: number, total_users: number) {
    if (total_users > 0) return (rating / (total_users * 5)) * 100;
    return 0;
  }

  get discount() {
    return Math.ceil(
      +this.product.price - +this.product.special_price
    );
  }

  get discountPercent() {
    return `${Math.ceil(
      (this.discount / +this.product.price) * 100
    )}%`;
  }

  couponApply(coupon){
    if(coupon && !this.product.applied_coupon['qty_based']){
      this.totalPrice= 0;
      this.product.applied_coupon['product_based'] = true;      
    } else {
      this.product.applied_coupon['product_based'] = false;
    }
    if(coupon && this.product.applied_coupon['qty_based']){
      this.toastrService.info('Coupon already applied!', 'Info!');
    } 
  }
  updateCoupon(isCoupon){ 
    if(isCoupon?.qty_based){
      this.coupon = false;
      this.product.applied_coupon['product_based'] = false;
      this.product.applied_coupon['qty_based'] = true;      
    } else {
      if(this.coupon == !isCoupon?.qty_based){
        this.coupon = true;
        this.product.applied_coupon['product_based'] = true;       
      }
      this.product.applied_coupon['qty_based'] = false;
    }
  }
  updateProduct(e) {
    //console.log("Emit", e);
    
    this.variantOutputObs$.next(e);
    this.productOption = e;
    this.product.price = e.price;
    this.product.sku = e.sku;
    this.product.slug = e.slug;
    this.product.special_price = e.special_price;
    this.product.stock = e.stock;

    if(e.stock.stock_status == "In Stock"){
      this.stockClass = 'text-secondary';
    }
    if(e.stock.stock_status == "Out of Stock"){
      this.stockClass = 'text-danger';
    }
    if(this.product.has_variants){
      this.variantData = e;
    }
    
  }
  addMetaInfo(product: Product) {  
    
    this.meta.updateTag({
      name: 'description',
      content: product.seo.description,
    });

    this.meta.updateTag({
      name: 'keywords',
      content: product.seo.keywords,
    });
    const url = environment.frontEndUrl + '/' + product.slug;
    let productImages = product.media.front_image as string;
   
    this.meta.updateTag({ property: 'og:title', content: product.seo.title });
    this.meta.updateTag({ property: 'og:site_name', content: environment.config.appName });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:description', content: product.seo.description });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:image', content: productImages });
    this.meta.updateTag({ property: 'og:image:width', content: '600' });
    this.meta.updateTag({ property: 'og:image:height', content: '600' });
    this.meta.updateTag({ property: 'og:image', content: productImages });
    this.meta.updateTag({ property: 'og:image:alt', content: product.name });

    this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ property: 'twitter:site', content: '@tradesala' });
    this.meta.updateTag({ property: 'twitter:url', content: url });
    this.meta.updateTag({ property: 'twitter:title', content: product.seo.title });
    this.meta.updateTag({ property: 'twitter:description', content: product.seo.description });
    this.meta.updateTag({ property: 'twitter:image', content: productImages });

    this.title.setTitle(this.product.seo.title);

    if(environment.staging){
      this.meta.updateTag({
        name: 'robots',
        content: 'noindex, nofollow',
      });
    }
  }
  setJsonSchema(product: Product) {    
    const stockStatus = (product.stock.stock_status == 'In Stock') ? 'InStock' : 'OutOfStock';
    this.schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      url: isPlatformBrowser(this.platformId) ? location.href : '',
      itemCondition: 'https://schema.org/NewCondition',
      brand: {
        '@type': 'Brand',
        name: `${product.brand.name}`
      },      
      description: product.seo.description,
      name: product.name,
      image: product.media.front_image,
      offers: [
        {
          '@type': 'Offer',
          itemCondition: 'https://schema.org/NewCondition',
          availability: `https://schema.org/${stockStatus}`,
          price: product.special_price,
          priceCurrency: 'INR'
        }
      ]

    };
    if(product.rating_summary.review_count > 0){
      const review = {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating_summary.average_rating,
          reviewCount: `${product.rating_summary.review_count}`
        }
      };
      this.schema = {...this.schema, ...review}
    }
    this.seoService.setJsonLd(this.schema);
  }
  typePincode(e){    
    const errElement = this._document.getElementById('errPincode');    
    if(e.type === 'keyup'){      
      if (((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) && e.target.value.length <= 6) {
        errElement.innerText = '';        
        return true;
      } else if(e.keyCode === 8 && e.target.value.length >= 5 && e.target.value.length <= 6){
        errElement.innerText = '';
        return true;
      }else {      
        errElement.innerText = 'Please enter valid pincode';      
        return false;
      }
    } else if(e.type === 'change'){     
      if(e.target.value.length >= 5 && e.target.value.length <= 6){
        errElement.innerText = '';       
        return true;
      } else {
        errElement.innerText = 'Please enter valid pincode';      
        return false;
      }
    }
     
   
  }
  checkPincodeAvailabilty(pincode, product_id, seller_id){
    const errElement = this._document.getElementById('errPincode');
    if(_.isEmpty(pincode)){      
      errElement.innerText = 'Please enter pincode';      
      return false;
    }
    else {
      errElement.innerText = '';
      let formData = {
        "product_id": product_id,
        "seller_id": seller_id,
        "pincode": pincode
      };
      if(this.variantData){
        formData = {...formData, ...{variant_id: this.variantData['id']}}
      }
      //this.isLoading = true;
      if(isPlatformBrowser(this.platformId)){
        localStorage.removeItem('delivery_pincode');
        localStorage.setItem('delivery_pincode', pincode);
      }
      this.deliveryPincodeService.pincodeSub.next(pincode);
      this.isPincode=pincode;
      //this.postDeliveryPincode(formData)
    }
   
  }
  showPincode(event){   
    this.isShowPincode = true;   
  }
  openDeliveryModalPopup(){
    if(!this.modalService.hasOpenModals()){     
      this.modalService.open(DeliveryPincodeModalComponent, this.modalOptions);
    }
  }
  postDeliveryPincode(formData){    
    this.productService.checkPincode(formData).subscribe((res) => {
      if(res.status){        
        this.isLoading.next(false);
        this.delivery = res;       
        this.deliveryErrMsg = {data: [], msg: '', status: false};       
        this.cd.detectChanges();
      } else {
        this.isLoading.next(false); 
        this.delivery = {data:[], status:false};
        this.deliveryErrMsg = res;        
        this.cd.detectChanges();
      }
    }, (error) => {
      console.log(error);
    })
    
  }
  resetObjectKeys(object: Object){
    for (var key in object){     
      if (object.hasOwnProperty(key)){
          if (typeof object[key] === 'string'){
            object[key] = '';
          } else if (object[key] instanceof Boolean){
            object[key] = false;
          } else if (object[key] instanceof Array) {
            object[key] = [];
          } // else ???  Not sure how you want to handle other types
      }
    
    }
    return object;
  }
  ngOnDestroy(){    
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
    if(this.checkPincodeSub$){
      this.checkPincodeSub$.unsubscribe();
    }
  }
}
