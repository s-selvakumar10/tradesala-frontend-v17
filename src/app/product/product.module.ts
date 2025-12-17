import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgZoomModule } from '../shared/image-zoom/image-zoom.module';
import { YouTubePlayerModule } from '@angular/youtube-player';

import { SharedModule } from '../shared/shared.module';
import { ProductRoutingModule } from './product-routing.module';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductDetailPageComponent } from './product-detail-page.component';
import { ProductImagesComponent } from './product-images/product-images.component';
import { ProductPriceInfoComponent } from './product-price-info/product-price-info.component';
import { ProductReviewComponent } from './product-review/product-review.component';
import { ProductSpecComponent } from './product-spec/product-spec.component';
import { ProductStickyDirective } from '../shared/sticky-sidebar/product-sticky.directive';
import { ProductComboOfferComponent } from './product-combo-offer/product-combo-offer.component';
import { SellerOfferPopupComponent } from './modal-box/seller-offer-popup/seller-offer-popup.component';

@NgModule({
  declarations: [
    ProductDetailPageComponent,
    ProductDetailComponent,
    ProductImagesComponent,
    ProductPriceInfoComponent,
    ProductReviewComponent,
    ProductSpecComponent,
    ProductStickyDirective,
    ProductComboOfferComponent,
    SellerOfferPopupComponent,
  ],
  imports: [
    CommonModule, 
    ProductRoutingModule,
    ImgZoomModule,
    SharedModule,
    YouTubePlayerModule
  ]
})
export class ProductModule {}


