import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductTagsRoutingModule } from './product-tags-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProductTagListComponent } from './product-tag-list/product-tag-list.component';


@NgModule({
  declarations: [
    ProductTagListComponent
  ],
  imports: [
    CommonModule,
    ProductTagsRoutingModule,
    SharedModule
  ]
})
export class ProductTagsModule { }
