import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, afterNextRender, inject, Injector, afterRender, runInInjectionContext, AfterViewInit  } from '@angular/core';
import { isPlatformBrowser, DOCUMENT, isPlatformServer } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { environment } from 'src/environments/environment';
import { SeoService } from './shared/services/seo.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Import solid icons
import { fab } from '@fortawesome/free-brands-svg-icons'; // Import brand icons
//import { GeolocationService } from './shared/services/geolocation.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  routerSubscription: Subscription;
  schema = {};
  private readonly injector = inject(Injector);

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private metaTitle: Title,
    private meta: Meta,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
    library: FaIconLibrary
    //private geolocationService: GeolocationService
  ) { 
      library.addIconPacks(fas, fab);
      afterNextRender(() => { 
          
      });   
      if(isPlatformServer(this.platformId)){
        this.setPreconnect(environment.mediaUrl);
        this.fontPreload();
      }
      if (isPlatformBrowser(this.platformId)) {
        
      }
  }


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.autoSignIn();
    }    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (isPlatformBrowser(this.platformId)) {
          this.scrollPageToTop();
          //this.setMetaData();       
        }   
      });
  }
  ngAfterViewInit(): void {   
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        if(environment.production && isPlatformBrowser(this.platformId)) {
          this.setGTagManager();
          this.setGoogleAnalytics();
          this.zohoCRM();
        }
      });
    })
    // if(environment.production && isPlatformBrowser(this.platformId)) {
    //   // this.ngZone.run(() => {       
     
    //   // }); 
    //   this.ngZone.runOutsideAngular(()=>{
    //     setTimeout(() => {
    //       this.ngZone.run(() => {
            
    //       })
    //     }, 3500); 

    //   })
    // }
  }

  // getGeoLocation() {
  //   this.geolocationService.getCurrentPosition().subscribe({
  //     next: (position) => {
  //       console.log('position',position);
  //       console.log('Latitude:', position.coords.latitude);
  //       console.log('Longitude:', position.coords.longitude);
  //     },
  //     error: (error) => {
  //       console.error('Error getting geolocation:', error);
  //     },
  //   });
  // }
  
  private fontPreload(){
    const link = this.doc.createElement('link');    
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = '';
    link.href = '/media/fa-solid-900.woff2'
    this.doc.head.appendChild(link);
  }
  private setGTagManager() {
    const script1 = this.doc.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.GA_TAGMANGER_ID;
      this.doc.head.appendChild(script1);

      const script2 = this.doc.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '` + environment.GA_TAGMANGER_ID + `' );
      `;
      this.doc.head.appendChild(script2);
    
  }
  private setGoogleAnalytics() {
    const script1 = this.doc.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.GA_TRACKING_ID;
      this.doc.head.appendChild(script1);

      const script2 = this.doc.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '` + environment.GA_TRACKING_ID + `' );
      `;
      this.doc.head.appendChild(script2);
    
  }
  private zohoCRM(){
    const script = this.doc.createElement('script');
      script.innerHTML = `
      var w=window;var p = w.location.protocol;if(p.indexOf("http") < 0){p = "http"+":";}var d = document;var f = d.getElementsByTagName('script')[0],s = d.createElement('script');s.type = 'text/javascript'; s.async = false; if (s.readyState){s.onreadystatechange = function(){if (s.readyState=="loaded"||s.readyState == "complete"){s.onreadystatechange = null;try{loadwaprops("3zbbe667ce4511137dd30b5d599e9b2e71","3zefd7b6ac0ae035c15926a08ff5fecff1","3z00f4497c9b0876f6fde40986bcf2dcf3cbc0ebacaa146c45563896dffb4668ce","3z535ec933c5362ae58e80a302d9c3b850","0.0");}catch(e){}}};}else {s.onload = function(){try{loadwaprops("3zbbe667ce4511137dd30b5d599e9b2e71","3zefd7b6ac0ae035c15926a08ff5fecff1","3z00f4497c9b0876f6fde40986bcf2dcf3cbc0ebacaa146c45563896dffb4668ce","3z535ec933c5362ae58e80a302d9c3b850","0.0");}catch(e){}};};s.src =p+"//ma.zoho.in/hub/js/WebsiteAutomation.js";f.parentNode.insertBefore(s, f);
      `;
      this.doc.head.appendChild(script);
  }
  setMetaData() {
    const metaInfo = environment.config.metaInfo;    
    if(this.route.snapshot.data['title'] != ''){
      this.metaTitle.setTitle(this.route.snapshot.data['title']);
    } else {      
      this.seoService.setTitle(metaInfo.title);
    }
    const metaTags = [
      { name: 'title', content: metaInfo.title },
      { name: 'description', content: metaInfo.description },
      { name: 'keywords', content: metaInfo.title },     
    ];
    if(environment.staging){
      this.meta.updateTag({
        name: 'robots',
        content: 'noindex, nofollow',
      });
    }
    this.seoService.setMetaTags(metaTags);
  }
  setJsonSchema(){
    this.schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: environment.config.appName,
      url: isPlatformBrowser(this.platformId) ? location.origin : ''
    };
    this.seoService.setJsonLd(this.schema);
  }
  private addMetaInfo() {
    const metaInfo = environment.config.metaInfo;

    this.meta.updateTag({ name: 'description', content: metaInfo.description });
    this.meta.updateTag({ name: 'keywords', content: metaInfo.title });
    this.meta.updateTag({ name: 'title', content: metaInfo.title });
    
    this.metaTitle.setTitle(metaInfo.title);
  }
  setPreconnect(href: string): void {
    const link = this.doc.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    this.doc.head.appendChild(link);
  }

  scrollPageToTop() {
    window.scroll(0, 0);
  }

  ngOnDestroy() {
    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
