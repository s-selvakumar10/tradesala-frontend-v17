import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth.service';
import * as constants from 'src/app/shared/constant';
import { ToastrService } from 'ngx-toastr';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterModalComponent implements OnInit {

  hideRegistrationForm: boolean = false;
  hideOtpForm: boolean = true;
  hidePasswordForm: boolean = true;
  hideSuccessContainer: boolean = true;
  errorField: boolean = false;
  
  idToken: string;
  
  registerForm: FormGroup;
  otpForm: FormGroup;
  @ViewChild('formRegister') formRegister!: ElementRef;
  @ViewChild('formOtp') formOtp!: ElementRef;
  constructor(
  	private authService: AuthService, 
  	private router: Router,
  	private toastrService: ToastrService,
  	private modalService: NgbModal,
  	) { }
  
  ngOnInit(): void {
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
        this.formRegister.nativeElement.classList.add('d-none');
        this.formRegister.nativeElement.setAttribute('hidden', true);
        this.formOtp.nativeElement.classList.add('d-block');
        this.formOtp.nativeElement.removeAttribute("hidden");
        this.hideRegistrationForm = true;
        this.hideOtpForm = false
        this.idToken = resData.id;
       
      },
      error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 422) { 
            this.errorField = true;           
            const { errors, message } = error.error;
            const fields = Object.keys(errors || {});           
            fields.forEach((field) => {
              const formControl = this.registerForm.get(field);
              if (formControl) {
                formControl.setErrors({ serverError: errors[field][0] });                
              }
            });
              
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
        //this.hidePasswordForm = false;

        this.hidePasswordForm = true;
        this.hideSuccessContainer = false;
        this.idToken = '';
        this.toastrService.success('Successfully Registered your account!', 'Success!');
        setTimeout(() => {         
          //this.router.navigate(['/login']);
          this.modalService.dismissAll();
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

}
