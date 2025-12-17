import { Component, OnInit, ViewChild } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { Subscription } from 'rxjs';
import { NgbDropdown, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnd, Router } from '@angular/router';
@Component({
	selector: 'app-dropdown-cart',
	templateUrl: './dropdown-cart.component.html',
	styleUrls: ['./dropdown-cart.component.scss']
})
export class DropdownCartComponent implements OnInit {

	cartItems: any = [];
	cartSummary = {};
	totalCartItem: number = 0;
	routerSub:Subscription;
	@ViewChild('open') open: NgbDropdown;
	
	constructor(
		private router: Router,
		private cartService: CartService
	) {
		// this.cartService.products.subscribe((products) => {
		// 	this.totalCartItem = cartService.totalItems;
		// });
		this.cartService.cartSummary.subscribe(summary => {
			this.cartSummary = summary;
			this.totalCartItem = summary.total_cart_items;
		})
		this.router.events.subscribe((event) => {
			if(event instanceof NavigationEnd){				
				if(this.open){
					this.open.close();
				}
			  
			}
		});
	}

	ngOnInit(): void {
		this.cartService.products.subscribe(products => {
			this.cartItems = products;			
			this.cartItems?.forEach(e => {
				e.customVariants = '';
				e.product?.variants?.attributes?.forEach(eachVariant => {
					e.customVariants += "<span class='option'>" + eachVariant.attribute_name + ": " + eachVariant.attribute_value_name + "</span>";
				});
			});
		})
		
	}
	
	hideDrop(event: MouseEvent, drop: any) {		
		let anchor: NgbDropdownToggle = drop._anchor;
		if(event.offsetX > anchor.nativeElement.offsetWidth){
			drop.close();
		}
		if(event.offsetY < anchor.nativeElement.offsetTop){
			drop.close();
		}
		if(event.offsetX < anchor.nativeElement.offsetLeft){
			drop.close();
		}
	}

	incQnt(slug, currentQuantity) {
		// this.cartService.increaseQuantity(slug, currentQuantity);
	}

	decQnt(slug, currentQuantity) {
		// this.cartService.decreaseQuantity(slug, currentQuantity);
	}

	deleteCartItem(product_slug, cart_id, cart_session_id, seller_id) {
		this.cartService.removeProduct(product_slug, cart_id, cart_session_id, seller_id);
		this.cartService.cartSummary.subscribe(cart => {
			if(cart.total_cart_items < 1){
				this.cartItems = [];
				this.cartService.products.next([]);
			}
		});
	}

}
