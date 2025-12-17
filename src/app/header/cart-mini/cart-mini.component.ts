import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/core/models/product';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-cart-mini',
	templateUrl: './cart-mini.component.html',
	styleUrls: ['./cart-mini.component.scss']
})

export class CartMiniComponent implements OnInit {
	cartItems: any = [];
	cartItemTotal: number = 0;

	@Input('openMiniCart') isMiniCartOpen: boolean;
	@Output('closeMiniCart') miniCartShowEvent = new EventEmitter<boolean>();

	constructor(
		private cartService: CartService,
		private toastrService: ToastrService) {
	}
	
	ngOnInit(): void {
		this.isMiniCartOpen = false;

		this.cartService.products.subscribe(products => {
			this.cartItems = products;
			this.cartItemTotal = this.cartService.totalPrice;
		})
	}

	closeMiniCart() {
		this.isMiniCartOpen = false;
		this.miniCartShowEvent.emit(this.isMiniCartOpen);
	}
	
	incQnt(slug, currentQuantity){
		// this.cartService.increaseQuantity(slug, currentQuantity);
	}

	decQnt(slug, currentQuantity){
		// this.cartService.decreaseQuantity(slug, currentQuantity);		
	}

	deleteCartItem(product_slug){
		this.cartService.removeProduct(product_slug);
	}
}
