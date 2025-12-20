import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../core/models/product';
import { BreadcrumbService } from '../shared/breadcrumb/breadcrumb.service';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-product-detail-page',
  template: `
    <app-product-detail [product]="product$ | async"></app-product-detail>
  `,
  styleUrls: [],
})
export class ProductDetailPageComponent implements OnInit {
  product$: Observable<Product>;
  schema: any;
  constructor(
    private route: ActivatedRoute, 
    private meta: Meta,
    private title: Title,
    private breadcrumbService: BreadcrumbService,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
  }

  ngOnInit(): void {
    this.product$ = this.route.data.pipe(map(({ product }) => product));    
    this.product$.subscribe(product => { 
      if(product)       {
        this.addMetaInfo(product);
        this.setJsonSchema(product);
        this.breadcrumbService.changeBreadcrumb(
          this.route.snapshot,
          product.name
        );
      }
      
      
    });

  }
  
    addMetaInfo(product: Product) {  
      
      this.meta.updateTag({
        name: 'description',
        content: product.seo.description,
      });
  
      this.meta.updateTag({
        name: 'keywords',
        content: product.seo.keywords,
      });
      const url = environment.frontEndUrl + '/' + product.slug;
      let productImages = product.media.front_image as string;
     
      this.meta.updateTag({ property: 'og:title', content: product.seo.title });
      this.meta.updateTag({ property: 'og:site_name', content: environment.config.appName });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:description', content: product.seo.description });
      this.meta.updateTag({ property: 'og:type', content: 'product' });
      this.meta.updateTag({ property: 'og:image', content: productImages });
      this.meta.updateTag({ property: 'og:image:width', content: '600' });
      this.meta.updateTag({ property: 'og:image:height', content: '600' });
      this.meta.updateTag({ property: 'og:image', content: productImages });
      this.meta.updateTag({ property: 'og:image:alt', content: product.name });
  
      this.meta.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ property: 'twitter:site', content: '@tradesala' });
      this.meta.updateTag({ property: 'twitter:url', content: url });
      this.meta.updateTag({ property: 'twitter:title', content: product.seo.title });
      this.meta.updateTag({ property: 'twitter:description', content: product.seo.description });
      this.meta.updateTag({ property: 'twitter:image', content: productImages });
  
      this.title.setTitle(product.seo.title);
  
      if(environment.staging){
        this.meta.updateTag({
          name: 'robots',
          content: 'noindex, nofollow',
        });
      }
    }
    setJsonSchema(product: Product) {    
      const stockStatus = (product.stock.stock_status == 'In Stock') ? 'InStock' : 'OutOfStock';
      this.schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "productID": product.sku,
        "name": product.name,
        "description": product.seo.description,
        "url": isPlatformBrowser(this.platformId) ? location.href : '',
        "itemCondition": "https://schema.org/NewCondition",
        "brand": {
          "@type": "Brand",
          "name": `${product.brand.name}`
        },      
        "image": product.media.front_image,
        "offers": [
          {
            "@type": 'Offer',
            "itemCondition": "https://schema.org/NewCondition",
            "availability": `https://schema.org/${stockStatus}`,
            "price": product.special_price,
            "priceCurrency": 'INR'
          }
        ]
  
      };
      if(product.rating_summary.review_count > 0){
        const review = {
          "aggregateRating": {
            '@type': 'AggregateRating',
            "ratingValue": product.rating_summary.average_rating,
            "reviewCount": `${product.rating_summary.review_count}`
          }
        };
        this.schema = {...this.schema, ...review}
      }
      //this.seoService.setJsonLd(this.schema);
      this.seoService.updateJsonLd({type: 'application/ld+json', text: JSON.stringify(this.schema, null, 2)});
    }
}
