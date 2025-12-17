import { Component, ElementRef, OnInit, Input, ViewChild, NgZone, Inject } from '@angular/core';
import { Category } from '../../category/models/category';
import { Router } from '@angular/router';
import {
  ProductSearchResult,
  SearchService,
} from '../../shared/services/search.service';
import {
  Subscription,
  fromEvent,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap,
} from 'rxjs/operators';

import { SessionFlow } from 'src/app/helper/session-flow';
import { ResizeService } from 'src/app/core/services/resize.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() selectedCategory: Category;

  isSearching: boolean;
  searchResults: ProductSearchResult[];
  searchResultState: Boolean = false;
  isMobile: boolean = false;
  search_value = '';

  resizeSub: Subscription;

  
  @ViewChild('searchBarInput', { static: true }) searchBarInput: ElementRef;

  constructor(
    private searchService: SearchService,
    private router: Router,
    private mobileDetect: SessionFlow,
    private resizeService: ResizeService,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isSearching = false;
    this.isMobile = this.mobileDetect.isMobile;
  }

  ngOnInit(): void {
    this.zone.run(() => {
      setTimeout(() => {        
        fromEvent(this.document.getElementById('searchInput'), 'keyup')
          .pipe(
            debounceTime(1000),
            map((event: any) => {               
              if(event.keyCode === 13 && event.key=== 'Enter'){
                this.onSubmit();
              }
              if (event.target.value < 1) {
                this.closeSearchResult();
              }

              return event.target.value;
            }),
            filter((res) => res.length > 1),
            distinctUntilChanged(),
            tap((text: string) => {
            
              this.isSearching = true;
  
              this.searchService.getResultList({ search_keywords: text }).subscribe(
                (resp: any) => {
                  this.isSearching = false;
                  this.searchResults = resp;
                  this.openSearchResult();
                },
                (err) => {
                  this.isSearching = false;            
                  this.closeSearchResult();
                }
              );
            })
          ).subscribe();
        this.resizeSub = this.resizeService.onResize$.pipe(filter((event) => event.innerWidth <= 1024)).subscribe((event) => {
          if(event.innerWidth <= 1024){
            this.isMobile = true;
          }
        });
      }, 300);
      
    });
    
  }
  ngOnChanges(){    
    //this.searchBarInput.nativeElement.value = '';
    this.search_value = '';
  }
  openSearchResult() {
    this.searchResultState = true;
  }

  closeSearchResult() {
    this.searchResultState = false;    
  }

  closeSearchResultWithDelay() {
    const $this = this;
    setTimeout(() => $this.closeSearchResult(), 300);
    // setTimeout(() => {
    //   //this.searchBarInput.nativeElement.value = '';
    //   this.search_value = '';
    // }, 300);
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
  }
  onSubmit() {
        
    if (location.href?.includes('instant-search')) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['instant-search'], {
          queryParams: {
            search: this.search_value,
          }
        });
      });
    } else {
      this.router.navigate(['instant-search'], {
        queryParams: {
          search: this.search_value,
        }
      });
    }
    //this.searchBarInput.nativeElement.value = '';
    this.closeSearchResult();
  }

  ngOnDestroy() {
    if(this.resizeSub){
      this.resizeSub.unsubscribe();
    }
    
  }
}
