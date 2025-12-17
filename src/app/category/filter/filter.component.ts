import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { Category } from '../models/category';
import { Options, ChangeContext } from '@angular-slider/ngx-slider';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit, OnChanges {
  @Input() categories: Array<Category>;
  @Input() filterAttributes: any;
  @Input() prices: any;
 
  
  @Input() minValue: number = 0;
  @Input() maxValue: number = 0;
  options: Options = {
    floor: this.minValue,
    ceil: this.maxValue
  };
  
 

  @Output() categorySelected: EventEmitter<{
    slug: string;
  }> = new EventEmitter();

  @Output() filterSelected = new EventEmitter();
  @Input('selected-category-slug') selectedCategorySlug: string;
  isBrowser: boolean;
  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    
  }

  ngOnInit(): void { 
    
  }
  ngAfterViewInit(): void{
    
  }

  ngOnChanges(): void {
    
    this.filterAttributes?.forEach(element => {
      element.show = true;
    });
    this.options = {
      floor: this.prices?.minPrice || 0,
      ceil: this.prices?.maxPrice || 0
    }
    this.minValue = this.options.floor;
    this.maxValue = this.options.ceil;
   
  }
 
  onUserChange(changeContext: ChangeContext): void {
    let floorStyle = this.el.nativeElement.querySelector('.ngx-slider-floor');
    let ceilStyle = this.el.nativeElement.querySelector('.ngx-slider-ceil');
    if(this.options.floor < changeContext.value ){
      floorStyle.style.opacity = 0;
    } else {
      floorStyle.style.opacity = 1;
    }
    if(this.options.ceil > changeContext.highValue){      
      ceilStyle.style.opacity = 0;
    } else {
      ceilStyle.style.opacity = 1;
    }
  }
  toggle(element: HTMLElement) {
    element.classList.toggle('show');
  }

  toggleFilter(eachFilter) {
    eachFilter.show = !eachFilter.show;
  }

  onSelectFilter() {
    
    let filterData = {};
    this.filterAttributes?.forEach(e => {
      let arr = [];
      e.values?.forEach(x => {
        if (x.filterValue) {
          arr.push(x.id)
        }
      });
      filterData[e.name?.toLowerCase()] = arr;
    });
    
    this.filterSelected.emit(filterData);
  }
  
  onSelectCategory(slug: string) {
    this.selectedCategorySlug = slug;
    this.categorySelected.emit({ slug: slug });
  }

  priceChange(){
    let prices = {
      min_price : this.minValue,
      max_price : this.maxValue,
    }
    this.filterSelected.emit(prices);
  }

}
