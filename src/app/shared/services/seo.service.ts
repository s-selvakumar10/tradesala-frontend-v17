import { Inject, Injectable, PLATFORM_ID} from "@angular/core";
import { DOCUMENT, isPlatformBrowser, Location, LocationStrategy } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";
import { ApiService } from "./api.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

export interface MetaTags {
  name?: string;
  content?: string;
  property?: string;
}

export declare type ScriptDefinition = {
  text: string;
  type?: string;
  async?: boolean;
  id?: string;
  charset?: string;
  crossOrigin?: string;
  defer?: string;
  src?: string;
} & {
  [prop: string]: string;
};

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  
  metaData: BehaviorSubject<{meta: any}> = new BehaviorSubject({meta: ''});
  status$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private title: Title,
    private meta: Meta,
    private apiService: ApiService,
    @Inject(DOCUMENT) private dom: Document,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {
   
    
  }

  setTitle(title: string) {
    this.title.setTitle(title);
    this.setCanonicalURL();

    const orginUrl = isPlatformBrowser(this.platformId) ? location.origin : environment.frontEndUrl;
    environment.config.metaInfo.og_url = this.dom.URL;
    environment.config.metaInfo.twt_url = this.dom.URL;
    environment.config.metaInfo.og_image = orginUrl + '/assets/images/logo.png';
    environment.config.metaInfo.twt_image = orginUrl + '/assets/images/logo.png';
  }

  setMetaTags(tags: MetaTags[]) {
    tags.forEach((currentValue) => {
      this.meta.updateTag({
        name: currentValue.name,
        content: currentValue.content,
      });
    });
  }
  
  setCanonicalURL(url?: string) {    
    const linkElement = <HTMLLinkElement> this.dom.head.querySelector("link[rel='canonical']");

    if (linkElement) {
        this.dom.head.removeChild(linkElement);
    }
    const canURL = url == undefined ? this.dom.URL : url;
    const link: HTMLLinkElement = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.dom.head.appendChild(link);
    link.setAttribute('href', canURL);
  }

  public setJsonLd(data: any = {}): void {

    let s = this.dom.createElement('script');
    s.type = `application/ld+json`;
    s.text = `${JSON.stringify(data, null, 2)}`;
    this.dom.head.appendChild(s);
  }

  updateJsonLd(tag: ScriptDefinition): HTMLScriptElement {
    
    const scriptElement = this.dom.head.querySelectorAll(`script[type="${tag.type}"]`);    
    
    if(scriptElement?.length){
      for(let i=0; i < scriptElement?.length; i++){                 
        let textT = JSON.stringify(scriptElement[i]?.innerHTML.replace((/ |\r\n|\n|\r| \/\|/gm),""));
        if(JSON.parse(textT) == JSON.stringify(tag.text)){
          scriptElement[i].remove();
        }
      }
    }
    // if (scriptElement) {
    //   this.dom.head.removeChild(scriptElement);
    // }

    let s = this.dom.createElement('script');
    s.type = `${tag.type}`;
    s.text = `${tag.text}`;
    //s.text = `${JSON.stringify(data, null, 2)}`;

    return this.dom.head.appendChild(s);
  }
  
  removeJsonLd() {
    const scriptElement = this.dom.head.querySelectorAll('script[type="application/ld+json"]');  
    if(scriptElement?.length){
      for(let i=0; i < scriptElement?.length; i++){
        this.dom.head.removeChild(scriptElement[i]);
      }
    }
    
  }

  setMetaGrapLd(tags: MetaTags[]) {
    tags.forEach((currentValue) => {
      this.meta.updateTag({
        property: currentValue.property,
        content: currentValue.content,
      });
    });
  }

  setRobots(value?: string): void{     
    let robot = ''
    if(environment.staging){
      robot = 'noindex, nofollow';
    } else {
      robot = (value == undefined) ? 'index, follow' : value;
    }
    
    this.meta.updateTag({
      name: 'robots',
      content: robot,
    });
  }

  getMetaInfo(slug:string): Observable<any>{
    return this.apiService.get(`v1/meta-info/${slug}`).pipe(
      map(res => res)
    );
  }
  fetchMetaData(slug = null){

    if(slug != null || typeof slug != undefined){
      this.getMetaInfo(slug).subscribe({
        next: (res) =>{ 
          if(res.data){
            this.metaData.next({'meta':res.data});
            this.status$.next(true);
          } else {
            this.status$.next(false);
          }      
         
        },
        error: (err) => {
          console.log(err);
          this.status$.next(false);
        }
      })
    }
    return this.status$.asObservable()
  }
  
}