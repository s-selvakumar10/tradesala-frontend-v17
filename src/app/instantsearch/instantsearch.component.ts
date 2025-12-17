import { Component, ElementRef, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../shared/services/search.service';
import { Product } from '../core/models/product';
import { ProductService } from '../core/services/product.service';
import { SessionFlow } from '../helper/session-flow';

@Component({
  selector: 'app-instantsearch',
  templateUrl: './instantsearch.component.html',
  styleUrls: ['./instantsearch.component.scss']
})
export class InstantsearchComponent implements OnInit, OnChanges {
  
  searchValue: string;
  products: Array<Product> = [];
  searchData: any;
  productId: string | number;
  page = 1;
  count = 0;
  pageSize = 3;
  filterData: { page: number; sortBy: string, search_keywords: string } = {
    page: this.page,
    sortBy: '',
    search_keywords: ''
  };

  prices: any;
  filterAttributes: any = [];
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private productService: ProductService,
    private el: ElementRef,
    private mobileDetect: SessionFlow,
  ) { 
    this.isMobile = this.mobileDetect.isMobile;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
     
      this.searchValue = params.search;
      this.searchResultData();
      this.searchFilter();
    });
    
  }
  ngOnChanges() {
    this.searchResultData();
  }
  searchResultData(){
    this.filterData.search_keywords = this.searchValue;
    this.searchService.getSearchPage(this.filterData).subscribe(
      (resp: any) => { 
        
        this.products = resp.products;
        const metaData = resp.meta;
        this.page = metaData.current_page;
        this.count = metaData.total;
        this.pageSize = metaData.per_page;
    },
    (err) => {
    });
  }
  mobileFilter(){
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.toggle('sticky');
  }
  closeFilter(){
    let sidebar = this.el.nativeElement.querySelector('.sidebar');
    sidebar.classList.remove('sticky');
  }
  searchFilter(){
    
    this.searchService.getSearchFilters(this.searchValue).subscribe(
      (data: any) => {
        this.filterAttributes = data.filter.product_attributes?.length > 0 ? data.filter.product_attributes : [];
        this.prices = data.price_range;
      }
    );
  }
  onOptionsSelected(sortBy: string) {
    this.page = 1;
    this.filterData.page = this.page;
    this.filterData.sortBy = sortBy;
    this.searchResultData();
  }
  onFilterSelect(event) {
    this.filterData = { ...this.filterData, ...event };
    this.searchResultData();
  }
  handlePageChange(event): void {
    this.page = event;
    this.filterData.page = this.page;
    this.searchResultData();
  }

}
