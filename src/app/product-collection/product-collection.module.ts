import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductCollectionRoutingModule } from './product-collection-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProductCollectionListComponent } from './product-collection-list/product-collection-list.component';


@NgModule({
  declarations: [
    ProductCollectionListComponent
  ],
  imports: [
    CommonModule,
    ProductCollectionRoutingModule,
    SharedModule,
  ]
})
export class ProductCollectionModule { }
