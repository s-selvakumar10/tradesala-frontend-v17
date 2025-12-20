import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TruncatePipe } from '../helper/truncate.pipe';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ProductCardComponent } from '../product/product-card/product-card.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductGridSliderComponent } from './owl-slider/product-grid-slider/product-grid-slider.component';
import { BreadcrumbModule } from './breadcrumb/breadcrumb.module';

import { LoginModalComponent } from '../auth/modal/login/login.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { RegisterModalComponent } from '../auth/modal/register/register.component';
import { RegisterPopupComponent } from './register-popup/register-popup.component';
import { StickySidebarDirective } from './sticky-sidebar/sticky-sidebar.directive';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { LazyLoadDirective } from './lazy-load-image/lazy-load.directive';
import { StringReplacePipe } from '../helper/replace-text.pipe';
import { DeliveryPincodeModalComponent } from './delivery-pincode-modal/delivery-pincode-modal.component';
import { ShareButtons } from 'ngx-sharebuttons/buttons';
import { SanitizeHtmlPipe } from '../helper/sanitize-html.pipe';
import { EmptyProductsComponent } from './empty-products/empty-products.component';

@NgModule({
  declarations: [
    EmptyProductsComponent,
    ProductCardComponent,
    SanitizeHtmlPipe,
    TruncatePipe,
    StringReplacePipe,
    ProductGridSliderComponent,
    LoginModalComponent,
    LoginPopupComponent,
    RegisterModalComponent,
    RegisterPopupComponent,
    StickySidebarDirective,
    LazyLoadDirective,
    DeliveryPincodeModalComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    RouterModule,
    NgOptimizedImage,
    CarouselModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    BreadcrumbModule,
    NgxSliderModule,
    ShareButtons
  ],
  // entryComponents:[
  //   LoginPopupComponent,
  //   RegisterPopupComponent
  // ],
  exports: [
    NgbModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
    CarouselModule,
    EmptyProductsComponent,
    ProductCardComponent,
    ProductGridSliderComponent,
    NgxPaginationModule,
    BreadcrumbModule,
    StickySidebarDirective,
    NgxSliderModule,
    LazyLoadDirective,
    SanitizeHtmlPipe,
    TruncatePipe,
    StringReplacePipe,
    ShareButtons
  ]
})
export class SharedModule {}
