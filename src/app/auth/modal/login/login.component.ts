import { Component, Injector, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';
import * as constants from '../../../shared/constant';
import { CartService } from 'src/app/shared/services/cart.service';

@Component({
  selector: 'app-modal-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginModalComponent implements OnInit {

	closeResult = '';

  loginForm: FormGroup;

  passwordForget: FormGroup;
  modalOptions: NgbModalOptions;
 
  constructor(
  	private modalService: NgbModal, 
  	private authService: AuthService,
  	private toastrService: ToastrService,
    private router: Router,
    private cartService: CartService,
  	) {
      this.modalOptions = {
        backdrop:'static',
        backdropClass:'forgotBackdrop',
        ariaLabelledBy: 'modal-basic-title', 
        centered: true
      }
     
    }

  ngOnInit(): void {
   
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
        this.modalService.dismissAll();
      	this.toastrService.success('Successfully logged in!', 'Success!');
        this.router.navigate([this.router.routerState.snapshot.url]);
        this.cartService.getProducts();
      }
    }, 
    error => {
      if(error){
      	this.toastrService.error("Check Username or Password", 'Login Failed!');
      }
      	
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
    error => {     
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
  
}
