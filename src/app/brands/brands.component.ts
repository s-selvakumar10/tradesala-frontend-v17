import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BrandsService } from './brands.service';
import { BrandModel } from './brand-model';
import { Product } from '../core/models/product';
import { map } from 'rxjs/operators';
import { BreadcrumbService } from '../shared/breadcrumb/breadcrumb.service';
import { SessionFlow } from '../helper/session-flow';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {

  brandSlug: string;
  products: Array<Product> = [];
  selectedBrand: BrandModel;
  page = 1;
  count = 0;
  pageSize = 0;
  filterData: { page: number; sortBy: string } = {
    page: this.page,
    sortBy: '',
  };
  prices: any;
  filterAttributes: any = [];
  isMobile: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private brandService: BrandsService,
    private seoService: SeoService,
    private breadcrumbService: BreadcrumbService,
    private el: ElementRef,
    private mobileDetect: SessionFlow,
  ) {
    this.isMobile = this.mobileDetect.isMobile;
  }

  ngOnInit(): void {
    this.route.data.pipe(map(({ brand }) => brand)).subscribe(brand => {
      this.selectedBrand = brand;
    });

    this.route.params.subscribe((params) => {
      if (params['slug']) {
        this.brandSlug = params['slug'];
        this.setBrandDetails();
        this.getBrandProductData();
        this.getBrandFilter();
      }

    });

  }
  mobileFilter() {
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.toggle('sticky');
  }
  closeFilter() {
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.remove('sticky');
  }
  setBrandDetails() {    
    if (this.selectedBrand) {
      const seoContent = this.selectedBrand.brand.seo;
      const metaTags = [
        { name: 'description', content: seoContent.description },
        { name: 'keywords', content: seoContent.keywords },
        { name: 'title', content: seoContent.title },
      ];

      this.seoService.setTitle(seoContent.title);
      this.seoService.setMetaTags(metaTags);

      this.breadcrumbService.changeBreadcrumb(
        this.route.snapshot,
        this.selectedBrand.slug
      );
    }

  }
  getBrandProductData() {
    let filters = this.filterData;
    this.brandService.getBrandProducts(this.brandSlug, filters).subscribe(
      (data: any) => {
        this.products = data.products;
        const metaData = data.meta;
        this.page = metaData.current_page;
        this.count = metaData.total;
        this.pageSize = metaData.per_page;
      },
      (err) => {
      });
  }
  getBrandFilter() {
    this.brandService.getBrandFilters(this.brandSlug).subscribe(
      (data: any) => {
        this.filterAttributes = data.filter.product_attributes?.length > 0 ? data.filter.product_attributes : [];
        this.prices = data.price_range;
      });
  }
  onOptionsSelected(sortBy: string) {
    this.page = 1;
    this.filterData.page = this.page;
    this.filterData.sortBy = sortBy;
    this.getBrandProductData();
  }
  onFilterSelect(event) {
    this.filterData = { ...this.filterData, ...event };
    this.getBrandProductData();
  }
  handlePageChange(event): void {
    this.page = event;
    this.filterData.page = this.page;
    this.getBrandProductData();
  }

}
