import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Event, NavigationEnd, Router } from '@angular/router';
import { CategoryService } from '../core/services/category.service';
import { Observable, Subscription } from 'rxjs';
import { Category } from '../category/models/category';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit{
  windowScrolled: boolean;
  contact_info = environment.config.contact_info;
  social_links = environment.config.footer_social_links;
  footer_page_links = environment.config.footer_page_links;
  categories: Array<Category>;
  isBrowser: boolean;
  footerContent: any;
  private categoriesSubs: Subscription;
  routerSubscribe: Subscription;
  @ViewChild('ftrknowmore') ftrknowmore: ElementRef;
  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platform
  ) {
   this.isBrowser = isPlatformBrowser(this.platform);
  }

  ngOnInit(): void {
    this.routerSubscribe = this.router.events.subscribe((e: Event) => {
      if(e instanceof NavigationEnd){
        this.ftrknowmore.nativeElement?.classList?.remove('show');
      }
    });
    this.categoriesSubs = this.categoryService.categories.subscribe(
      (categories) => {
        if(categories?.length){
          this.categories = categories;    
        }
          
       
      }
    );
    // if (navigator.userAgent.match(/android/i)) {
    //   document.getElementById('play-store-link').href = 'market://details?id=$PACKAGE_NAME';
    // }
    // if (/(android)/i.test(navigator.userAgent)) {
    //   document.querySelectorAll('a[href]').forEach(function (link) {
    //     link.href = link.href.replace('https://play.google.com/store/apps/','market://');
    //   });
    // }
    this.getFooter().subscribe(res => this.footerContent = res.data);
  }

  getFooter():Observable<any>{
    return this.apiService.get('v1/footer').pipe(res => res);
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop > 150
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && window.pageYOffset) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop < 10
    ) {
      this.windowScrolled = false;
    }
  }
  showDashboard(): void{
    localStorage.setItem('showDashboard',"true");
    this.redirect();
  }
  showOrderHistory(): void{
    localStorage.setItem('showOrders', "true");
    this.redirect();
  }
  showWishlist(): void {
    localStorage.setItem('showWishlist', "true");
    this.redirect();
  }
  redirect() {
    if (location.href?.includes('account/dashboard')) {
      let currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    } else {
      this.router.navigate(['/account/dashboard']);
    }
  }
  backToTop() {
    (function smoothscroll() {
      var currentScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    })();
  }
  copyright(){
    return new Date().getFullYear();
  }

  public toggle( element: HTMLElement ) {
		element.classList.toggle('show');
	}
  
  ngOnDestroy(){
    this.categoriesSubs.unsubscribe();
    this.routerSubscribe.unsubscribe();
  }
}
