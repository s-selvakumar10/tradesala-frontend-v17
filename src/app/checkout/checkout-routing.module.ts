import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout.component';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';
import { PaymentVerifyComponent } from './payment-verify/payment-verify.component';
import { SuccessComponent } from './success/success.component';
import { CartResolver } from './guard/cart.resolver';

const routes: Routes = [
  {
    path: 'checkout',
    children: [
      { path: 'checkoutDetails', component: CheckoutComponent },
      { path: 'cart', component: CartComponent, resolve: {cart: CartResolver} },
      { path: 'processing', component: PaymentVerifyComponent },
    ],
  },
  { path: 'order/failed', component: PaymentFailedComponent },
  { path: 'order/success', component: SuccessComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
