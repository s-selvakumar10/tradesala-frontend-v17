import { Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../shared/services/cart.service';
import { AddressService } from '../core/services/address.service';
import { WindowRefService } from '../core/services/window-ref.service';
import { AuthService } from '../auth/auth.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription, merge } from 'rxjs';
import { User } from '../auth/user.model';
import { PaymentMethod } from '../core/models/checkout';
import { StickySidebarDirective } from '../shared/sticky-sidebar/sticky-sidebar.directive';
import * as constants from 'src/app/shared/constant';

import {load} from '@cashfreepayments/cashfree-js';
import { DeliveryPincodeService } from '../shared/delivery-pincode.service';
import { isPlatformBrowser } from '@angular/common';
const cashfree = async function(config){
	return await load(config);
}
@Component({
	selector: 'app-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss'],
})

export class CheckoutComponent implements OnInit {
	cartItems: any = [];
	cartSummary = {};
	stateList :any ;
	countryList :any;
	isLoading = false;
	isLoadingBtn = false;
	isLoadingResults = false;
	taxCharges: number = 0;
	user: User;

	payment_method:Array<PaymentMethod> = [
		{'name': 'Cash Free', 'value': 'onlinepayment'},
		//{'name': 'Razor Pay', 'value': 'razor_pay'},
		//{'name': 'COD', 'value': 'cod'}

	]

	showShippingForm = false;
	showBilling = true;
	showBillingForm = false;	
	checkoutForm: FormGroup;
	loginForm: FormGroup;
	addressShippingForm: FormGroup;
	addressShippingAddForm: FormGroup;
	addressBillingForm: FormGroup;
	paymentMethodForm: FormGroup;
	couponForm: FormGroup;
	closeResult = '';
	userSub: Subscription;
	//userId: string;
	userId: any = 0;
	submitted = false;
	isAuthenticated: Boolean = false;
	isGstEnable: boolean = false;
	listOfAddress: any = [];
	stateListMap: any = {};
  	countryListMap: any = {};
	storeListAddress: any = [];
	shipping_address:any = {};
	billing_address:any = {};
	shippingOption: Subscription;
	validGSTPattern = "^[a-zA-Z0-9]{15}$";

	constructor(
		private authService: AuthService,
		private winRef: WindowRefService, 
		private router: Router, 
		private formBuilder: FormBuilder, 
		private api: ApiService, 
		public toast : ToastrService,
		private cartService: CartService,
		private modalService: NgbModal,
		private addressService: AddressService,
		private el: ElementRef,
		private sticky: StickySidebarDirective,
		private deliveryServicePincode: DeliveryPincodeService,
		@Inject(PLATFORM_ID) private platformId: object
	) { 
		this.userSub = this.authService.user.subscribe(user => {
			this.isAuthenticated = !!user;
            if(this.isAuthenticated) {
                this.userId = user.id;
				this.user = user;
            }	     
		});
		
		this.sticky.onWindowScroll();
		
	}
	
	ngOnInit(): void {
		
		this.cartService.products.subscribe(products => {
			this.cartItems = products;
			this.cartItems?.forEach(e => {
				e.customVariants = '';
				e.product?.variants?.attributes?.forEach(eachVariant => {
					e.customVariants += eachVariant.attribute_name + ": " + eachVariant.attribute_value_name + "<br/>";
				});
			});
		})
		this.cartService.cartSummary.subscribe(summary => {
			this.cartSummary = summary;
		})

		this.getCommonData();
		this.fillUserDetails();


		this.loginForm = this.formBuilder.group({
	      username: [null, Validators.required],
	      password: [null, [Validators.required, Validators.minLength(3)]]
	    });

		this.addressShippingForm = this.formBuilder.group({
			shipping_address: new FormControl(false, Validators.requiredTrue)
		});

	    this.addressShippingAddForm = this.formBuilder.group({
			name: [null, Validators.required],
			mobile: [null, [Validators.required, Validators.pattern(constants.mobNumberPattern), Validators.minLength(10), Validators.maxLength(10)]],	
			address1 : [null, Validators.required],
			address2 : [null],
			city : [null, Validators.required],
			country : ['', Validators.required],
			postalcode : [null, [
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(8),
				Validators.pattern('^[0-9]*$')]],
			state : ['', Validators.required],
			
		});

		this.addressBillingForm = this.formBuilder.group({	
			name: [null, Validators.required],
			mobile: [null, [Validators.required, Validators.pattern(constants.mobNumberPattern), Validators.minLength(10), Validators.maxLength(10)]],
			address1 : [null, Validators.required],
			address2 : [null],
			city : [null, Validators.required],
			country : ['', Validators.required],
			postalcode : [null, [
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(8),
				Validators.pattern('^[0-9]*$')]],
			state : ['', Validators.required],
			
		});

		this.paymentMethodForm = this.formBuilder.group({
			paymentMethod: ['onlinepayment', Validators.required]
		});

		this.shippingOption = this.addressShippingForm.get('shipping_address').valueChanges
			.pipe(distinctUntilChanged())
			.subscribe(newValue => {
			if (newValue) {
				this.addressShippingForm.get('shipping_address').setValidators([]);
			} else {
				this.addressShippingForm.get('shipping_address').setValidators([Validators.required]);
			}
			this.addressShippingForm.get('shipping_address').patchValue( newValue, {emitEvent: false} );
			this.addressShippingForm.get('shipping_address').updateValueAndValidity();
		});
		
		this.couponForm = new FormGroup({
			coupon_code : new FormControl('', Validators.required),
		  })
	}
	
	public toggle( element: HTMLElement ) {
		element.classList.toggle('show');
	}

	public onGstEnable(event, element:HTMLElement): void{
		if (event) {
			this.isGstEnable = true;
			element.classList.add('show');			
			this.checkoutForm.get('gst_no').setValidators([Validators.required, Validators.minLength(15), Validators.pattern(this.validGSTPattern)]);			
		} else {
			this.isGstEnable = false;
			element.classList.remove('show');
			this.checkoutForm.get('gst_no').setValidators(null);
			this.checkoutForm.get('gst_no').setValue('');
		}
	}
	
	public isChecked(event, element:HTMLElement): void{
		if (event.target.checked) {
			this.isGstEnable = true;
			this.showBillingForm = true;
			this.showBilling = true;
			element.classList.add('show');
			this.checkoutForm.get('gst_no').setValidators([Validators.required, Validators.minLength(15), Validators.pattern(this.validGSTPattern)]);			
		} else {
			this.isGstEnable = false;
			this.showBilling = false;
			this.showBillingForm = false;
			element.classList.remove('show');
			this.checkoutForm.get('gst_no').setValidators(null);
			this.checkoutForm.get('gst_no').setValue('');
		}
		
	}
	onLoginSubmit() {
		const { value: username } = this.loginForm.get('username');
		const { value: password } = this.loginForm.get('password');
		
		this.authService.signIn(username, password).subscribe(resData => {
		  
		  	if(resData){
				this.modalService.dismissAll();
			  	this.toast.success('Successfully logged in!', 'Success!');
			  	this.router.navigate(['checkout/checkoutDetails']);
				this.fillUserDetails();
		 	}
		}, 
		error => {
		  
		  	if(error){
			  	this.toast.error("Check Username or Password", 'Login Failed!');
		  	}
			  
		})
	}

	fillUserDetails(){
		if (this.isAuthenticated) {
			this.checkoutForm = this.formBuilder.group({				
				enable_gst: [false],
				gst_no: [null],
				
			});
			
			this.addressService.listAddress(this.userId).subscribe(response => {
				
				this.listOfAddress = response;
			}, err => {
				console.log(err);
			});

		} else {
			this.checkoutForm = this.formBuilder.group({				
				enable_gst: [false],
				gst_no: [null],
				
			});
		}
	}
	addAddress(){
		this.showShippingForm = !this.showShippingForm;
	}
	shippingAddressOnSubmit(){
		let obj: any = {
			"shipping_address": {
			  "name": this.addressShippingAddForm.value.name,			  
			  "mobile_number": this.addressShippingAddForm.value.mobile,
			  "line1": this.addressShippingAddForm.value.address1,
			  "line2": this.addressShippingAddForm.value.address2,
			  "pincode": this.addressShippingAddForm.value.postalcode,
			  "city": this.addressShippingAddForm.value.city,
			  "state": this.addressShippingAddForm.value.state,
			  "country": this.addressShippingAddForm.value.country,
			},			
			"billing_address": {},        
			
		  }; 
		
		if(this.addressShippingAddForm.valid){
			const pincode = obj?.shipping_address.pincode;			
			this.deliveryServicePincode.storePincode(pincode);			
			this.addressService.storeAddress(obj).subscribe(response => {
				if (response.status) {
				this.toast.info(response.message, 'Alert!');
				this.fillUserDetails();
				this.addressShippingAddForm.reset();
				this.showShippingForm = false;		
				} else {
				this.toast.info(response.message, 'Alert!');
				}
			}, err => {
				console.log(err);
			})			
			
		}
	}
	get f(){
		return this.addressShippingForm.controls;
	}
	changeShipping(address, event){
		
		if(event.target.checked){
			this.shipping_address = {				
				'name': address?.shipping_address.name,
				'mobile_number': address?.shipping_address.mobile_number,
				'line1': address?.shipping_address.line1,
				'line2': address?.shipping_address.line2,
				'pincode': address?.shipping_address.pincode,
				'city': address?.shipping_address.city,
				'state': address?.shipping_address.state,
				'country': address?.shipping_address.country
			}
			const pincode = address?.shipping_address.pincode;			
			this.deliveryServicePincode.storePincode(pincode, address.id);			
			this.cartService.getProducts(pincode);
			merge(
				this.deliveryServicePincode.pincodeObs$,
				this.deliveryServicePincode.shipping_address
			).subscribe(observer => {
				if(observer !== '' || observer.length > 0){
					this.isLoadingBtn = true;
				}
			});
		} else {
			this.shipping_address = {};
		}
		
	}
	
	errorInput(form: string){
		const formData = this.el.nativeElement.querySelector(form);
		const formError = this.el.nativeElement.querySelector(form +' .ng-invalid');
		if (formError) {
			formData.classList.add('was-validated');			
			const labelOffset = 80;
			let scrollTopPosition = formError.getBoundingClientRect().top + window.scrollY - labelOffset;
			window.scroll({ behavior: 'smooth', top: scrollTopPosition });
		} else {
			formData.classList.remove('was-validated');
		}
	}
	onFormSubmit() {
		this.isLoading = true;
		this.checkoutForm.get('enable_gst').valueChanges.subscribe(value => {
			if(!value){					
				this.checkoutForm.get('gst_no').setValidators([Validators.required, Validators.minLength(15), Validators.pattern(this.validGSTPattern)]);
				
			} else {
				this.checkoutForm.get('gst_no').setValidators(null);
			}
			
		});
		if(this.checkoutForm.invalid)
		{
			this.errorInput('form.checkout-form');
			this.toast.error('Please enter your GST Number.');
			return ;
		} else if(this.addressShippingForm.invalid) {
			this.errorInput('form.shipping-form');
			this.toast.error('Please select a Shipping address.');
			return ;
		} else if(this.checkoutForm.get('enable_gst').value === true && this.addressBillingForm.invalid){
			this.errorInput('form.billing-form');
			this.toast.error('Please enter the Billing address');
			return ;
		} else {
						
			this.isLoadingResults = true;
			
			if(this.checkoutForm.get('enable_gst').value === true){
				this.billing_address = {				
					"name":  this.addressBillingForm.value.name,
					"mobile_number": this.addressBillingForm.value.mobile,
					"line1": this.addressBillingForm.value.address1,
					"line2": this.addressBillingForm.value.address2,
					"city": this.addressBillingForm.value.city,
					"state": this.addressBillingForm.value.state,
					"country": this.addressBillingForm.value.country,
					"pincode": this.addressBillingForm.value.postalcode
				}
			} else {
				this.billing_address = {};
			}
			
			let checkOutData  = {
				"session_id": this.cartService.cart_session_id,
				"payment_type": this.paymentMethodForm.value.paymentMethod, // cod
				"customer_details": {
					"name": this.user?.name,
					"email": this.user?.email,
					"mobile_number": this.user?.mobile,
				},
				"enable_gst": this.checkoutForm.get('enable_gst').value,
				"gst_no": this.checkoutForm.get('gst_no').value,
				"shipping_address": this.shipping_address,			
				"billing_address": this.billing_address,
				
			};
			
			let url = `${'v1/checkout'}`;		
			this.api.postApi(url,checkOutData)
			.pipe(
				map((response) => response.body)
			)
			.subscribe((res: any) => {
				this.isLoading = false;
				if(res.cashfree){
					let checkoutOptions = {
						paymentSessionId: res.cashfree.payment_session_id,
						redirectTarget: "_self",
					};
					cashfree({
						mode: res.cashfree.mode
					}).then(e =>{						
						e.checkout(checkoutOptions);
					}).catch(err => console.log(err))
					
				}
				// if(res.cashfree_redirect_url) {
				// 	window.location.href = res.cashfree_redirect_url;
				// }
				// else if (!res.order_number && res.razer_options) {
				// 	this.payWithRazor(res.razer_options);
				// } else {
				// 	this.successRedirect(res.order_number);
				// }
			}, (err: any) => {
				console.log(err);
				this.isLoadingResults = false;
			});
		}
	}
	
	successRedirect(order_number) {
		this.isLoadingResults = false;
		this.router.navigate(['order/success'], { state: { orderNumber: order_number } });

		// Refresh cart items once success
		this.cartService.getProducts();
	}

	payWithRazor(resdata) {
		
		const options: any = resdata;

		options.handler = ((response, error) => {
			options.response = response;

			// call your backend api to verify payment signature & capture transaction
			let url = `${'v1/checkout/payment/verify'}`;
			this.api.postApi(url, 
				{
					token: options.notes.shopping_order_id, 
					razorpay_order_id: response.razorpay_order_id, 
					razorpay_payment_id: response.razorpay_payment_id, 
					razorpay_signature: response.razorpay_signature 
				})
				.subscribe((res: any) => {
					this.successRedirect(res.order_number);
				}, (err: any) => {
					console.log(err);
				});
		});
		options.modal.ondismiss = (() => {
			// handle the case when user closes the form while transaction is in progress
			console.log('Transaction cancelled.');
		});
		const rzp = new this.winRef.nativeWindow.Razorpay(options);
		rzp.open();
	}

	getCommonData()
	{
		let url = `${'/v1/states'}`;
		this.api.getAll(url).subscribe(commonRes=>
		{
		this.stateList = commonRes;		
		})
		url = `${'/v1/country'}`;
		this.api.getAll(url).subscribe(commonRes=>
		{
		this.countryList = [commonRes['100']];
		})
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
				if(res.status){
				this.toast.success(res.msg, 'Applied Coupon');
				this.cartService.getProducts();
				} else {
				this.toast.info(res.msg, 'Cannot Apply Coupon');
				}
			}, err => {
				if(err.error.errors){
				this.toast.info(err.error.errors, 'Cannot Apply Coupon');
				this.cartService.getProducts();
				}
			
		
			})
		}
	   
	}

	removeCoupon(seller_id, slug, session_id){
		this.cartService.removeCoupon({seller_id: seller_id, slug: slug, session_id: session_id}).subscribe((res) => {
		  if(res.status){
			this.toast.success(res.msg, '');
			this.cartService.getProducts();
		  }
		}, err => {
		  if(err.error.errors){
			this.toast.info(err.error.errors, '');
			this.cartService.getProducts();
		  }
		 
	
		});
	  }

	loginPopup(content) {
		this.modalService.open(content, {backdrop:'static', backdropClass:'loginBackdrop', ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
		if (this.shippingOption) {
		  this.shippingOption.unsubscribe();
		}
	}
}
