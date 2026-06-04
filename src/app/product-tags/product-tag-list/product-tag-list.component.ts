import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Product } from 'src/app/core/models/product';
import { ProductService } from 'src/app/core/services/product.service';
import { SessionFlow } from 'src/app/helper/session-flow';
import { BreadcrumbService } from 'src/app/shared/breadcrumb/breadcrumb.service';
import { SeoService } from 'src/app/shared/services/seo.service';

@Component({
  selector: 'app-product-tag-list',
  standalone: false,
  templateUrl: './product-tag-list.component.html',
  styleUrl: './product-tag-list.component.scss'
})
export class ProductTagListComponent {
  collection: any;
    products: Array<Product>;
    page = 1;
    count = 0;
    pageSize = 3;
    isMobile: boolean;
    isBrowser: boolean;
    constructor(
      private activatedRoute: ActivatedRoute,
      private productService: ProductService,
      private seoService: SeoService,
      private breadcrumbService: BreadcrumbService,
      private mobileDetect: SessionFlow,
      @Inject(PLATFORM_ID) private platformId: Object
    ){
      this.isBrowser = isPlatformBrowser(platformId);
      this.isMobile = this.mobileDetect.isMobile;
      this.activatedRoute.data.pipe(map(({collection}) => collection)).subscribe((collection) => {
        if(collection){
          this.collection = collection;
          this.setMetaInfo(collection);
          this.getProductList(collection.id);
        }
      })
    }
  
    getProductList(id){
      const param = {
        id: id,
        page: this.page
      }
      this.productService.getProductTagList(param).subscribe(res => {
        this.products = res.products;
        const metaData = res.meta;
        this.page = metaData.current_page;
        this.count = metaData.total;
        this.pageSize = metaData.per_page;
      })
    }
  
    setMetaInfo(collection){
      this.seoService.setTitle(collection.name);
      const metaTags = [
          { name: 'description', content: collection.meta_desc },
          { name: 'keywords', content: collection.meta_keywords },
          { name: 'title', content: collection.name  },
        ];
      this.seoService.setMetaTags(metaTags);    
      this.breadcrumbService.changeBreadcrumb(
        this.activatedRoute.snapshot,
        collection.slug
      );
    }
    handlePageChange(event): void {
      this.page = event;
      //this.filterData.page = this.page;
      this.getProductList(this.collection.id);
    }
}
