import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstantsearchRoutingModule } from './instantsearch-routing.module';
import { InstantsearchComponent } from '../instantsearch/instantsearch.component';
import { FilterComponent } from '../instantsearch/filter/filter.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    InstantsearchComponent,
    FilterComponent
  ],
  imports: [
    CommonModule,
    InstantsearchRoutingModule,
    SharedModule
  ]
})
export class InstantsearchModule { }
