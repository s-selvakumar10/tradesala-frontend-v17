import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../core/models/product';
import { BreadcrumbService } from '../shared/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-product-detail-page',
  template: `
    <app-product-detail [product]="product$ | async"></app-product-detail>
  `,
  styleUrls: [],
})
export class ProductDetailPageComponent implements OnInit {
  product$: Observable<Product>;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.product$ = this.route.data.pipe(map(({ product }) => product));    
    this.product$.subscribe(product => {        
      this.breadcrumbService.changeBreadcrumb(
        this.route.snapshot,
        product.name
      );
      
    });

  }
}
