import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnInit, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, tap } from 'rxjs/operators';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { Product, Review } from 'src/app/core/models/product';
import { ProductService } from 'src/app/core/services/product.service';
import { ResizeService } from 'src/app/core/services/resize.service';
import { BreadcrumbService } from 'src/app/shared/breadcrumb/breadcrumb.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { WINDOW } from 'src/app/shared/services/window.service';
import { MobileDeviceDetectorService } from 'src/app/core/services/device-detector.service';
import { DeliveryPincodeService } from 'src/app/shared/delivery-pincode.service';
import { DeliveryPincodeModalComponent } from 'src/app/shared/delivery-pincode-modal/delivery-pincode-modal.component';
import {isEmpty, size} from 'lodash-es';

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
  screenwidth: any = isPlatformBrowser(this.platformId) ? this.window.innerWidth : 0;
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
    private router: Router,
    private route: ActivatedRoute,
    private render: Renderer2,
    private productService: ProductService,
    private cartService: CartService,
    private resizeService: ResizeService,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private breadcrumbService: BreadcrumbService,
    public device: MobileDeviceDetectorService,
    private deliveryPincodeService: DeliveryPincodeService,
    private cd: ChangeDetectorRef,
    private el: ElementRef,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
      this.calculateInnerWidth();
      this.isMobile =  this.device.isMobile() || this.screenwidth <= 992;
      this.isTablet = this.device.isTablet();
      this.isDesktop = this.device.isDesktop() || this.screenwidth >= 1024;
      this.modalOptions = {
        backdrop:'static',
        backdropClass:'loginBackdrop',
        ariaLabelledBy: 'modal-basic-title', 
        centered: true
      }
     
  }
 
  @HostListener('window:scroll', ['$event']) onscroll(event) {
    return this.isScrolledIntoView(event);
  }
  isScrolledIntoView(event) {
        const scrollTop = event.target.documentElement.scrollTop || event.target.scrollingElement.scrollTop;
        const bodyScrollTop = event.target.body.scrollTop || 0;
        const bodyBox = event.target.body.getBoundingClientRect() || 0;
        const bodyTop = bodyBox.top || 0;
        const windowHeight = this.window.innerHeight;
        const offsetY = bodyTop + bodyScrollTop - scrollTop + windowHeight - 200 < 0;
        const header = document.getElementById("navbar");
        const sticky = header.offsetHeight;
        const t = this.scrollElement.nativeElement.getBoundingClientRect()
          , o = this.targetElement.nativeElement.getBoundingClientRect()
          , $imageContainer = this._document.querySelector('.images-gallery');
       
        if (this.window.scrollY > sticky && !offsetY && (this.window.scrollY < scrollTop + t.height - 200)) {
          this.isFixed = true;
          this.render.setStyle($imageContainer, 'top', sticky + 'px');
          this.render.setStyle($imageContainer, 'width', t.width + 'px');
          this.render.removeClass($imageContainer, 'align-self-end');
          
        } else {         
          this.isFixed = false;
          this.render.removeStyle($imageContainer, 'top');
          this.render.removeStyle($imageContainer, 'width');
          
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
   
    this.initData();
    this.intiOwlCarousel();    
    
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
    if(isEmpty(this.product.discounts)){
      this.discountEnable = false;
    } else {
      this.discountEnable = true;
    } 
   
    if(size(this.product.discounts.quantity_based_discount.discount) > 4){
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
    if(this.product.shipping.smart_shipping && (this.isPincode !== null && !isEmpty(this.isPincode))){
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
    
    //.pipe(filter((event) => event.innerWidth <= 768))
    this.resizeSub = this.resizeService.onResize$.subscribe((event) => {      
      this.screenwidth = event.innerWidth;
      if(this.screenwidth >= 992){
        this.isDesktop = true;
      } else {
        this.isDesktop = false;
      }
      if (this.screenwidth <= 992) {
          this.isMobile = true;      
        } else {
          this.isMobile = false;
        }
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
        if (this.screenwidth <= 992) {
          this.isMobile = true;      
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
    if(isEmpty(pincode)){      
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
