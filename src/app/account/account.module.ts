import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountComponent } from './account.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { OrderTrackingComponent } from './orders/order-tracking/order-tracking.component';
import { RefundViewComponent } from './orders/refund-order/refund-view/refund-view.component';
import { WhislistComponent } from './whislist/whislist.component';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AccountNavigationComponent } from './account-navigation/account-navigation.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { AddressComponent } from './address/address.component';
import { ReviewComponent } from './review/review.component';

@NgModule({
  declarations: [
    AccountComponent,
    AccountNavigationComponent,
    OrdersComponent,
    OrderDetailsComponent,
    OrderTrackingComponent,
    OrdersComponent,
    RefundViewComponent,
    WhislistComponent,
    PersonalInfoComponent,
    ReviewComponent,
    AddressComponent,
  ],
  imports: [CommonModule, AccountRoutingModule, SharedModule],
})
export class AccountModule {}
