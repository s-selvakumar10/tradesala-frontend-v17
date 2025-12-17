import { Options } from '@angular-slider/ngx-slider';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {

  @Input() filterAttributes: any;
  @Input() prices: any;
  isBrowser: boolean;
  minValue: number = 50;
  maxValue: number = 200;
  options: Options = {
    floor: 50,
    ceil: 200
  };

  @Output() filterSelected = new EventEmitter();
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    
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
  priceChange(){
    let prices = {
      min_price : this.minValue,
      max_price : this.maxValue,
    }
    this.filterSelected.emit(prices);
  }

}
