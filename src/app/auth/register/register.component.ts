import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import * as constants from '../../shared/constant';
import { Subscription } from 'rxjs';
import { SeoService } from 'src/app/shared/services/seo.service';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  
  hideRegistrationForm: boolean = false;
  hideOtpForm: boolean = true;
  hidePasswordForm: boolean = true;
  hideSuccessContainer: boolean = true;
  
  idToken: string;
  
  registerForm: FormGroup;
  otpForm: FormGroup;
  metaDataInfo: Subscription;
  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private seoService: SeoService,
  ) { }
  
  ngOnInit(): void {
    this.metaDataInfo = this.route.data.pipe(map(({metaInfo})=> metaInfo)).subscribe(meta => {
			if(meta?.status){
				this.setMetaInfo(meta.data);
			} else {
				this.setMetaInfo();
			}
		});
    
    this.registerForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email, Validators.pattern(constants.emailPattern)]),
      'mobile_number': new FormControl(null, [Validators.required, Validators.pattern(constants.mobNumberPattern), Validators.minLength(10), Validators.maxLength(10)]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'confirm_password': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'acceptTerms': new FormControl(false, Validators.requiredTrue)
    }, {
      validators: this.matchPassword.bind(this)
    });
    
    this.otpForm = new FormGroup({
      'email_otp': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
      'mobile_otp': new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    })
    
  }
  
  matchPassword(formGroup: FormGroup) {
    
    const { value: password } = formGroup.get('password');
    const { value: confirmPassword } = formGroup.get('confirm_password');
    
    if (password === confirmPassword) {
      return null;
    } else {
      formGroup.get('confirm_password').setErrors({ passwordNotMatch: true })
      return { passwordNotMatch: true };
    }
  }
  
  onSubmit() {
    
    if (this.registerForm.valid) {      
      const { value: email } = this.registerForm.get('email');
      const { value: mobile } = this.registerForm.get('mobile_number');
      
      this.authService.signUp(email, mobile).subscribe(resData => {
        this.hideRegistrationForm = true;
        this.hideOtpForm = false
        this.idToken = resData.id;
      },
      error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 422) {
            const { errors, message } = error.error;
            const fields = Object.keys(errors || {});
            fields.forEach((field) => {
              const formControl = this.registerForm.get(field);
              if (formControl) {
                formControl.setErrors({ serverError: errors[field][0] })
              }
            })
          }
        }
      })
    }
    
  }
  
  onSubmitOtp() {
    if(this.otpForm.valid) {
      
      const { value: email_otp } = this.otpForm.get('email_otp');
      const { value: mobile_otp } = this.otpForm.get('mobile_otp');

      const { value: name } = this.registerForm.get('name');
      const { value: email } = this.registerForm.get('email');
      const { value: mobile } = this.registerForm.get('mobile_number');
      const { value: password } = this.registerForm.get('password');
      
      this.authService.otpVerify(this.idToken, email_otp, mobile_otp, name, email, mobile, password).subscribe(resData => {
        this.hideOtpForm = true;
        // this.hidePasswordForm = false;

        this.hidePasswordForm = true;
        this.hideSuccessContainer = false;
        this.idToken = '';

        setTimeout(() => {         
          this.router.navigate(['/login']);
        }, 3000);
        
      },
      error => {
        if(error instanceof HttpErrorResponse) {
          if(error.status === 422) {
            const { errors, message } = error.error;
            const fields = Object.keys(errors || {});
            fields.forEach((field) => {
              const formControl = this.otpForm.get(field);
              if(formControl) {
                formControl.setErrors({serverError: errors[field][0]})
              }
            })
          }
        }
      })
    }
  }
  
  onSubmitPassword() {
    if (this.registerForm.valid) {
      const { value: name } = this.registerForm.get('name');
      const { value: email } = this.registerForm.get('email');
      const { value: mobile } = this.registerForm.get('mobile_number');
      const { value: password } = this.registerForm.get('password');
      
      this.authService.completeSignUp(this.idToken, name, email, mobile, password).subscribe(resData => {
        this.hidePasswordForm = true;
        this.hideSuccessContainer = false;
        this.idToken = '';

        setTimeout(() => {         
          this.router.navigate(['/login']);
        }, 3000);
      },
      error => {
        console.log(error);
      })
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
