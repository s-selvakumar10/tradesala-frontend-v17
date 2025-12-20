import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {size} from 'lodash-es'
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-seller-offer-popup',
  templateUrl: './seller-offer-popup.component.html',
  styleUrls: ['./seller-offer-popup.component.scss']
})
export class SellerOfferPopupComponent implements OnInit {
  @Input() public main_product;
  @Input() public product;
  showModal: boolean = true;
  discountOpt: OwlOptions = {
    loop: false,
    autoplay: false,
    autoWidth: true,
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
        items: 7,
      },
      400: {
        items: 7,
      },
    },
  };
  isQtyDiscountSlider = false;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.showModal){
      this.product = Object.assign(this.product, {combo_offers: this.product.discounts.combo_offers});
    }
    
    // delete this.product.discounts.combo_offers;
   
    if(size(this.product.discounts.quantity_based_discount.discount) > 4){
      this.isQtyDiscountSlider = true;
    } else {
      this.isQtyDiscountSlider = false;
    }
    
  }

  closeModal(){
    this.showModal = false;
    this.activeModal.dismiss({show_modal: false});
  }

}
