import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ImageService } from 'src/app/shared/services/image.service';
import { User } from 'src/app/auth/user.model';
import { isPlatformBrowser } from '@angular/common';

class ImageSnippet {
  constructor(public src: string, public file: File) {}
}
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnInit {

  user: User;
  userId: string;
  isAuthenticated: Boolean = false;
  isEditPassword: boolean = false;
  isEditForm: boolean = false;
  isChangeAvatar: boolean = false;
  userForm: FormGroup;
  passwordForm: FormGroup;
  selectedFile: ImageSnippet;
  imageUrl: any = 'assets/images/avatar/avatar.png';
  constructor(
    private formBuilder: FormBuilder,
    private authservice: AuthService,
    private toast: ToastrService,
    private imageService: ImageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
   }
  
  ngOnInit(): void {
    this.authservice.user.subscribe(user =>{      
      this.isAuthenticated = !!user;
      if(this.isAuthenticated) {
        this.userId = user.id;
        this.user = user;
      } 
    });
    this.userForm = new FormGroup({
      name: new FormControl(),
      mobile: new FormControl(),
      email: new FormControl(),

    });
    this.passwordForm = new FormGroup({
      current_password: new FormControl(null, Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirm_password: new FormControl('', [Validators.required, Validators.minLength(6)]),

    }, {
      validators: this.matchPassword.bind(this)
    });
    this.isEditPassword = false;
  }
  
  editUserDetails(){
    this.isEditPassword = false;
    this.isEditForm = true;
    this.userForm = this.formBuilder.group({
      name: [this.user?.name || null, Validators.required],
      mobile: [this.user?.mobile || null, Validators.required],
      email: [this.user?.email || null, Validators.required],
      avatar: [null],
    });
    this.userForm.get('mobile').disable();
    this.userForm.get('email').disable();
  }
  changePassword(){
    this.isEditPassword = true;
    this.isEditForm = false;
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
    if (this.passwordForm.valid) {
      let email: string = this.user.email;
      let token: string = this.user.id;
      const { value: current_password } = this.passwordForm.get('current_password');
      const { value: password } = this.passwordForm.get('password');
      const { value: confirm_password } = this.passwordForm.get('confirm_password');
     
      this.authservice.passwordChanged(token, email, current_password, password, confirm_password).subscribe(res =>{
        
        if (res.body.success) {
          this.toast.success(res.body.success, 'Success!');
          this.isEditPassword = false;
        } else {
          this.isEditPassword = true;
          this.toast.error(res.body.error, 'Error!');
        }
      }, err => {
        console.log(err);
      });
    }
  }
  onFileChanged(imageInput: any) {
    this.selectedFile = imageInput.files[0];
    const file: File = imageInput.files[0];
    this.userForm.patchValue({

    avatar: file
    
    }); 
    this.userForm.get('avatar').updateValueAndValidity();
  }
  
  onSubmitUser(){    
    let token: string = this.user.id;
    const { value: name } = this.userForm.get('name');
    const { value: mobile } = this.userForm.get('mobile');
    const { value: email } = this.userForm.get('email');   
    
    this.authservice.editUser(token, name, mobile, email).subscribe(
      (res) => {        
        this.toast.success(res.status, 'Success!');
        this.user = res.user;
        const tokenExpiry = new Date(
          new Date().getTime() + res.expires_in * 1000
        );
        const pincode = res.user.customer_shipping_address.shipping_address.pincode;
        const loadedUser = new User(res.user.email, res.user.name, res.user.mobile, res.user.id, pincode, res.token, tokenExpiry);    
        if (isPlatformBrowser(this.platformId)) {          
           localStorage.removeItem('userData');
           localStorage.setItem('userData', JSON.stringify(loadedUser));
           localStorage.setItem('delivery_pincode', pincode);
        }
      },
      (err) => {
        console.log(err);
        
      }
    )
    
  }
  changeAvatar(){
    this.isChangeAvatar = true;
  }
  processFile(imageInput: any) {    
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    
    reader.addEventListener('load', (event: any) => {
      this.imageUrl = event.target.result;
      this.selectedFile = new ImageSnippet(event.target.result, file);
      
      this.imageService.uploadImage(this.selectedFile.file).subscribe(
        (res) => {
          
        },  
        (err) => {
          console.log(err);
        })
      return new ImageSnippet(event.target.result, file);
    });

    reader.readAsDataURL(file);
  }
  onLogout() {
    this.authservice.logout();
  }
}


