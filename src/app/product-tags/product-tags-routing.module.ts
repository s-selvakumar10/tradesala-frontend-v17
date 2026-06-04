import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductTagListComponent } from './product-tag-list/product-tag-list.component';
import { productTagResolver } from './product-tag-resolver.resolver';

const routes: Routes = [
  {
    path: 'product/tags/:tag',
    component: ProductTagListComponent,
    resolve:{collection: productTagResolver},
    data:{ breadcrumb: (data: any) => `${data.collection.name}` },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductTagsRoutingModule { }
