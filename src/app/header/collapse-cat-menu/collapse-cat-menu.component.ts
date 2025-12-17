import { Component, Input, OnDestroy, OnInit, HostListener, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoryService } from 'src/app/core/services/category.service';
import { Category } from 'src/app/category/models/category';
import { SessionFlow } from 'src/app/helper/session-flow';
import { isPlatformBrowser } from '@angular/common';
import { NgbDropdown, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';

@Component({
  selector: 'app-collapse-cat-menu',
  templateUrl: './collapse-cat-menu.component.html',
  styleUrls: ['./collapse-cat-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapseCatMenuComponent implements OnInit, OnDestroy {

  @Input('show') isCollapsed: boolean;
  //@Input('show') isDropdownOpen: boolean;

  showAllCategory: boolean = false;
  maxVisibleCategory: number = 15;
  categories: Array<Category>;
  categoriesSubs: Subscription;
  isMobile: boolean = false;
  selectedIndex: number;
  collapseSub: Subscription;

  @ViewChild('collapse') collapse: ElementRef;
  @ViewChild('collapseBtn', {static: false}) collapseBtn: ElementRef;
  @ViewChild('hideDrop') hideDrop: ElementRef;
  @ViewChild('drop') drop: any;

  constructor(
    private ngZone: NgZone,
    private render: Renderer2,
    private categoryService: CategoryService,
    private mobileDevice: SessionFlow,
    @Inject(PLATFORM_ID) private platformId: Object,
    
  ) {
    this.isMobile = this.mobileDevice.isMobile;
  }

  ngOnInit(): void { 
    
    
    // this.resizeSub = this.resizeService.onResize$.pipe(filter((event) => event.innerWidth <= 800)).subscribe((event) => {
    //   this.isMobile = true;
    //   this.collapse.nativeElement.classList.remove('show');
    // });
    
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)){
      this.ngZone.run(() => {
        setTimeout(() => {
          this.categoryService.fetchAll();
          this.categoriesSubs = this.categoryService.categories.subscribe(
            (categories) => {
              this.categories = categories;
            }
          );
        }, 3000);
        
      });
    }
    
  }

  ngOnChanges(changes): void { 
    
    
  }

  showAllCategoryToggle() {
    this.showAllCategory = !this.showAllCategory;
  }

  showCollapse(element: HTMLElement){ 
    if(this.categories.length > 0){
      element.classList.toggle('show');
    }
    
  }
  openDropDown(event: MouseEvent) {
    let btnPos = document.querySelector('#navbar .tools-div .dropdown-toggle'),
        elementL = btnPos.getBoundingClientRect().left,
        elementR = btnPos.getBoundingClientRect().right,
        elementT = btnPos.getBoundingClientRect().top,
        elementB = btnPos.getBoundingClientRect().bottom;
   
    if(!this.isMobile){
      if(this.categories?.length > 0){
        if(event.x > elementL && event.x < elementR){
          //document.body.style.overflow ='hidden';
          this.collapse.nativeElement.classList.add('show');
        }
        if(event.y > elementT && event.y < elementB){
          //document.body.style.overflow ='hidden';
          this.collapse.nativeElement.classList.add('show');
        }
        
      }
    }
    
    // if(event.clientY > 15 && event.clientY < 50){
      
    //   if(this.categories?.length > 0) {
    //     this.collapse.nativeElement.classList.add('show');
    //   }
    // }
    // if(event.clientX > 370 && event.clientX < 470){
      
    //   if(this.categories?.length > 0) {
    //     this.collapse.nativeElement.classList.add('show');
    //   }
    // }
    // this.isDropdownOpen = true;
  }

  hide(event, ele: HTMLElement){
    
    // console.log("oHeight", ele.offsetHeight);
    // console.log("oWidth", ele.offsetWidth);   
    // console.log("cWidth", ele.clientWidth);
    // console.log("cWidth", ele.clientHeight);
    // console.log("oLeft", ele.offsetLeft);
    // console.log("oTop", ele.offsetTop);
    // console.log("srllLeft", ele.scrollLeft);
    // console.log("srllTop", ele.scrollTop);
    // console.log("srllBy", ele.scrollBy());
    // console.log("srllHeight", ele.scrollHeight);
    // console.log("srllWidth", ele.scrollWidth);
    
    
    
  }

  hideDropDown(event: MouseEvent, ele: HTMLElement){
    let btnPos = document.querySelector('#navbar .tools-div .dropdown-toggle'),
        elementL = btnPos.getBoundingClientRect().left,
        elementR = btnPos.getBoundingClientRect().right,
        elementT = btnPos.getBoundingClientRect().top,
        elementB = btnPos.getBoundingClientRect().bottom;
    
    if(!this.isMobile){
      if(event.x < elementL || event.x > elementR || event.y < elementT){       
        document.body.removeAttribute('style');
        this.collapse.nativeElement.classList.remove('show');
      }
    }
    
  }
  
  showCategory(element: HTMLElement){ 
    if(!this.isMobile){
      element.classList.add('show');
      if(this.categories?.length > 0 && document?.querySelectorAll('.moremenu').length > 0) {      
        this.render.addClass(document?.querySelectorAll('.moremenu')[0].children[1], 'show');
      }
    }
    
  }
  defaultShow($event){
    if(!this.isMobile){
      if(this.categories?.length > 0 && document?.querySelectorAll('.moremenu').length > 0) {      
        this.render.addClass(document?.querySelectorAll('.moremenu')[0].children[1], 'show');
        
      }
    }
    
  }
  showDropDown(event, drop:any, index){
    if(!this.isMobile){
      event.target.classList.add('active');   
      if(window.screen.width > 991){
        // drop._open = true;
        // drop.openChange.emit(true);
        if(index == 0){
          this.render.addClass(document.querySelectorAll('.moremenu')[0].children[1], 'show');      
        }
        // console.log(drop);
      
        // let rightVal = drop._anchor.nativeElement.getBoundingClientRect().left + 10;         
        // this.render.addClass(drop._menu.nativeElement, 'show');
        // this.render.setStyle(drop._menu.nativeElement, 'position', 'absolute');
        // this.render.setStyle(drop._menu.nativeElement, 'inset', '0px 0px auto auto');
        // this.render.setStyle(drop._menu.nativeElement, 'margin', '0px');
        // this.render.setStyle(drop._menu.nativeElement, 'transform', `translate(${rightVal}px, 0px)`);
        drop.open();
       
      }
    }
    
    
    
  }
  closeDropDown(event, drop:any, index){
    
    if(!this.isMobile){
      event.target.classList.remove('active');
      if(window.screen.width > 991){
        // if(index == 0){
        //   this.render.addClass(document.querySelectorAll('.moremenu')[0].children[1], 'show');      
        // }
        if(index !== 0){
          this.render.removeClass(document.querySelectorAll('.moremenu')[0].children[1], 'show');      
        }
       
        // if(
        //   event.clientY < drop._elementRef.nativeElement.getBoundingClientRect().top ||         
        //   (event.offsetY > drop._elementRef.nativeElement.getBoundingClientRect().height || event.offsetY < drop._elementRef.nativeElement.getBoundingClientRect().height)
          
        // ){   
        //   drop._open = false;
        //   drop.openChange.emit(false); 
        //   drop.close();      
        //   this.render.removeAttribute(drop._menu.nativeElement, 'style');
        //   this.render.removeClass(drop._elementRef.nativeElement, 'show');
        //   this.render.removeClass(drop._menu.nativeElement, 'show');
       
        // } else {
          
        // }
        drop.close();
       
        
      }
    }
   
  }
  

  hideCollapse(element: HTMLElement){
    if(!this.isMobile){
      document.body.removeAttribute('style');
      element.classList.remove('show');
      this.render.removeClass(document.querySelectorAll('.moremenu')[0].children[1], 'show');
    }
    
  }

  public onScrollEvent(event: any, name: any): void {
    
    if(event.type === 'ps-y-reach-start'){
      document.body.style.overflow ='hidden';
    } 
    
  }

  // over(drop:NgbDropdown){
  //   drop.open()
  // }
  // out(drop:NgbDropdown){
  //   drop.close()
  // }

  ngOnDestroy() {
    //this.categoriesSubs.unsubscribe();
    // this.resizeSub.unsubscribe();
    // this.routerSub.unsubscribe();
  }
}
