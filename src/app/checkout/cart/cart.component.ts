import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { delay, distinctUntilChanged, filter, last, map, tap } from 'rxjs/operators';
import { CartService } from 'src/app/shared/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/shared/services/api.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent implements OnInit {

  cartItems: any = [];
  cartSummary = {};
  noReturnAlert: boolean = false;
  inStock: boolean = true;
  isLoaded = new BehaviorSubject<boolean>(true);
  loadedProduct = new BehaviorSubject<boolean>(null);
  isLoadedImg = true;
  loading: boolean = true;
  couponForm: FormGroup;
  submitted = false;
  couponMsg = [];
  public timer = new BehaviorSubject<number>(0);
  counter = 0;
  constructor(
    private activatedRoute: ActivatedRoute,
    private cartService: CartService, 
    private toastrService: ToastrService,
    private _loading: LoadingService
  ) {
  
    merge(
      this.cartService.startTimer,
      this.cartService.endTimer,
      this.timer
    ).pipe(      
      tap(value => {
        this.counter = value;     
        //const date = new Date();
        //console.log('seconds',date.getSeconds() * 100)       
      })
    ).subscribe();
    // this._loading.loadingSub
    //     .pipe(delay(0))
    //     .subscribe((loading) => {
    //     this.loading = loading;
    // });
    
    this.activatedRoute.data.pipe(map(({ cart }) => cart)).subscribe((cart: BehaviorSubject<any>) => {     
      cart.subscribe(cart => {
        if(cart.length){
          this.isLoaded.next(false);
        }
        //this.loading = cart.length ? false : true;
        this.cartItems = cart;
      });
    });
    // setTimeout(() => {
    //   if(this.isLoaded){
    //     this.isLoadedImg = false;
    //     this.isLoadedText = true;
    //   }
    // }, 500);
   }

  ngOnInit() {
    
    this.cartService.products.pipe(filter(products => products?.length > 0)).subscribe({
      next: (products) => {        
        //this.loading = products.length ? false : true;
        if(products.length){
          this.timer.next(new Date().getSeconds() * 100);
          this.isLoaded.next(false);
          this.loadedProduct.next(true);
          this.cartItems = products;         
          this.cartItems?.forEach(e => {
            e.customVariants = '';
            e.product?.variants?.attributes?.forEach(eachVariant => {
              e.customVariants += eachVariant.attribute_name + ": " + eachVariant.attribute_value_name + "<br/>";
            });
          });          
        } else {
          this.timer.next(new Date().getSeconds() * 100);
          this.cartItems = [];
          this.loadedProduct.next(false);
        }
       
      },
      
      error(err) {
        this.cartItems = [];
      },
      complete: () => {
        //this.loadedProduct.next(true);
      }
    });
    this.cartService.cartSummary.subscribe(summary => {
      this.cartSummary = summary;     
    })
    this.loadedProduct.pipe(      
      delay(this.counter),      
    ).subscribe(loaded => {     
      if(loaded){
        this.isLoaded.next(false);
      } else {
       
        setTimeout(() => {
          if(!loaded){
            //this.loadedProduct.next(true);
            this.isLoaded.next(false);
          }  
          
        }, this.counter);
      }
    })
    this.couponForm = new FormGroup({
      coupon_code : new FormControl('', Validators.required),
    })
    
  }
  checkQtyBased(type, product, currentQuantity){    
    if(type == 'add'){
      currentQuantity = currentQuantity + 1;
    }
    if(type == 'delete'){
      currentQuantity = currentQuantity - 1;
    }
    let applied_coupon = { qty_based: false };
    if(product.product?.discounts?.qty_based?.length){      
      product.product?.discounts?.qty_based?.map(item => {
        let startQty = item.start_quantity;
        let endQty = item.end_quantity;       
        if(currentQuantity == startQty){
          applied_coupon = {
            qty_based: true
          }
        } else if(currentQuantity >= startQty){ 
          applied_coupon = {
            qty_based: true
          }  
        } else if((currentQuantity >= startQty && currentQuantity < endQty)){
          applied_coupon = {
            qty_based: true
          }
        } else if(currentQuantity > endQty){
          applied_coupon = {
            qty_based: true
          }
        }
      })
     
    }
   return applied_coupon;
  }
  incQnt(product, slug, currentQuantity) { 
    this._loading.setLoading(false, this.activatedRoute.snapshot['_routerState'].url);
    let status:boolean = true;
    if(product.product.stock.total_on_hand < (currentQuantity + 1))  {
      status = false;
      this.toastrService.warning('Out of stock', 'Warning!');
      if ((currentQuantity + 1) > product.product.stock.maximum_order) {
        status = false;
        this.toastrService.warning('Maximum allowed qty is ' + product.product.stock?.maximum_order, 'Warning!');
      }
      if ((currentQuantity + 1) > product.product.stock.bulk_order) {
        status = false;
        this.toastrService.info("Product not returnable if quantity is more than " + product.product.stock?.bulk_order, 'Note!');             
      }
    } else {
      if ((currentQuantity + 1) > product.product.stock.maximum_order) {
        status = false;
        this.toastrService.warning('Maximum allowed qty is ' + product.product.stock?.maximum_order, 'Warning!');
      }
      if ((currentQuantity + 1) > product.product.stock.bulk_order) {
        this.toastrService.info("Product not returnable if quantity is more than " + product.product.stock?.bulk_order, 'Note!');             
      }
    }
    
    if(status){
      let applied_coupon = this.checkQtyBased('add', product, currentQuantity);     
      this.cartService.increaseQuantity(slug, currentQuantity, product?.sellerId, product.cart_id, product.cart_session_id, applied_coupon);
    }
   
  }
  
  decQnt(product, slug, currentQuantity) {
    //console.log(product, slug, currentQuantity);
    let productQty = product?.product?.stock?.minimum_order;       
    let status = false;

    if(currentQuantity <= productQty){
      currentQuantity = productQty;
      status = true;      
    } else{
      status = false;
    }
    if(status){
      this.toastrService.warning('Minimum qty is ' + productQty, 'Warning!');
    } else {
      let applied_coupon = this.checkQtyBased('delete',product, currentQuantity);
      
      this.cartService.decreaseQuantity(slug, currentQuantity, product?.sellerId, product.cart_id, product.cart_session_id, applied_coupon);
    }
    

    return status;
  }

  deleteCartItem(product_slug, cart_id, cart_session_id, seller_id) {
    this.cartService.removeProduct(product_slug, cart_id, cart_session_id, seller_id);
    this.cartService.cartSummary.subscribe(cart => {
      if(cart.total_cart_items < 1){
        this.isLoaded.next(false);
        this.cartItems = [];
        this.cartService.products.next([]);
      }
    });    
  }
  applyCoupon(){
    this.submitted = true;
   
    if(this.couponForm.valid){
      
      const productSlug = this.cartItems.map((item, index) => {
        if(item.coupon_type === "no_coupon"){
          return item.product.slug;
        }       
        
      });
      
      let formData = {
        'session_id' : this.cartService.cart_session_id,
        'coupon_code' : this.couponForm.get('coupon_code').value,
        'all_slug' : productSlug
      };
     
      this.cartService.addCoupon(formData).subscribe(res => { 
        if(res.data.length){
          this.cartItems.filter(item => {
            res.data.find(coupon => {
              if(item.cart_id == coupon.cart_id) {
                this.couponMsg = [...this.couponMsg, ...[{cartId: item.cart_id, msg:coupon.msg,status:coupon.status}]]
                
              } 
            });
          });
          
        } else {
          if(res.status){
            this.toastrService.success(res.msg, 'Coupon applied successfully');            
          } else {
            this.toastrService.info(res.msg, "Can't apply coupon code");
          }
        }       
        this.cartService.getProducts();
        this.removeAlert();
      }, err => {
        if(err.error.errors){
          this.toastrService.info(err.error.errors, 'Cannot Apply Coupon');
          this.cartService.getProducts();
        }
       

      })
    }
   
  }
  removeAlert(){
    setTimeout(() => this.couponMsg = [], 4000);
  }
  removeCoupon(cart_id, seller_id, slug, session_id){
    this.cartService.removeCoupon({cart_id: cart_id, seller_id: seller_id, slug: slug, session_id: session_id}).subscribe((res) => {
      if(res.status){
        this.toastrService.success(res.msg, '');
        this.cartService.getProducts();
      }
    }, err => {
      if(err.error.errors){
        this.toastrService.info(err.error.errors, '');
        this.cartService.getProducts();
      }
     

    });
  }
}
