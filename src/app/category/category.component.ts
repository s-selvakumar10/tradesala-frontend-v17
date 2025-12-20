import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Product, PriceRange } from '../core/models/product';
import { CategoryService } from '../core/services/category.service';
import { BreadcrumbService } from '../shared/breadcrumb/breadcrumb.service';
import { SeoService } from '../shared/services/seo.service';
import { Category } from './models/category';
import { SessionFlow} from 'src/app/helper/session-flow';
import { ResizeService } from '../core/services/resize.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, OnDestroy {
  categories: Array<Category> = [];
  categoriesSubs: Subscription;
  products: Array<Product>;
  selectedCategoryDetail: Category;
  //priceRange: PriceRange;

  @Input() public generalCategorySlug: string;
  @Input() public routeName: string = 'category';
  @Input('priceRange') price_range: any = [];
  @Input('min_price') minPrice: number = 0;
  @Input('max_price') maxPrice: number = 0;

  isMobile: boolean;

  page = 1;
  count = 0;
  pageSize = 3;
  prices: any;
  filterData: { page: number; sortBy: string } = {
    page: this.page,
    sortBy: '',
  };
  filterAttributes: any = [];
  isBrowser: boolean;
  resizeSub: Subscription;
  isLoading: boolean = false;
  
  constructor(
    protected router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private seoService: SeoService,
    private breadcrumbService: BreadcrumbService,
    private el: ElementRef,
    private mobileDetect: SessionFlow,
    private resizeService: ResizeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    this.isMobile = this.mobileDetect.isMobile;
   
  }

  ngOnInit(): void {  
    
    this.route.data.pipe(map(({ category }) => category)).subscribe(category => {
      this.setCategoryDetails(category.seo);
      this.selectedCategoryDetail = category;
      this.breadcrumbService.changeBreadcrumb(
          this.route.snapshot,
          this.selectedCategoryDetail.name
        );
    });


    this.categoriesSubs = this.categoryService.categories.subscribe(
      (categories) => {
        this.categories = categories;
      }
    );

    this.route.params.forEach((params: Params) => {
      if (params['slug']) {
        this.generalCategorySlug = params['slug'];
        this.getCategoryProduct();
        this.getProductFilters();
        this.getPriceRangeFilter();
      }
    });
    
    this.resizeSub = this.resizeService.onResize$.pipe(filter((event) => event.innerWidth <= 1024)).subscribe((event) => {
      if(event.innerWidth <= 1024){
        this.isMobile = true;        
      }
    });
  }
 
  setCategoryDetails(category) {

    const metaInfo = environment.config.metaInfo;
    const seoContent = category || {};
    this.seoService.setTitle(seoContent.title);
    const metaTags = [
      { name: 'description', content: seoContent.description || '' },
      { name: 'keywords', content: seoContent.keywords || '' },
      { name: 'title', content: seoContent.title || '' },
    ];

    const metaGraph = [
		  { property: 'og:title', content: seoContent.title || metaInfo.title },
		  { property: 'og:site_name', content: metaInfo.og_sitename },
		  { property: 'og:url', content: metaInfo.og_url },
		  { property: 'og:locale', content: metaInfo.og_locale },
		  { property: 'og:description', content: seoContent.description || metaInfo.description },
		  { property: 'og:type', content: metaInfo.og_type},
		  { property: 'og:image', content: metaInfo.og_image },
		  { property: 'og:image:width', content: '600' },
		  { property: 'og:image:height', content: '600' },		  
		  { property: 'og:image:alt', content: '' },    
		  { property: 'twitter:card', content: metaInfo.twt_card },
		  { property: 'twitter:site', content: metaInfo.twt_site },
		  { property: 'twitter:creator', content: metaInfo.twt_site },
		  { property: 'twitter:url', content: metaInfo.twt_url },
		  { property: 'twitter:title', content: seoContent.title || metaInfo.title},
		  { property: 'twitter:description', content: seoContent.description || metaInfo.description},
		  { property: 'twitter:image', content: metaInfo.twt_image }
		];
    
    this.seoService.setMetaTags(metaTags);
    this.seoService.setMetaGrapLd(metaGraph);
  }
  mobileFilter(){
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.toggle('sticky');
  }
  closeFilter(){
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.remove('sticky');
  }
  getCategoryProduct() {
    this.categoryService
      .getCategoryProducts(this.generalCategorySlug, this.filterData)
      .subscribe((data) => {
        
        this.isLoading = true;
        this.products = data.products;
        const metaData = data.meta;

        this.page = metaData.current_page;
        this.count = metaData.total;
        this.pageSize = metaData.per_page;
      });
  }

  getProductFilters() {
    this.page = 1;
    this.filterData = {
      page: this.page,
      sortBy: ''
    };
    this.categoryService
      .getProductFilters(this.generalCategorySlug, this.filterData)
      .subscribe((data: any) => {        
        this.filterAttributes = data?.product_attributes;       
      });
  }

  getPriceRangeFilter(){
    this.categoryService.getRangePrice(this.generalCategorySlug)    
    .subscribe((data: any) => { 
      this.price_range = data.minPrice;
      this.prices = data;     
      this.minPrice = data.minPrice;
      this.maxPrice = data.maxPrice
    });
  }

  handlePageChange(event): void {
    this.page = event;
    this.filterData.page = this.page;
    this.getCategoryProduct();
    window.scrollTo(0, 0);
  }

  onOptionsSelected(sortBy: string) {
    this.page = 1;
    this.filterData.page = this.page;
    this.filterData.sortBy = sortBy;
    this.getCategoryProduct();
  }

  onCategorySelect(event) {    
    this.router.navigate([this.routeName, event.slug]);
  }

  onFilterSelect(event) {
    this.filterData = { ...this.filterData, ...event };
    this.getCategoryProduct();
  }

  ngOnDestroy() {
    this.categoriesSubs.unsubscribe();
  }
}
