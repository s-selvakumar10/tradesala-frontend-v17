import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { URL } from 'src/app/url.constant';
import { SessionFlow } from 'src/app/helper/session-flow';
import { map, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { isEmpty } from 'lodash-es';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  products: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  cartSummary: BehaviorSubject<any> = new BehaviorSubject<any>({});
  totalPrice: number = 0;
  totalItems: number = 0;
  userId: string;
  shippingCharges: number = 0;
  finalTotal: number = 0;
  taxCharges: number = 0;
  totalDiscount: number = 0;

  cart_session_id: string;
  userData: any;
  sellerId: number;
  public startTimer = new BehaviorSubject<number>(0);
  public endTimer = new BehaviorSubject<number>(0);
  public pincode = isPlatformBrowser(this.platformId) ? localStorage.getItem('delivery_pincode') : null;
  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    protected sessionFlow: SessionFlow,
    private toastMsg: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.authService.user.subscribe(user => {
			const isAuth = !!user;     
      if(isAuth) {
        this.userId = user.id;
      }			
        
    });
    this.cartSummary.subscribe(summary => {      
      this.shippingCharges = summary.shipping_cost;
      this.totalPrice = summary.sub_total;
      this.taxCharges = summary.tax_total;
      this.totalDiscount = summary.discounts;      
      this.finalTotal = summary.grand_total ;
      this.totalItems = summary.total_cart_items;
    })
    // this.products.subscribe((products) => {
    //   this.shippingCharges = products.reduce((prevValue, currProduct) => {
    //     return prevValue + Number(currProduct.product.shipping.shipping_cost);
    //   }, 0);
    //   this.totalPrice = products.reduce((prevValue, currProduct) => {
    //     return prevValue + currProduct.amount;
    //   }, 0);
    //   this.taxCharges = products.reduce((prevValue, currProduct) => {        
    //     return prevValue + (Number(currProduct.product.taxes.igst.amount) * Number(currProduct.qty));
    //   }, 0);

    //   this.totalDiscount = products.reduce((prevValue, currProduct) => {
    //     return prevValue + Number(currProduct.discount_amount); 
    //   }, 0);
      
    //   this.finalTotal = this.totalPrice + this.shippingCharges ;

    //   this.totalItems = products.reduce((prevValue, currProduct) => {
    //     return prevValue + currProduct.qty;
    //   }, 0);
      
    // });
    
    
    if (sessionFlow.userId === 'guest') {
      this.cart_session_id = sessionFlow.deviceId;
    } else {
      // logged in user cart
      this.cart_session_id = sessionFlow.deviceId; // need to pass the logged in user data;      
    }
    
    //this.getProducts();
  }


  getProducts(pincode = null) {
    let url = URL.cart.list.replace(
      '{cart_session_id}',
      this.cart_session_id
    );
    if(pincode !== null){
      url = url + '?pincode=' + pincode;
    } else {
      if(this.pincode){
        url = url + '?pincode=' + this.pincode;
      }
    }
    this.startTimer.next(new Date().getSeconds() * 100);
    this.apiService
      .getAll(url)
      .subscribe((data: any) => {        
        this.endTimer.next(new Date().getSeconds() * 100);
        if(data.status && data?.cart?.items?.length){
          this.processProduct(data.cart.items)
         
        }
        if(data?.cart?.summary){
          this.cartSummary.next(data.cart.summary);
        }
      });
  }

  addProduct(product_slug: string, qty: number, seller_id: number, apply_coupon: {}, buy_now: boolean) {
    const url = URL.cart.add;    
    let formData = {
      session_id: this.cart_session_id,
      product_slug: product_slug,
      quantity: qty,
      user_id: this.userId,
      seller_id: seller_id,
      applied_coupon: apply_coupon,
      pincode: this.pincode
    }
    if(buy_now){
      formData = {...formData, ...{is_buy_now: true, buy_now_qty: qty}};
    } else {
      formData = {...formData, ...{is_buy_now: false, buy_now_qty: 0}};
    }
    this.apiService
      .postApi(url, formData)
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .subscribe((data: any) => {
        if(!data.status && data.error){
          if(data.stock_status){
            this.toastMsg.info(data.message, "Info!");
          } else {
            this.toastMsg.warning(data.message, "Warning!");
          }
        }  else if(!data.status && data.coupon){
          this.toastMsg.info(data.message, "Info!");
        } else {
          this.toastMsg.success('Item added to cart successfully.', "Added Cart!");
          this.processProduct(data.cart.items);
          this.cartSummary.next(data.cart.summary);
        }
       
      });
  }
  addMultipleItems(items: any) {    
    const url = URL.cart.addMultiple;
    this.apiService
      .postApi(url, {
        session_id: this.cart_session_id,
        user_id: this.userId ? this.userId : '',
        items: items,
        pincode: this.pincode
      })
      .pipe(
        map((response) => {
          return response.body;
        })
      )
      .subscribe((data: any) => { 
        if(data.message){
          this.toastMsg.info(data.message, "Info!");
        }      
        if(data.info){         
          this.toastMsg.success(data.info, "Success!");          
        } 
        this.processProduct(data.cart.products);   
        this.cartSummary.next(data.cart.summary);
      });
  }

  increaseQuantity(product_slug: string, qty: number, seller_id: number, cart_id: number, cart_session_id: string, apply_coupon: any) {
    qty = qty + 1;
    if (qty > 1) {
      this.updateProduct(product_slug, qty, seller_id, cart_session_id, apply_coupon);
    } else {
      this.removeProduct(product_slug, cart_id, cart_session_id, seller_id);
    }
  }

  decreaseQuantity(product_slug: string, qty: number, seller_id: number, cart_id: number,  cart_session_id: string, apply_coupon: any) {
    qty = qty - 1;
    if (qty >= 1) {
      this.updateProduct(product_slug, qty, seller_id, cart_session_id, apply_coupon);
    } else {
      this.removeProduct(product_slug, cart_id, cart_session_id, seller_id);
    }
  }

  updateProduct(product_slug: string, qty: number, seller_id: number, cart_session_id: string, apply_coupon: {}) {
    const url = URL.cart.update;   
    this.apiService
      .patchApi(url, {
        session_id: cart_session_id ? cart_session_id : this.cart_session_id,
        product_slug: product_slug,
        quantity: qty,
        user_id: this.userId,
        seller_id: seller_id,
        applied_coupon: apply_coupon,
        pincode: this.pincode
      })
      .subscribe((response: any) => {       
        this.getProducts();
      });
  }

  removeProduct(product_slug: string, cart_id:number, cart_session_id: string, seller_id: number) {
    const url = URL.cart.delete
      .replace('{cart_session_id}', cart_session_id)
      .replace('{product_slug}', product_slug);

    this.apiService.deleteApi(url, {cart_id: cart_id, seller_id: seller_id}).subscribe((res: any) => {
      if(res.status){        
        this.getProducts();
        this.toastMsg.success(res.message, "Deleted!", {positionClass: 'toast-bottom-right'});
      } else {
        this.toastMsg.info(res.message, "");
      }
      
    });
  }

  processProduct(products) {
    
    if (products) {
      let result = [];
      products.forEach((product) => {          
        let temp_product = {
          cart_session_id: product.cart_session_id,
          cart_id: product.cart_id,
          id: product.product.id,
          variant_id: product.product.has_variants ? product.product.variant_id : null,
          sellerId: product.product.seller.id,
          price: product.price,
          qty: product.qty,
          sub_total: product.sub_total,
          tax_total: product.tax_total,
          amount: product.amount,
          coupon_type: product.coupon_type,
          discount_amount: product.discount,
          shipping_charges: product.shipping_charges,
          product: {
            id: product.product.id,
            name: product.product.name,
            slug: product.product.slug,
            sku: product.product.name,
            tsid: product.product.tsid,
            hsn: product.product.hsn_code,         
            media: product.product.media,
            product_url: product.product.product_url,
            shipping: product.product.shipping,
            taxes: product.product.taxes,
            stock: product.product.stock,
            has_variants: product.product.has_variants,
            variant_id: product.product.variant_id,
            variants: product.product.has_variants ? product.product.variants : null,
            actualPrice: product.product.actual_price,
            seller:{
              id: product.product.seller.id,
              name: product.product.seller.name
            }
          },
        };
       
        if((product.coupon_type == 'no_coupon' || product.coupon_type == 'qty_based') && product.product?.discounts?.quantity_based_discount){
          let discounts = {};
          if(product.product?.discounts?.quantity_based_discount?.discount){
            discounts = {
              qty_based: product.product?.discounts?.quantity_based_discount?.discount
            }
          }
          Object.assign(temp_product.product, {discounts});
        }
        if(product.coupon_type == 'referal_code'){
          let discount = {};
          if(product.product?.discounts?.referral_code?.discount?.has_percentage){
            let percentage ={ 
              has_percentage: true,               
              percentage: product.product?.discounts?.referral_code?.discount?.percentage,
              amount: product.product?.discounts?.referral_code?.discount?.amount
            }
            discount = {...discount, ...percentage};
          }
          if(!product.product.discounts?.referral_code?.discount?.has_percentage){
            let percentage ={ 
              has_percentage: false,               
              amount: product.product?.discounts?.referral_code?.discount?.amount
            }
            discount = {...discount, ...percentage};
          }
          Object.assign(temp_product.product, {discount});
        }
        if(product.coupon_type == 'product_based'){
          
          let discount = {
            free_shipping: product.product?.discounts?.product_based_discount?.has_free_shipping,
          }
          if(product.product?.discounts?.product_based_discount?.has_free_shipping){
            let percentage ={ 
              has_percentage: false,               
              percentage: 0,
              amount: 0
            }
            discount = {...discount, ...percentage};
            temp_product.product.shipping.has_shipping_charges = false;
            temp_product.product.shipping.shipping_cost = 0;
          }
          if(!product.product?.discounts?.product_based_discount?.has_free_shipping){
            
            if(product.product?.discounts?.product_based_discount?.discount?.has_percentage){
              let percentage ={ 
                has_percentage: true,               
                percentage: product.product?.discounts?.product_based_discount?.discount?.percentage,
                amount: product.product?.discounts?.product_based_discount?.discount?.amount
              }
              discount = {...discount, ...percentage};
            }
            if(!product.product.discounts?.product_based_discount?.discount?.has_percentage){
              let percentage ={ 
                has_percentage: false,               
                percentage: product.product?.discounts?.product_based_discount?.discount?.percentage,
                amount: product.product?.discounts?.product_based_discount?.discount?.amount
              }
              discount = {...discount, ...percentage};
            }
            
          }
          if(isEmpty(product.product?.discounts?.product_based_discount)){
            let percentage ={ 
              free_shipping: false,
              has_percentage: false,               
              percentage: 0,
              amount: 0
            }
            discount = {...discount, ...percentage};
          }
          Object.assign(temp_product.product, {discount});
        }
        if(product.coupon_type == 'combo_based' && product.product.discounts.combo_discount.length != 0){
          let discount = {
            percentage: product.product?.discounts?.combo_discount?.discount?.percentage,
            amount: product.product?.discount_amount
          }
          Object.assign(temp_product.product, {discount});
        }

        if(product.coupon_type == 'qty_based'){          
          if(product.product?.discounts?.quantity_based_discount?.has_percentage){
            let qtyBased = product.product?.discounts?.quantity_based_discount?.discount.find((item) => item.amount == product.product.discount_amount)
            
            let percentage = {};
            let discount = {};
            if(qtyBased){
              percentage = { 
                has_percentage: true,               
                percentage: qtyBased.percentage,
                amount: qtyBased.amount
              }
            } else {
              percentage = { 
                has_percentage: false,               
                percentage: 0,
                amount: 0
              }
            }
            discount = {...percentage};
            Object.assign(temp_product.product, {discount});
          }
          
        }
        
        this.totalItems += temp_product.qty;
        this.totalPrice += temp_product.amount;

        result.push(temp_product);
      });

      this.products.next(result);
    }
    
  }

  addCoupon(formData): Observable<any>{
    const url = URL.coupon.add;
    return this.apiService.postApi(url, formData).pipe(map(res => res.body));
  }
  removeCoupon(formData): Observable<any>{
    const url = URL.coupon.remove;
    return this.apiService.postApi(url, formData).pipe(map(res => res.body));
  }
}
