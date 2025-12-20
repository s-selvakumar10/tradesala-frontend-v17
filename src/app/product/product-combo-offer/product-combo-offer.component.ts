import { isPlatformBrowser} from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, NgZone, OnInit, Output, PLATFORM_ID, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { Product } from 'src/app/core/models/product';
import { CartService } from 'src/app/shared/services/cart.service';
import {size} from 'lodash-es';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product-combo-offer',
  templateUrl: './product-combo-offer.component.html',
  styleUrls: ['./product-combo-offer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductComboOfferComponent implements OnInit {

  	itemCart: any = [];
	@Input() product: Product;
	@Input() option: Product;
	@Input() showPopup: Boolean;
	data: any;
	
	inStock: boolean = true;
	noReturnAlert: boolean = false;
	productQty: number = 0;
	
	productSub$: Subscription;

	contentLoaded: boolean = false;
	isLoading: boolean = false;
	totalPrice = 0.00;
	cartItems: any = []; 
	productSlug: string;
	isComboSlider = false;

	public options: OwlOptions = {
		loop: false,
		autoplay: false,
		autoWidth: true,
		lazyLoad:true,
		margin: 10,
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
			items: 4,
		  },
		},
	};

	constructor(
		private cartService: CartService,
		private toast: ToastrService,
		private router: Router,
		private cd: ChangeDetectorRef,
		private zone: NgZone,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
			
	}

	ngOnInit(): void {
		
		this.initComboOffer();
		if(this.showPopup){
			this.options.responsive = {
				0: {
					items: 3,
				},
				400: {
					items: 3,
				},
				740: {
					items: 3,
				},
				940: {
					items: 3,
				},
			}
		}
	}
	ngOnChanges({product, option}: SimpleChanges){
		
		if(typeof product != 'undefined' && typeof option != 'undefined'){			
			let productData = product.currentValue;
			let optionData = option.currentValue;
			
			if(this.showPopup){
				optionData = {...optionData, ...{
						media: productData.media,
						seller_name: optionData.name,
						name: productData.name,
						brand: productData.brand
					}
				};				
				this.product = 	optionData;			
				this.getComboOffer(optionData);

			} else {

				if(product.currentValue.has_variants){
					this.getComboOffer(optionData);
				} else {
					this.getComboOffer(productData);
				}

			}
			
		}
		
	}
	
	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)){
			this.zone.run(() => {
				setTimeout(() => {	
					this.contentLoaded = true;
					this.cd.detectChanges();
				}, 500);
			});
		}
	}
	initComboOffer(){		
		if(this.showPopup){
			this.option = {...this.option, ...{
					media: this.product.media,
					seller_name: this.option.name,
					name: this.product.name,
					brand: this.product.brand
				}
			};
			this.product = this.option;			
			this.getTotalPrice(this.product);			
		} else {
			this.getTotalPrice(this.product);
		}		
		
	}
	getTotalPrice(product){
		if(product.combo_offers.length !=0){
			if(size(product.combo_offers) > 3){
				this.isComboSlider = true;
			} else {
				this.isComboSlider = false;
			}
			Object.assign(product, {selected: true});
			product.combo_offers.map((prod) => {				
				return Object.assign(prod, {selected: true});
			});			
			this.totalPrice = product.combo_offers.reduce((prevValue, currProduct) => {				
				return prevValue + (currProduct.discount.amount > 0 ? currProduct.discount.amount : Number(currProduct.special_price));
			}, 0);
			
			this.totalPrice = this.totalPrice + Number(product.special_price);
		}
	}
	getComboOffer(option: any){	
		
		if(this.product.combo_offers.length !=0){				
			const comboItems = this.product.combo_offers.map((currProduct) => {				
				let currItems = {
					slug: currProduct.slug,
					qty: 1,
					seller_id: currProduct.seller.id,
					combo_offer: true
				};	
				
				return {...currItems};
			});
			
			const prodItems = {
				slug: option ? option.slug : this.product.slug, 
				qty: 1, 
				seller_id: this.showPopup ? option.sellerId : this.product.seller.id,
				combo_offer: true
			}
			this.cartItems = [...this.cartItems, ...[prodItems], ...comboItems];
			
			
		}
		
	}
	addTocart(): void {			
		if(this.cartItems.length != 0){
			this.cartService.addMultipleItems(this.cartItems);
		}
		
	}
	onSelectedComboProduct(product, combo: boolean, type: any){
		
		if(type == 'main-product' && !product.selected){			
			this.cartItems = this.cartItems.filter((item) => item.slug != product.slug );
			this.cartItems.map((item) => item.combo_offer = false);
		}
		if(type == 'main-product' && product.selected){
			this.cartItems.map((item) => item.combo_offer = true);						
		}
		if(type == 'combo-product' && !product.selected){			
			if(this.cartItems.length - 1 < 2){
				this.cartItems.map((item) => item.combo_offer = false);
			}	
		}
		if(type == 'combo-product' && product.selected){
			this.cartItems.map((item) => item.combo_offer = true);						
		}
		if(!product.selected){
			this.totalPrice = this.totalPrice - Number(product.special_price);
			this.cartItems = this.cartItems.filter((item) => item.slug != product.slug );
			
		} else {
			this.totalPrice = this.totalPrice + Number(product.special_price);
			let currItems = {
				slug: product.slug,
				qty: 1,
				seller_id: this.showPopup ? product.sellerId : product.seller.id,
				combo_offer: combo
			};
			this.cartItems = [...this.cartItems, ...[currItems]];
			
		}
	}
	
	ratingPercentCalc(rating: number, total_users: number) {
		if (total_users > 0)
			return rating / (total_users * 5) * 100;
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
	ngOnDestroy() {
		
	}

}
