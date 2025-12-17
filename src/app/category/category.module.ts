import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from '../category/category.component';
import { FilterComponent } from './filter/filter.component';
import { SharedModule } from '../shared/shared.module';
import { CategoryStickyDirective } from '../shared/sticky-sidebar/category-sticky.directive';

@NgModule({
  declarations: [
    CategoryStickyDirective,
    CategoryComponent,
    FilterComponent,    
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    SharedModule
  ]
})
export class CategoryModule { }
