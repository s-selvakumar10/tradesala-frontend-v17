import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';
import { ContactComponent } from './contact/contact.component';
import { PrivacyComponent } from './policies/privacy/privacy.component';
import { ProductListingComponent } from './policies/product-listing/product-listing.component';
import { TermsComponent } from './policies/terms/terms.component';
import { ReturnAndRefundComponent } from './policies/return-and-refund/return-and-refund.component';
import { ShippingComponent } from './policies/shipping/shipping.component';
import { PageGuard } from '../shared/common/page.guard';
import { PageResolver } from '../shared/common/page.resolver';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';


const routes: Routes = [
    { 
      path: 'about-us', 
      component: OverviewComponent,
      data: { title: 'About Us', breadcrumb: 'About Us', page_slug: 'about' },
      //canActivate: [PageGuard],
      resolve: {metaInfo: PageResolver},

    },
    { 
      path: 'contact', 
      component: ContactComponent, 
      data: { title: 'Contact Us', breadcrumb: 'Contact Us', page_slug: 'contact' },
      resolve: {metaInfo: PageResolver},
    },
    { 
      path: 'privacy-policy', 
      component: PrivacyComponent, 
      data: { title: 'Privacy Policy', breadcrumb: 'Privacy Policy', page_slug: 'privacy' },
      resolve: {metaInfo: PageResolver},
    },
    { 
      path: 'terms-and-condition', 
      component: TermsComponent, 
      data: { title: 'Terms and condition', breadcrumb: 'Terms and condition', page_slug: 'terms' },
      resolve: {metaInfo: PageResolver}, 
    },
    { 
      path: 'product-listing-policy', 
      component: ProductListingComponent, 
      data: { title: 'Product Listing Policy', breadcrumb: 'Product Listing Policy', page_slug: 'product-listing' },
      resolve: {metaInfo: PageResolver},
    },
    { 
      path: 'return-refund-policy', 
      component: ReturnAndRefundComponent, 
      data: { title: 'Return Refund Policy', breadcrumb: 'Return Refund Policy', page_slug: 'refund-policy' },
      resolve: {metaInfo: PageResolver},
    },
    { 
      path: 'shipping-policy', 
      component: ShippingComponent, 
      data: { title: 'Shipping Policy', breadcrumb: 'Shipping Policy', page_slug: 'shipping-policy' },
      resolve: {metaInfo: PageResolver},
    },
    { 
      path: '404', 
      component: PageNotFoundComponent,
      data: {breadcrumb: '404'}
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
