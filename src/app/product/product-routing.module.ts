import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ProductResolver } from "./guards/product.resolver";
import { ProductDetailPageComponent } from "./product-detail-page.component";

const routes: Routes = [    
    {
        path: ':productid',
        component: ProductDetailPageComponent,
        resolve: { product: ProductResolver },
        data:{ breadcrumb: (data: any) => `${data.product.name}` }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutingModule { }