import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, NgZone  } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
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
export class AppComponent implements OnInit, OnDestroy {
  routerSubscription: Subscription;
  schema = {};

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
  }


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.autoSignIn();
      //this.getGeoLocation();
      //this.geolocationService.getLiveLocation().subscribe(res=> console.log(res))
    }    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (isPlatformBrowser(this.platformId)) {
          this.scrollPageToTop();
        }
        // this.addMetaInfo();
        this.setMetaData();
        //this.fontPreload();
        //this.setJsonSchema();   

      });
  }
  ngAfterViewInit(): void {
    if(environment.production && isPlatformBrowser(this.platformId)) {
      // this.ngZone.run(() => {       
     
      // }); 
      this.ngZone.runOutsideAngular(()=>{
        setTimeout(() => {
          this.ngZone.run(() => {
            this.setGTagManager();
            this.setGoogleAnalytics();
            this.zohoCRM();
          })
        }, 3500); 

      })
    }
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
    if (environment.production) {
      link.href = './fa-solid-900.62a2bfb1c5f5c263.woff2';
    } else {
      link.href = './fa-solid-900.woff2'
    }
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
    // this.router.events
    //   .pipe(
    //     filter((event) => event instanceof NavigationEnd),
    //     map(() => {
    //       const child: ActivatedRoute | null = this.route.firstChild;
    //       let title = child && child.snapshot.data['title'];
    //       if (title) {
    //         return title;
    //       }
    //     })
    //   )
    //   .subscribe((title) => {
    //     console.log('title', title);
    //     if (title) {
    //       this.metaTitle.setTitle(`App Prefix - ${title}`);
    //     }
    //  });
  
    //console.log(this.route.snapshot);
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

  scrollPageToTop() {
    window.scroll(0, 0);
  }

  ngOnDestroy() {
    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
