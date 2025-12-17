import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SeoService } from 'src/app/shared/services/seo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {

  metaDataInfo: Subscription;
  constructor(
    private route: ActivatedRoute,
    private seoService: SeoService,
  ) { 
   
  }

  ngOnInit(): void {
    this.metaDataInfo = this.route.data.pipe(map(({metaInfo})=> metaInfo)).subscribe(meta => {
			if(meta?.status){
				this.setMetaInfo(meta.data);
			} else {
				this.setMetaInfo();
			}
		});
  }

  setMetaInfo(data: any = null) {

		const metaInfo = environment.config.metaInfo;
		
		const metaTitle = (data?.meta_title) ? data.meta_title : metaInfo.title;
   		this.seoService.setTitle(metaTitle);
    
		const metaDesc = (data?.meta_description) ? data.meta_description : metaInfo.description;
		const metaKeywords = (data?.meta_description) ? data.meta_keywords : metaInfo.keywords;
		const metaTags = [
		  { name: 'title', content: metaTitle },
		  { name: 'description', content: metaDesc},
		  { name: 'keywords', content: metaKeywords}        
		]; 
		const metaGraph = [
		  { property: 'og:title', content: (data?.open_graph) ? data.open_graph.og_title : metaInfo.og_title },
		  { property: 'og:site_name', content: (data?.open_graph) ? data.open_graph.og_sitename : metaInfo.og_sitename },
		  { property: 'og:url', content: metaInfo.og_url },
		  { property: 'og:locale', content: metaInfo.og_locale },
		  { property: 'og:description', content: (data?.open_graph) ? data.open_graph.og_description : metaInfo.og_description },
		  { property: 'og:type', content: (data?.open_graph) ? data.open_graph.og_type : metaInfo.og_type},
		  { property: 'og:image', content: (data?.open_graph) ? data.open_graph.og_image : metaInfo.og_image },
		  { property: 'og:image:width', content: '600' },
		  { property: 'og:image:height', content: '600' },		  
		  { property: 'og:image:alt', content: '' },    
		  { property: 'twitter:card', content: (data?.twitter_card) ? data.twitter_card.twt_card : metaInfo.twt_card },
		  { property: 'twitter:site', content: metaInfo.twt_site },
		  { property: 'twitter:creator', content: metaInfo.twt_site },
		  { property: 'twitter:url', content: metaInfo.twt_url },
		  { property: 'twitter:title', content: (data?.twitter_card) ? data.twitter_card.twt_title : metaInfo.twt_title },
		  { property: 'twitter:description', content: (data?.twitter_card) ? data.twitter_card.twt_description : metaInfo.twt_description },
		  { property: 'twitter:image', content: (data?.twitter_card) ? data.twitter_card.twt_image : metaInfo.twt_image }
		];
	 
		this.seoService.setMetaTags(metaTags);
		this.seoService.setMetaGrapLd(metaGraph);
		
		const robots = (data?.robots) ? data.robots : metaInfo.robots;
		this.seoService.setRobots(robots);
		
	}
  ngOnDestroy(){
    this.metaDataInfo.unsubscribe()
  }

}
