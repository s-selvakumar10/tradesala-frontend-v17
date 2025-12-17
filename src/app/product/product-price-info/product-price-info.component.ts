
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, Location} from '@angular/common';
import { Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription} from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from 'src/app/auth/user.model';
import { Product } from 'src/app/core/models/product';
import { Wishlist } from 'src/app/core/models/wishlist';
import { AuthService } from 'src/app/auth/auth.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { WishlistService } from 'src/app/shared/services/wishlist.service';
import { NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from 'src/app/shared/login-popup/login-popup.component';
import { SellerOfferPopupComponent } from '../modal-box/seller-offer-popup/seller-offer-popup.component';


@Component({
  selector: 'app-product-price-info',
  templateUrl: './product-price-info.component.html',
  styleUrls: ['./product-price-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPriceInfoComponent implements OnChanges {
  
  @Input() product: Product;
  @Output() productEmit = new EventEmitter();
  @Output() quantityEmit = new EventEmitter();
  @Output() stockStatus = new EventEmitter<string>();
  @Output() checkCoupon = new EventEmitter<{}>();
  stockClass:string = '';
  productQty: number = 1;
  sellerDetails: any[];
  sellerDiscounts: any[];
  inStock: boolean = true;
  noReturnAlert: boolean = false;
  subTotal:number = 0;
  shareUrl: string = "";
  shareImage: string | boolean = "";
  shareDesc: string = '';
  closeResult = '';

  private userSub: Subscription;
  isAuthenticated: Boolean = false;
  user: User;
  wishlists: Array<Wishlist>;
  modalOptions:NgbModalOptions;
  productInCartCount: number = 0;
  //lineItemsSub = new Subject<any>();
  lineItemsSub: BehaviorSubject<any[]> =  new BehaviorSubject<any>([]);
  lineItemsObs$ = this.lineItemsSub.asObservable();
  linesItems: any;
  variantProduct: any;
  navigateToCart: boolean;
  seller_coupon = false;

  constructor(
    private location: Location,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private readonly document: any,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'loginBackdrop',
      ariaLabelledBy: 'modal-basic-title',
      centered: true
    }
  }

  ngOnInit(): void {
    //console.log(this.product);
    //this.getCartProducts();
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      this.user = user;
    });
    //this.variantProduct = this.product?.variants?.length > 0 ? this.product?.variants : this.product;
    this.product.attributes?.forEach((element: any) => {
      element.selectedValue = element.items[0]; 
    });
    let tempAttr: any = this.product.attributes[0];    
    if (tempAttr?.selectedValue) {
      this.changeVariants(tempAttr, tempAttr.selectedValue);
    } else {
      this.showSellerDetails(null);
    }
    this.subTotal = this.product.special_price;

    if (isPlatformBrowser(this.platformId)) {
      this.shareDesc = this.product.summary.replace(/<[^>]*>/g, '');
      this.shareUrl = this.getUrl();
      this.shareImage = this.product.media.front_image;
    }
    
    this.productQty = this.product?.stock?.minimum_order;
    this.subTotal = this.product.special_price * this.productQty;
  }
  ngOnChanges():void {
    this.ngOnInit();
    this.quantityEmit.emit(this.productQty);
    //this.subTotal = this.product.special_price * this.productQty;
  }
  getUrl(): string {
    return `${this.document.location.origin}` + `${this.location.path()}`;
  }
 
  toggle(element: HTMLElement) {
    element.classList.toggle('show');
  }

  incrementQty() {
    
    if(this.product.stock.total_on_hand > 0) {     
      if (this.product.stock.total_on_hand < (this.productQty + 1) ) {
        this.checkMinQtyOnTotalQty();
      } else {
        let qtyLeft = this.product.stock.total_on_hand - this.productInCartCount;
        if((this.productQty + 1) > qtyLeft){          
          this.product.stock.stock_status = "Out of Stock";
          this.stockClass = this.product.stock.stock_status;
          this.toastrService.warning('' + this.product.stock.stock_status, 'Warning!');
        }

        if (this.productInCartCount > this.product.stock.maximum_order) {
          this.toastrService.warning('Maximum allowed qty is ' + this.product.stock.maximum_order, 'Warning!');
        }

        if ((this.productQty + 1) > this.product.stock.maximum_order) {
          this.toastrService.warning('Maximum allowed qty is ' + this.product.stock.maximum_order, 'Warning!');
        } else {
          this.productQty = this.productQty + 1;
          this.subTotal = this.product.special_price * this.productQty;
        }
        this.bulkOrderAlert();
      }
    } else {
      this.stockClass = this.product.stock.stock_status;     
      this.toastrService.warning('' + this.product.stock.stock_status, 'Warning!');
    }  
    this.qtyBasedDiscounts(this.product);  
    this.stockStatus.emit(this.stockClass);
    this.quantityEmit.emit(this.productQty);
  }

  decrementQty() {        
    this.productQty = this.productQty - 1;
    let productQty = this.product?.stock?.minimum_order;
    let status = false;

    if (this.productQty < productQty) {
      this.productQty = productQty;
      status = true;
    } else {
      status = false;
    }
    if(status){
      if(this.product.stock.total_on_hand > 0) {
        this.toastrService.warning('Minimum qty is ' + productQty, 'Warning!', {timeOut: 800,});
        this.product.stock.stock_status = "In Stock";
      }
    }
    if(this.productQty > 0) {
      this.subTotal = this.product.special_price * this.productQty;
    }
    this.qtyBasedDiscounts(this.product);
    this.quantityEmit.emit(this.productQty);
    return status;
  }

  changeQty() {
    this.productQty = Number(this.productQty);    
    this.qtyBasedDiscounts(this.product);
    if (this.product.stock.total_on_hand < this.productQty ) {
      this.checkMinQtyOnTotalQty();
    } else {
      if (this.productQty < this.product?.stock?.minimum_order) {
        this.productQty = this.product?.stock?.minimum_order;
      } else if (this.productQty > this.product.stock.maximum_order) {       
        this.toastrService.warning('Maximum allowed qty is ' + this.product.stock.maximum_order, 'Warning!', {timeOut: 800,});
      }
      this.subTotal = this.product.special_price * this.productQty;
      this.bulkOrderAlert();
    }
    this.quantityEmit.emit(this.productQty);
  }
  checkMinQtyOnTotalQty(){    
    
    let qtyLeft = this.product.stock.total_on_hand - this.productInCartCount;
   
    if(this.productQty >= qtyLeft && qtyLeft > 0){
      this.product.stock.total_on_hand = qtyLeft;      
      this.product.stock.stock_status = "In Stock";
      this.stockClass = this.product.stock.stock_status;
      this.toastrService.info('Only ' + qtyLeft + ' items left on stock.', 'Warning!');
      
    } else {     
      this.product.stock.stock_status = "Out of Stock";  
      this.stockClass = this.product.stock.stock_status;    
      this.toastrService.warning('' + this.product.stock.stock_status, 'Warning!');
    }    
    this.stockStatus.emit(this.stockClass);
  }
  bulkOrderAlert(){
    if ((this.productQty > this.product.stock.bulk_order) && !this.noReturnAlert) {
      this.noReturnAlert = true;
      this.toastrService.info("Product not returnable if quantity is more than " + this.product.stock.bulk_order, 'Note!');
    }
  }
  outOfStockValidation() {
    if (this.productInCartCount + this.productQty > this.product.stock.total_on_hand) {
      this.product.stock.stock_status = "Out of Stock"
      this.inStock = false;
      this.toastrService.warning('Out of Stock ', 'Warning!', {timeOut: 800,});
    } else {
      this.product.stock.stock_status = "In Stock"
      this.inStock = true;
    }
  }
  getCartProducts() {
   
    this.cartService.products.subscribe(products => {
     
      this.lineItemsSub.next(products);     
      if (products?.length > 0) {
        this.productInCartCount = products?.find(e => e.id == this.product.id)?.qty || 0; 
                
        // if(typeof this.variantProduct !== 'undefined'){         
        //   this.linesItems = products.filter(x => x.variant_id == this.variantProduct.id);          
        // } else {
        //   this.linesItems = products.filter(x => x.id == this.product.id);
        // }        
      } else {
        this.productInCartCount = 0;
        //this.linesItems = [];
        if(this.product.stock.total_on_hand > 0){
          this.product.stock.stock_status = "In Stock"; 
          this.stockClass = this.product.stock.stock_status;         
        } else {
          this.product.stock.stock_status = "Out of Stock";
          this.stockClass = this.product.stock.stock_status;
        }
        
        this.stockStatus.emit(this.stockClass);
      }
    }, err => {
      this.productInCartCount = 0;
      //this.linesItems = [];
    })

  }

  changeVariants(data, each) {
    data.selectedValue = each;
    let combination = this.product.attributes?.map((e: any) => e.id + "-" + e.selectedValue?.id);
    let selectedCombination: any = this.product.variants?.find(e => e.attributes.every(x => combination.includes(x.attribute_id + "-" + x.attribute_value_id)))
    if (selectedCombination) {
      this.variantProduct = selectedCombination;
      this.stockClass = selectedCombination.stock.stock_status;
      this.subTotal = selectedCombination.special_price
    
      this.stockStatus.emit(this.stockClass);
      this.productEmit.emit(selectedCombination);
      this.showSellerDetails(selectedCombination); //  Seller info for variant product
    } else{
      this.toastrService.info('Stock is not available!', 'Warning!');
    }
  }
  cartStockStatus(product, sellerId, buyNow: boolean = false, sellerType: boolean = false){
    //this.getCartProducts();
    
    this.lineItemsObs$.pipe(take(1)).subscribe((cartItem) => {      
      if(cartItem.length){        
        const cartItemExist = cartItem.reduce(function (items, item, idx, arr) {            
          let exist = false;
          if(!product.has_variants) {
            if(item.variant_id == null && item.id == product.id && item.sellerId == product.seller.id){
              exist = true;
            } else {
              exist = false;
            }
          }
          if(product.has_variants) {
            if(item.id == product.id && item.variant_id == product.variant_id && item.sellerId == product.seller.id) {
              exist = true;
            } else {
              exist = false;
            }
          }        
         
          Object.assign(item, {exist: exist});       
          items =  Object.assign({cartData: arr}, {exist:exist});         
          return items;
        
        }, []);
        //console.log('cartItemExist', cartItemExist);
        if(cartItemExist.exist){
          cartItemExist.cartData.find((item: any) => {       
            if(item.exist){
              this.onChangeCheckCartItems(item, product, sellerId, buyNow, sellerType);
            }
          });
        } else {
          this.firstItemsOnCart(product, sellerId, buyNow, sellerType);
        }
      } else {
        this.firstItemsOnCart(product, sellerId, buyNow, sellerType);
      }
    });
    //if(this.linesItems?.length > 0){
      
      // this.linesItems.find((item: any) => {       
      //   if(!product.has_variants) {
      //     if(item.variant_id == null && item.id == product.id && item.sellerId == product.seller.id){
      //       console.log("Cart Items Found exist on Non Variants", product);
      //       this.onChangeCheckCartItems(item, product, sellerId, buyNow, sellerType);
      //     } else {
      //       console.log("Cart Items Found first time on Non Variants", product);
      //       this.firstItemsOnCart(product, sellerId, buyNow, sellerType);            
      //     }
      //   } 
      //   if(product.has_variants) {
      //     if(item.id == product.id && item.variant_id == product.variant_id && item.sellerId == product.seller.id) {
      //       console.log("Cart Items Found exist on Variants", product);
      //       this.onChangeCheckCartItems(item, product, sellerId, buyNow, sellerType);            
      //     } else {
      //       console.log("Cart Items Found first time on Variants", product);
      //       this.firstItemsOnCart(product, sellerId, buyNow, sellerType);
      //     }
          
      //   }  
      // });
      
    //} else {
    //  console.log("Cart Items not Found first time", product);
      //this.firstItemsOnCart(product, sellerId, buyNow, sellerType);
    //}

  }
  firstItemsOnCart(product, sellerId, buyNow, sellerType) {
    
    let navigateToCart: boolean = false;
    let productSlug:string = product.slug;
    if ((product.stock.total_on_hand < this.productInCartCount) || product.stock.total_on_hand === 0) {
      
      let qtyLeft = product.stock.total_on_hand - this.productInCartCount;

      if(qtyLeft > 0 && this.productQty > qtyLeft){
        navigateToCart = false;
        this.toastrService.info('Only ' + qtyLeft + ' items left on stock.', 'Warning!');
        product.stock.stock_status = "In Stock";
        this.stockClass = product.stock.stock_status;
      } else {
        navigateToCart = false;
        this.toastrService.warning('Out of stock', 'Warning!');
        product.stock.stock_status = 'Out of Stock';
        this.stockClass = product.stock.stock_status;
      }
      if(!sellerType){
        this.stockStatus.emit(this.stockClass);
        this.productEmit.emit(product);
      }
      

    } else {
      let maxQty = (this.productQty > product.stock.maximum_order);
      let bulkOrder = (this.productQty > product.stock.bulk_order);
      
      if(maxQty || bulkOrder){
        if(maxQty && bulkOrder){
          navigateToCart = false;
          this.toastrService.warning('Maximum allowed qty is ' + product.stock.maximum_order, 'Warning!');
          this.toastrService.info("Product not returnable if quantity is more than " + product.stock.bulk_order, 'Note!');
        } else if (maxQty) {
          navigateToCart = false;
          this.toastrService.warning('Maximum allowed qty is ' + product.stock.maximum_order, 'Warning!');
        } else if (bulkOrder) {
          navigateToCart = true;
          this.toastrService.info("Product not returnable if quantity is more than " + product.stock.bulk_order, 'Note!');
        } else {
          navigateToCart = false;
        }
        
      } else {
        navigateToCart = true;
      }      
      if(product.stock.total_on_hand > 0){
        product.stock.stock_status = 'In Stock';
        this.stockClass = product.stock.stock_status;      
      } else {
        product.stock.stock_status = 'Out of Stock';
        this.stockClass = product.stock.stock_status;
      }
      if(!sellerType) {
        this.stockStatus.emit(this.stockClass);
        this.productEmit.emit(product);
      }
    }

    if (navigateToCart) {

      if(buyNow){
        this.cartService.addProduct(productSlug, this.productQty, sellerId, product.applied_coupon, buyNow);
        setTimeout(() => {
          this.router.navigate(['/checkout/checkoutDetails']);
        }, 500);
      } else {
        this.cartService.addProduct(productSlug, this.productQty, sellerId, product.applied_coupon, buyNow);
        return true;
      }

    }
  }
  onChangeCheckCartItems(item, product, sellerId, buyNow, sellerType) {
   
    let prodQty = (item.qty + this.productQty) || (this.productInCartCount + this.productQty);
    let navigateToCart: boolean = false;
    let productSlug:string = product.slug;    
    
    if ((item.product.stock.total_on_hand < prodQty) || item.product.stock.total_on_hand === 0) {
      
      let qtyLeft = item.product.stock.total_on_hand - item.qty;
      if((this.productQty > qtyLeft) && qtyLeft !== 0) {
        navigateToCart = false;
        this.toastrService.info('Only ' + qtyLeft + ' items left on stock.', 'Warning!');
        item.product.stock.stock_status = "In Stock";
        product.stock.stock_status = "In Stock";
        this.stockClass = product.stock.stock_status;
      } else {
        navigateToCart = false;
        this.toastrService.warning('Out of stock', 'Warning!');
        item.product.stock.stock_status = 'Out of Stock';
        product.stock.stock_status = 'Out of Stock';
        this.stockClass = product.stock.stock_status;
      }
      if(!sellerType) {
        this.stockStatus.emit(this.stockClass);
        this.productEmit.emit(product);
      }
      // let maxQty = ((item.qty + this.productQty) > item.product.stock.maximum_order);
      // let bulkOrder = ((item.qty + this.productQty) > item.product.stock.bulk_order);
      // if(maxQty || bulkOrder){
      //   if(maxQty && bulkOrder){
      //     navigateToCart = false;
      //     this.toastrService.warning('Maximum allowed qty is ' + item.product.stock.maximum_order, 'Warning!');
      //     this.toastrService.info("Product not returnable if quantity is more than " + this.product.stock.bulk_order, 'Note!');
      //   } else if(maxQty){
      //     navigateToCart = false;
      //     this.toastrService.warning('Maximum allowed qty is ' + item.product.stock.maximum_order, 'Warning!');
      //   } else if (bulkOrder) {
      //     navigateToCart = true;
      //     this.toastrService.info("Product not returnable if quantity is more than " + this.product.stock.bulk_order, 'Note!');
      //   } else {
      //     navigateToCart = false;
      //   }
      // } else {
      //   navigateToCart = true;
      // }
      
      
    } else {
      
      let maxQty = ((item.qty + this.productQty) > item.product.stock.maximum_order);
      let bulkOrder = ((item.qty + this.productQty) > item.product.stock.bulk_order);

      if (maxQty || bulkOrder) {
        if(maxQty && bulkOrder){
          navigateToCart = false;
          this.toastrService.warning('Maximum allowed qty is ' + item.product.stock.maximum_order, 'Warning!');
          this.toastrService.info("Product not returnable if quantity is more than " + this.product.stock.bulk_order, 'Note!');
        } else if (maxQty){
          navigateToCart = false;
          this.toastrService.warning('Maximum allowed qty is ' + item.product.stock.maximum_order, 'Warning!');
        } else if (bulkOrder) {
          navigateToCart = true;
          this.toastrService.info("Product not returnable if quantity is more than " + this.product.stock.bulk_order, 'Note!');
        } else {
          navigateToCart = false;
        }
         
      } else {
        navigateToCart = true;
      }
      
      if(item.product.stock.total_on_hand > 0){
        item.product.stock.stock_status = 'In Stock';
        product.stock.stock_status = 'In Stock';  
        this.stockClass = product.stock.stock_status;     
      } else {
        item.product.stock.stock_status = 'Out of Stock';
        product.stock.stock_status = 'In Stock';
        this.stockClass = product.stock.stock_status;
      }
      if(!sellerType){
        this.stockStatus.emit(this.stockClass);
        this.productEmit.emit(product);
      }
    }
    if (navigateToCart) {
      if(buyNow){
        this.cartService.addProduct(productSlug, this.productQty, sellerId, product.applied_coupon, buyNow);
        setTimeout(() => {
          this.router.navigate(['/checkout/checkoutDetails']);
        }, 500);
      } else {
        this.cartService.addProduct(productSlug, this.productQty, sellerId, product.applied_coupon, buyNow);
        return true;
      }

    }
  }
  qtyBasedDiscounts(product){
    let usedQtyCoupon = product.discounts.quantity_based_discount?.one_time_used;
    if(usedQtyCoupon){
      this.checkCoupon.emit({qty_based:false}); 
    } else {
      if(product?.discounts?.quantity_based_discount?.discount?.length){
        product?.discounts?.quantity_based_discount?.discount.map((item) => {  
          //let startQty = (item.start_quantity == 1 ) ? item.start_quantity + 1 :  item.start_quantity; 
          let startQty = item.start_quantity; 
          let endQty = item.end_quantity;        
          if(this.productQty == startQty){
            this.checkCoupon.emit({qty_based:true}); 
            //this.product.applied_coupon['qty_based'] = false;
          } else if(this.productQty > startQty){         
            this.checkCoupon.emit({qty_based:true});          
          } else if((this.productQty > startQty && this.productQty < endQty)){          
            this.checkCoupon.emit({qty_based:true});
          } else if (this.productQty > endQty){
            this.checkCoupon.emit({qty_based:true});
          }
        
        });
      }
    }    
    
    return product;
  }

  isProductCouponAlert(product){
    let minPBQty = product.discounts.product_based_discount?.discount?.minimum_qty;
    let minPBPrice = product.discounts.product_based_discount?.discount?.minimum_product_amount;
    let usedCoupon = product.discounts.product_based_discount?.one_time_used;
    let usedQtyCoupon = product.discounts.quantity_based_discount?.one_time_used;

    if(product.applied_coupon.product_based && usedCoupon){
      let message = product.discounts.product_based_discount?.message;
      this.toastrService.info(message, 'Offer!');      
      return false;
    } else if((minPBQty > this.productQty || this.productQty < minPBQty) && product.applied_coupon.product_based){
      this.toastrService.warning('Minimum '+ minPBQty +' quantities required to apply coupon', 'Warning!');
      return false;
    } else if ((parseInt(product.special_price) < minPBPrice) && product.applied_coupon.product_based){
      this.toastrService.warning('Minimum product amount '+ minPBPrice +' is required to apply coupon', 'Warning!');
      return false;
    } else if(usedQtyCoupon){
      let message = product.discounts.quantity_based_discount?.message;            
      this.toastrService.info(message, 'Offer!'); 
      return true;
    } else {
      return true;
    }
  }
  addTocart(product) {    
    if(this.isProductCouponAlert(product)){      
      this.qtyBasedDiscounts(product);      
      if(product.has_variants){
        let combination = this.product.attributes?.map((e: any) => e.id + "-" + e.selectedValue?.id);
        let selectedCombination: any = this.product.variants?.find(e => e.attributes.every(x => combination.includes(x.attribute_id + "-" + x.attribute_value_id))); 
        if(selectedCombination){
          selectedCombination = {...selectedCombination, ...{id: this.product.id, has_variants: true, variant_id: selectedCombination.id}};
          const sellerId = { 'seller': {'id': product.seller.id, 'name': product.seller.name} };
          Object.assign(selectedCombination, sellerId, { applied_coupon: product.applied_coupon});
          this.variantProduct = selectedCombination;
          this.cartStockStatus(selectedCombination, product.seller.id, false, false);
        } else {
          this.toastrService.info('Stock is not available!', 'Warning!');
        }
      } else {
        this.cartStockStatus(product, product.seller.id, false, false);
      }
    }

  }

  sellerAddToCart(product, eachSellerProd) { 
    this.sellerQtyBasedDiscounts(eachSellerProd);
    let variantId = (eachSellerProd) => {
      eachSellerProd.id = eachSellerProd.variant_id;
    };
    variantId(eachSellerProd);
    const sellerDetais = {
      'seller': {
        'id': eachSellerProd.sellerId, 
        'name': eachSellerProd.name
      }
    };
    const applied_coupon = {
      'applied_coupon': eachSellerProd.applied_coupon
    }
    eachSellerProd = Object.assign(eachSellerProd, sellerDetais, applied_coupon);
    if(this.isProductCouponAlert(eachSellerProd)){
      this.cartStockStatus(eachSellerProd, eachSellerProd.sellerId, false, true);
    }
    

  }

  sellerQtyBasedDiscounts(sellerProduct){  
    let usedQtyCoupon = sellerProduct.discounts.quantity_based_discount?.one_time_used;
    if(usedQtyCoupon){
      sellerProduct.applied_coupon['qty_based'] = false;
    } else {
      if(sellerProduct?.discounts?.quantity_based_discount?.discount?.length){
        sellerProduct?.discounts?.quantity_based_discount?.discount.map((item) => { 
          //let startQty = (item.start_quantity == 1 ) ? item.start_quantity + 1 :  item.start_quantity;        
          let startQty = item.start_quantity;        
          let endQty = item.end_quantity;        
          if(this.productQty == startQty ){
            sellerProduct.applied_coupon['qty_based'] = true;
            if(sellerProduct.applied_coupon.product_based){
              sellerProduct.applied_coupon['product_based'] = true;
              sellerProduct.applied_coupon['qty_based'] = false;
            }         
          } else if(this.productQty >= startQty){   
            sellerProduct.applied_coupon['qty_based'] = true;
            sellerProduct.applied_coupon['product_based'] = false;
          } else if((this.productQty >= startQty && this.productQty < endQty)){
            sellerProduct.applied_coupon['qty_based'] = true;
            sellerProduct.applied_coupon['product_based'] = false;
          } else if(this.productQty > endQty){
            sellerProduct.applied_coupon['qty_based'] = true;
            sellerProduct.applied_coupon['product_based'] = false;
          }
        });
      }
    }
    
    return sellerProduct;
  }

  sellerCouponApply(coupon, eachSeller){
    eachSeller.applied_coupon.product_based = coupon;
    const sellerProduct = this.sellerQtyBasedDiscounts(eachSeller);
    if(coupon && !sellerProduct.applied_coupon['qty_based']){
      sellerProduct.applied_coupon['product_based'] = true;      
    } else {
      sellerProduct.applied_coupon['product_based'] = false;
    }
    if(coupon && sellerProduct.applied_coupon['qty_based']){
      this.toastrService.info('Coupon already applied!', 'Info!');
      return ;
    } 
   
  }
  
  buyNow(product) {    
    if(this.isProductCouponAlert(product)){
      this.qtyBasedDiscounts(product);
      if(product.has_variants){
        let combination = this.product.attributes?.map((e: any) => e.id + "-" + e.selectedValue?.id);
        let selectedCombination: any = this.product.variants?.find(e => e.attributes.every(x => combination.includes(x.attribute_id + "-" + x.attribute_value_id)));
        if(selectedCombination){
          selectedCombination = {...selectedCombination, ...{id: this.product.id, has_variants: true, variant_id: selectedCombination.id}};
          const sellerId = { 'seller': {'id': product.seller.id, 'name': product.seller.name} };
          Object.assign(selectedCombination, sellerId, { applied_coupon: product.applied_coupon});
          this.variantProduct = selectedCombination;
          this.cartStockStatus(selectedCombination, product.seller.id, true);
        } else {
          this.toastrService.info('Stock is not available!', 'Warning!');
        }
      } else {
        this.cartStockStatus(product, product.seller.id, true);
      }
    }
  }

  showSellerDetails(selectedVariant) {
    
    this.sellerDetails = [];
    if (selectedVariant != null) {
      this.product.seller_data?.forEach((each: any) => {  
        each.products.find(e => {
         if(e.variant_id == selectedVariant.id){
          Object.assign(e, {discounts: each.discounts}, {applied_coupon: {product_based: false, qty_based: false}});
          this.sellerDetails.push(e);
          
         }
        });
        
        //this.sellerDetails.push(each.find(e => e.variant_id == selectedVariant.id)) // get seller if variant exists
      });
    } else {
      this.product.seller_data?.forEach((each: any) => {       
        this.sellerDetails.push(each.products.find(e => Object.assign(e, {discounts: each.discounts}, {applied_coupon: {product_based: false, qty_based: false}}))) // get seller if no variants
      });
    }
    //console.log('seller Product',selectedVariant);
  }
  addTowishlist(product): void {
    if (this.isAuthenticated == true) {
      this.wishlistService.addToWishlist(product.slug).subscribe(response => {
        if (response.body.status == true) {
          this.toastrService.success(response.body.message, 'Success!');
          product.wishlist.has_wishlist = true;
          this.getWishlist();
        } else {
          // this.toast.info(response.body.message, 'Info!');
          this.router.navigate(['/account/dashboard']);
          localStorage.setItem('showWishlist', "true");
        }
      });
    } else {
      this.loginPopup();
    }
  }
  
  offerPopup(product){
    const modalRef = this.modalService.open(SellerOfferPopupComponent, {
      backdrop:'static',
      backdropClass:'loginBackdrop',
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      fullscreen: 'lg',
      size: 'lg'
    });
    modalRef.componentInstance.main_product = this.product;
    modalRef.componentInstance.product = product;    
    // modalRef.dismissed.subscribe({
    //   next(value) {
    //       console.log('dismissed', value);
    //   },
    //   error(err) {
    //     console.log('dismissed', err);
    //   },
    // });
  }
  getWishlist() {
    this.wishlistService.getWishlist(this.user.id).subscribe(res => {
      this.wishlistService.updateWishListItems(res);
    });
  }
  loginPopup() {
    this.modalService.open(LoginPopupComponent, this.modalOptions);
  }

  sharePost(content) {
    this.modalService.open(content, {backdrop:'static', backdropClass:'sharepostBackdrop', ariaLabelledBy: 'modal-basic-title', centered: true}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

}
