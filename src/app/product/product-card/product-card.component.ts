import { Component, EventEmitter, PLATFORM_ID, Inject, Input, Output, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, SimpleChange, afterRender, afterNextRender } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Product } from '../../core/models/product';
import { CartService } from 'src/app/shared/services/cart.service';
import { WishlistService } from 'src/app/shared/services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/user.model';
import { Wishlist } from 'src/app/core/models/wishlist';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from 'src/app/shared/login-popup/login-popup.component';

@Component({
	selector: 'app-product-card',
	templateUrl: './product-card.component.html',
	styleUrls: ['./product-card.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {

	itemCart: any = [];
	@Input() product: Product;
	data: any;
	@Output() removeWishlistEmit = new EventEmitter();
	private userSub: Subscription;
	isAuthenticated: Boolean = false;
	user: User;
	wishlists: Array<Wishlist>;
	inStock: boolean = true;
	noReturnAlert: boolean = false;
	productQty: number = 0;
	
	productSub$: Subscription;
	isWishlistPage: boolean = false;
	modalOptions: NgbModalOptions;

	contentLoaded: boolean = false;
	isLoading: boolean = false;
	
	constructor(
		private authService: AuthService,
		private cartService: CartService,
		private wishlistService: WishlistService,
		private toast: ToastrService,
		private router: Router,
		private modalService: NgbModal,
		private cd: ChangeDetectorRef,
		private zone: NgZone,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		this.modalOptions = {
			backdrop: 'static',
			backdropClass: 'loginBackdrop',
			ariaLabelledBy: 'modal-basic-title',	
			centered: true
		}		
	}

	ngOnInit(): void {	
		this.userSub = this.authService.user.subscribe(user => {
			this.isAuthenticated = !!user;
			this.user = user;
		});		
		if (isPlatformBrowser(this.platformId)){
			if (location.href?.includes('account/dashboard')) {
				this.isWishlistPage = true;
			}
		}
	}
	ngOnChanges(product: SimpleChange): void {
		if (isPlatformBrowser(this.platformId)){
			if(product){
				this.contentLoaded = true;
				this.cd.detectChanges();
			} else {
				this.zone.run(() => {
					setTimeout(() => {	
						this.contentLoaded = true;
						this.cd.detectChanges();
					}, 500);
				});
			}
			
		}
		
	}
	ngAfterViewInit() {
		
	}

	addTocart(product): void {		
		this.router.navigate(['/' + product.slug]);
	}

	validateQty(product) {
		let status = true;
		if (this.productQty + 1 > product.stock?.maximum_order) {
			status = false;
			this.toast.warning('Maximum allowed qty is ' + product.stock?.maximum_order, 'Warning!');
		}
		if ((this.productQty + 1 > product.stock?.bulk_order) && !this.noReturnAlert && status) {
			this.noReturnAlert = true;
			status = true;
			this.toast.info("Product not returnable if quantity is more than " + product.stock?.bulk_order, 'Note!');
		}
		if (!status) {
			return status;
		} else {
			return this.outOfStockValidation(product);
		}
	}

	getProdQtyFromCart(product) {
		this.cartService.products.subscribe((products: any) => {
			let cartProducts = products;
			this.productQty = cartProducts?.find((e: any) => e.id == product.id)?.qty || 0;
			
		})
	}

	outOfStockValidation(product) {
		let status = true;
		if (this.productQty + 1 > product.stock?.total_on_hand) {
			this.inStock = false;
			status = false;
		} else {
			this.inStock = true;
		}
		return status;
	}

	addTowishlist(product): void {
		if (this.isAuthenticated == true) {
			this.wishlistService.addToWishlist(product.slug).subscribe(response => {
				if (response.body.status == true) {
					this.toast.success(response.body.message, 'Success!');
					product.wishlist.has_wishlist = true;
					this.getWishlist();
				} else {
					this.router.navigate(['/account/dashboard']);
					localStorage.setItem('showWishlist', "true");
				}
			});
		} else {
			this.loginPopup();
		}
	}

	getWishlist() {
		this.wishlistService.getWishlist(this.user.id).subscribe(res => {
			this.wishlistService.updateWishListItems(res);
		});
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
	
	loginPopup() {
		this.modalService.open(LoginPopupComponent, this.modalOptions);
	}
	removeFromWishList(wishlist) {
		this.wishlistService.removeFromWishlist(this.user.id, wishlist?.item?.w_id).subscribe(response => {
			
			if (response.status == true) {
				this.toast.success(response.message, 'Success!');
				this.removeWishlistEmit.emit(wishlist?.item?.w_id);
				this.getWishlist();
				//this.wishlistService.updateWishListItems(response);				
				localStorage.setItem('showWishlist', "true");
				if (isPlatformServer(this.platformId)) {
					location.reload();
				}
				// this.product.wishlist = { has_wishlist: false, item: {} }
			}
		});
	}

	ngOnDestroy() {
		this.userSub.unsubscribe();		
	}

	
}
