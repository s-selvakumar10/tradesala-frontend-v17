import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../core/models/product';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { Wishlist } from '../../core/models/wishlist';
import { WishlistService } from 'src/app/shared/services/wishlist.service';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
	selector: 'app-whislist',
	templateUrl: './whislist.component.html',
	styleUrls: ['./whislist.component.scss']
})

export class WhislistComponent implements OnInit {

	itemCart: any = [];
	@Input() product: Product;
	@Input() wishlist: Wishlist;
	data: any;
	public wishlists$: Array<Wishlist> = [];
	public featuredproducts$: Array<Product>;
	userId: string;
	inStock: boolean = true;
	noReturnAlert: boolean = false;
	productQty: number = 0;
	page = 1;
	count = 0;
	pageSize = 0;
	per_page = 12;  
	filterData: { page: number; per_page: number} = {
		page: this.page,
		per_page: this.per_page
	};
	constructor(
		private authService: AuthService,
		private cartService: CartService,
		private toast: ToastrService,
		private productService: ProductService,
		private wishlistService: WishlistService,
		private router: Router
	) {
		this.authService.user.subscribe(user => {
			const isAuth = !!user;
			if (isAuth) {
				this.userId = user.id;
			}

		});
	}

	ngOnInit(): void {		
		this.getWhislistData();
		this.productService.getFeaturedProducts().subscribe(res => {
			this.featuredproducts$ = res;
		});
	}

	getWhislistData(){
		let filters = this.filterData;
		this.wishlistService.getWishlistItems(this.userId, filters).subscribe(
			(data: any) =>{
				this.wishlists$ = data.wishlists;
			  	const metaData = data.meta;	  
			  	this.page = metaData.current_page;
			  	this.count = metaData.total;
			  	this.pageSize = metaData.per_page;
			},    
			(err) => {
		});
		
	}
	handlePageChange(event): void {
		this.page = event;
		this.filterData.page = this.page;
		this.getWhislistData();    
	  }

	addTocart(product): void {

		if (product.has_variants) {
			this.router.navigate(['/' + product.slug]);
		} else {
			this.getProdQtyFromCart(product);
			if (this.validateQty(product)) {
				this.cartService.addProduct(product.slug, 1, product.seller.id, {}, false);
			} else {
				if (!this.inStock) {
					this.toast.warning('Out of stock', 'Warning!');
				}
			}
		}
	}
	ratingPercentCalc(rating: number, total_users: number) {
		if (total_users > 0)
			return rating / (total_users * 5) * 100;
		return 0;
	}

	removeWishlist(event) {
		if (event) {
			this.wishlists$ = this.wishlists$?.filter((e: any) => e.id != event)
		}
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
}
