import { Component, EventEmitter, Input, OnInit, HostListener, Output, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID} from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';
import { CartService } from 'src/app/shared/services/cart.service'

import { CollapseCatMenuService } from './collapse-cat-menu/collapse-cat-menu.service';
import { AuthService } from '../auth/auth.service';
import { fromEvent, Observable, Subject, Subscription} from 'rxjs';
import { ApiService } from '../shared/services/api.service';
import { SessionFlow } from 'src/app/helper/session-flow';
import { CategoryService } from '../core/services/category.service';
import { Wishlist } from 'src/app/core/models/wishlist';
import { WishlistService } from 'src/app/shared/services/wishlist.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Category } from '../category/models/category';
import { NavigationEnd, Router } from '@angular/router';
import { LoginPopupComponent } from '../shared/login-popup/login-popup.component';
import { RegisterPopupComponent } from '../shared/register-popup/register-popup.component';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { ResizeService } from 'src/app/core/services/resize.service';
import { DeliveryPincodeService } from '../shared/delivery-pincode.service';
import { DeliveryPincodeModalComponent } from '../shared/delivery-pincode-modal/delivery-pincode-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate(300)]),
      transition(':leave', [animate(500)]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  closeResult = '';

  title = 'Tradesala';
  isMiniCartOpen: Boolean = false;
  totalCartItem: number = 0;
  totalWishlistItems: number = 0;

  isSearchCollapsed: boolean = true;

  categories: Array<Category>;
  private categoriesSubs: Subscription;
  private userSub: Subscription;
  private searchSubcription: Subscription;
  private resizeSub: Subscription;
  private routerSub: Subscription;
  isAuthenticated: Boolean = false;

  //isMobile: boolean = false;
  @Input() selectedCategory: Category;
  @Input('openSidebarMenu') isSidebarMenuOpen: boolean;
  @Output('closeSidebarMenu')
  sidebarMenuShowEvent = new EventEmitter<boolean>();

  isCategoryOpen: boolean;
  public isMenuCollapsed = true;

  wishlistsAll: Array<Wishlist>;
  userId: string;
  isMobile: boolean;
  modalOptions:NgbModalOptions;
  deliveryPincode = '';
  emptyPincode = true;
  constructor(
    private el: ElementRef,
    private titleService: Title,
    private collapseCatMenuService: CollapseCatMenuService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public ApiServices: ApiService,
    private mobileDevice: SessionFlow,
    private modalService: NgbModal,
    private router: Router,
    private resizeService: ResizeService,
    private deliveryPincodeService: DeliveryPincodeService
  ) {
    this.cartService.products.subscribe((products) => {
      this.totalCartItem = this.cartService.totalItems;
    });
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'loginBackdrop',
      ariaLabelledBy: 'modal-basic-title', 
      centered: true
    }

    this.isMobile = this.mobileDevice.isMobile; 
    this.deliveryPincodeService.getPincode().subscribe();  
    this.deliveryPincodeService.pincodeObs$.pipe(
      filter(pincode => pincode!=null),
      tap(pincode => {
        if(pincode != ''){
          this.emptyPincode =  false;
          this.deliveryPincode = pincode;
        } else {
          this.emptyPincode =  true;
        }
      })
    ).subscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    let headerHeight = document.getElementsByClassName('section-header');

    if (window.pageYOffset > headerHeight[0].clientHeight) {
      let element = document.getElementById('navbar');
      element.classList.add('sticky');
    } else {
      let element = document.getElementById('navbar');
      element.classList.remove('sticky');
    }
  }

  ngOnInit(): void {
    this.cartService.getProducts();
    this.isSidebarMenuOpen = false;

    this.collapseCatMenuService.statusUpdated.subscribe((status: boolean) => {
      if (this.mobileDevice.isMobile) {
        this.isCategoryOpen = false;
      } else {
        this.isCategoryOpen = status;
      }
    });
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
      const isAuth = !!user;
      if(isAuth) {
          this.userId = user.id;
      }
      
    });

    // this.categoryService.fetchAll();

    // this.categoriesSubs = this.categoryService.categories.subscribe(
    //   (categories) => {
    //     this.categories = categories;
    //   }
    // );
    
    if (this.isAuthenticated == true) { 
      this.wishlistService.getWishlist(this.userId).subscribe(res => {
        this.wishlistService.updateWishListItems(res);
      });
      this.wishlistService.wishListItems$.subscribe(response => { 
        //console.log('wishlist', response)      
        this.totalWishlistItems = response.length;       
      }, err => {
        this.totalWishlistItems = 0;
      });
    } 
    
    this.routerSub = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd ),
      debounceTime(1000),
      distinctUntilChanged()
    )
    .subscribe((event: NavigationEnd) => {     
      if(event instanceof NavigationEnd){
        this.isSidebarMenuOpen = false;
        this.el.nativeElement.querySelector('#collapseSearch').classList.remove('show');
        this.el.nativeElement.querySelector('#cart').classList.remove('show');
        this.el.nativeElement.querySelector('.cart-menu').classList.remove('show');
			  this.el.nativeElement.querySelector('#collapseCategory').classList.remove('show');
      }      
    });
    this.resizeSub = this.resizeService.onResize$.pipe(filter((event) => event.innerWidth <= 1024)).subscribe((event) => {
      if(event.innerWidth <= 1024){
        this.isMobile = true;
        this.isSidebarMenuOpen = false;
        this.el.nativeElement.querySelector('#collapseSearch').classList.remove('show');
        this.el.nativeElement.querySelector('#cart').classList.remove('show');
        this.el.nativeElement.querySelector('.cart-menu').classList.remove('show');
			  this.el.nativeElement.querySelector('#collapseCategory').classList.remove('show');
      }
      
    });
    
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    //this.categoriesSubs.unsubscribe();
    this.resizeSub.unsubscribe();
    this.routerSub.unsubscribe();
  }

  mobileSearchBox(ele: HTMLElement){
    ele.classList.toggle('show');
  }
  

  showWishlist(event): void {
    localStorage.setItem('showWishlist', "true");
    if (location.href?.includes('account/dashboard')) {
      let currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    } else {
      this.router.navigate(['/account/dashboard']);
    }
  }

  openSearchBox(element: HTMLElement){    
    element.classList.toggle('show');
    this.isSearchCollapsed = !this.isSearchCollapsed;
  }
  closeSearchBox(element: HTMLElement){
    element.classList.remove('show');
    this.isSearchCollapsed = false;
  }
  openSidebarMenu() {
    this.isSidebarMenuOpen = true;
  }

  closeSidebarMenu() {
    this.isSidebarMenuOpen = false;
    this.sidebarMenuShowEvent.emit(this.isSidebarMenuOpen);
  }

  closeSidebar($event) {
    this.isSidebarMenuOpen = $event;
  }

  openMiniCart() {
    this.isMiniCartOpen = true;
  }

  closeMiniCart($event) {
    this.isMiniCartOpen = $event;
  }

  setTitle(newTitle: string) {
    var title = '';
    if (newTitle != '') {
      title = newTitle + ' | ';
    }
    this.titleService.setTitle(title + this.title);
  }

  onLogout() {
    this.authService.logout();
  }

  loginPopup() {
    this.modalService.open(LoginPopupComponent, this.modalOptions);
  }

  registerPopup() {
    this.modalService.open(RegisterPopupComponent, this.modalOptions);
  }
  openPincodeModal(){
    if(!this.modalService.hasOpenModals()){     
      this.modalService.open(DeliveryPincodeModalComponent, this.modalOptions);
    }
  }
}


