import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';
import { CartComponent } from './cart/cart.component';
import { SuccessComponent } from './success/success.component';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';
import { SharedModule } from '../shared/shared.module';
import {LoaderInterceptorProvider } from '../core/interceptors/loader.interceptor';


@NgModule({
  declarations: [
    CheckoutComponent,
    CartComponent,
    SuccessComponent,
    PaymentFailedComponent
  ],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    SharedModule
  ],
  providers: [
    //LoaderInterceptorProvider
  ]
})
export class CheckoutModule { }
