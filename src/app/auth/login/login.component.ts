import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';
import * as constants from '../../shared/constant';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import { SeoService } from 'src/app/shared/services/seo.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  closeResult = '';

  loginForm: FormGroup;

  passwordForget: FormGroup;
  modalOptions: NgbModalOptions;
  metaDataInfo: Subscription;
  constructor(
    private title: Title,
    private modalService: NgbModal, 
    private authService: AuthService, 
    private router: Router, 
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService,
  ) {
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'forgotBackdrop',
      ariaLabelledBy: 'modal-basic-title', 
      centered: true
    }
  }

  ngOnInit(): void {
    this.title.setTitle(this.route.snapshot.data['title']);
    this.metaDataInfo = this.route.data.pipe(map(({metaInfo})=> metaInfo)).subscribe(meta => {
			if(meta?.status){
				this.setMetaInfo(meta.data);
			} else {
				this.setMetaInfo();
			}
		});
    this.loginForm = new FormGroup({
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, [Validators.required, Validators.minLength(3)])
    });

    this.passwordForget = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email, Validators.pattern(constants.emailPattern)]),
    });
  }

  onSubmit() {
    const { value: username } = this.loginForm.get('username');
    const { value: password } = this.loginForm.get('password');
    this.authService.signIn(username, password).subscribe(resData => {
      if(resData){
        this.toastrService.success('Successfully logged in!', 'Success!');
        this.router.navigate(['/']);
      }
    }, 
    error => {
      console.error(error);
    })
  }

  onSubmitForget(){
    const { value: email } = this.passwordForget.get('email');
    this.authService.passwordForgotten(email).subscribe(res => {
      if(res){
        this.modalService.dismissAll();
        this.toastrService.success(res.message, 'Success!');
        this.router.navigate(['/']);
      }
    },
    error =>{
      if(error){
        this.toastrService.error(error.error.errors.email[0], 'Failed!');
      }
    });
  }  

  forgetPassword(content) {
    this.modalService.open(content, this.modalOptions).result.then((result) => {      
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
