import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductCollectionListComponent } from './product-collection-list/product-collection-list.component';
import { productCollectionResolver } from './product-collection-resolver.resolver';

const routes: Routes = [
  {
    path: 'collection/:collection',
    component: ProductCollectionListComponent,
    resolve: { collection: productCollectionResolver },
    data:{ breadcrumb: (data: any) => `${data.collection.name}` }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductCollectionRoutingModule { }
