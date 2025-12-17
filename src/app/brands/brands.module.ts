import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandsRoutingModule } from './brands-routing.module';
import { SharedModule } from '../shared/shared.module';
import { BrandsComponent } from './brands.component';
import { FilterComponent } from './filter/filter.component';
import { AllBrandsComponent } from './all-brands/all-brands.component';


@NgModule({
  declarations: [
    BrandsComponent,
    FilterComponent,
    AllBrandsComponent
  ],
  imports: [
    CommonModule,
    BrandsRoutingModule,
    SharedModule
  ]
})
export class BrandsModule { }
