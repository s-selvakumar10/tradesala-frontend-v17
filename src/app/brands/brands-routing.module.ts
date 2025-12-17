import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllBrandsComponent } from './all-brands/all-brands.component';
import { BrandsComponent } from './brands.component';
import { BrandResolver } from './guards/brand.resolver';
import { PageResolver } from '../shared/common/page.resolver';

const routes: Routes = [
  { 
    path: 'brands', 
    component: AllBrandsComponent,
    data: { breadcrumb: 'Brands', page_slug: 'brands' },
    resolve: {metaInfo: PageResolver},
  },
  { 
    path: 'brand/:slug', 
    component: BrandsComponent,
    resolve: { brand: BrandResolver },
    data: { breadcrumb: 'Brand' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandsRoutingModule { }
