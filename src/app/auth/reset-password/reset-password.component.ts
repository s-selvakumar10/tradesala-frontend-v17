import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPassword: FormGroup;
  email: string;
  tokenId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toast: ToastrService,
  ) {     
    this.route.params.subscribe( params => {      
      this.tokenId = params.token;      
    });
  }
  
  ngOnInit(): void {   
    this.route.queryParams.subscribe((params) => {
      this.email = params.email;
    });
    this.resetPassword = this.formBuilder.group({
      email: [this.email || null, Validators.required],
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirm_password: new FormControl('', [Validators.required, Validators.minLength(6)]),

    }, {
      validators: this.matchPassword.bind(this)
    });
    
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
  onResetSubmit() {
    if (this.resetPassword.valid) {
      let token: string = this.tokenId;
      const { value: email } = this.resetPassword.get('email');
      const { value: password } = this.resetPassword.get('password');
      const { value: confirm_password } = this.resetPassword.get('confirm_password');
      this.authService.resetPassword(token, email, password, confirm_password).subscribe(res => {
        if (res.status === true) {
          this.toast.success(res.msg, 'Success!');
          this.router.navigate(['/']);
        } else {
          this.toast.error(res.msg, 'Failed!');
        }
      }, err => {
        console.log(err);
      })
    }
  }
}
