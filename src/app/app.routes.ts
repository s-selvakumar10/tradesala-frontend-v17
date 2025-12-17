import { Routes } from '@angular/router';
import { DefaultComponent } from './layout/default/default.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '',
        loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
        data: { breadcrumb: 'Home', preload: true, delay: false, page_slug: 'homepage' }       
      },
      {
        path: 'blog',
        loadChildren: () =>
          import('./posts/posts.module').then((m) => m.PostsModule),
        data: { preload: false, delay: false, page_slug: '' },
      },
      {
        path: '',
        loadChildren: () =>
          import('./checkout/checkout.module').then((m) => m.CheckoutModule),
        data: { preload: false, delay: true, page_slug: '' },
      },
      {
        path: '',
        loadChildren: () =>
          import('./auth/auth.module').then((m) => m.AuthModule),
        data: { preload: false, delay: false, page_slug: '' },
      },
      {
        path: 'account',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./account/account.module').then((m) => m.AccountModule),
        data: { preload: false, delay: false, page_slug: '' },
      },      
      {
        path: 'category',
        loadChildren: () =>
          import('./category/category.module').then((m) => m.CategoryModule),
        data: { preload: false, delay: false, page_slug: '' },
      },
      {
        path: '',
        loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
        data: { preload: true, delay: false, page_slug: '' },       
      },
      {
        path: '',
        loadChildren: () =>
          import('./brands/brands.module').then((m) => m.BrandsModule),
          data: { preload: false, delay: false, page_slug: '' },
      },
      {
        path: '',
        loadChildren: () =>
          import('./instantsearch/instantsearch.module').then((m) => m.InstantsearchModule),
        data: { preload: false, delay: false, page_slug: '' },
      },
      {
        path: '',
        loadChildren: () =>
          import('./product/product.module').then((m) => m.ProductModule),
        data: { preload: false, delay: true, page_slug: '' },
      },
      
    ],
  },
];
