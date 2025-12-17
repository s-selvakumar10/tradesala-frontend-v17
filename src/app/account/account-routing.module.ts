import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountComponent } from './account.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { OrderTrackingComponent } from './orders/order-tracking/order-tracking.component';
import { RefundViewComponent } from './orders/refund-order/refund-view/refund-view.component';
import { WhislistComponent } from './whislist/whislist.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AccountComponent,
  },
  { path: 'orders/history', component: OrdersComponent },
  { path: 'orders/details/:id', component: OrderDetailsComponent },
  { path: 'orders/tracking', component: OrderTrackingComponent },
  { path: 'orders/history', component: OrdersComponent },
  { path: 'orders/refund-view/:id/:invId', component: RefundViewComponent },
  { path: 'whislist', component: WhislistComponent },
  { path: 'review/list', component: ReviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
