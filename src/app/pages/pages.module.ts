import { NgModule } from '@angular/core';

import { PagesRoutingModule } from './pages-routing.module';

import { SharedModule } from '../shared/shared.module';
import { PrivacyComponent } from './policies/privacy/privacy.component';
import { ProductListingComponent } from './policies/product-listing/product-listing.component';
import { TermsComponent } from './policies/terms/terms.component';
import { ReturnAndRefundComponent } from './policies/return-and-refund/return-and-refund.component';
import { ShippingComponent } from './policies/shipping/shipping.component';
import { ContactComponent } from './contact/contact.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [
      PrivacyComponent,
      TermsComponent,
      ProductListingComponent,
      ReturnAndRefundComponent,
      ShippingComponent,
      ContactComponent,
  ],
  imports: [
    PagesRoutingModule,
    SharedModule,
  ]
})
export class PagesModule { }
