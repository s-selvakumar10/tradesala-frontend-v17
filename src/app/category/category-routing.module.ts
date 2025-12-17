import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category.component';
import { CategoryResolver } from './guards/category.resolver';

const routes: Routes = [
  {
    path: 'search',
    component: CategoryComponent,
  },
  {
    path: ':slug',
    component: CategoryComponent,
    resolve: { category: CategoryResolver },
    data:{ breadcrumb: (data: any) => `${data.category.name}` }
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
