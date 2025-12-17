import { Component, Inject, OnInit } from '@angular/core';
import { LoginPopupComponent } from '../login-popup/login-popup.component';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DeliveryPincodeService } from '../delivery-pincode.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/auth/user.model';
import { AuthService } from 'src/app/auth/auth.service';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-delivery-pincode-modal',
  templateUrl: './delivery-pincode-modal.component.html',
  styleUrls: ['./delivery-pincode-modal.component.scss']
})
export class DeliveryPincodeModalComponent implements OnInit {

   modalOptions:NgbModalOptions;
   pincodeForm: FormGroup;
   submitted = false;
   isAuth = false;
   shipping_addresses: any = [];
    constructor(
      private authService: AuthService,
      public activeModal: NgbActiveModal,
      private modalService: NgbModal,
      private deliveryPincodeService: DeliveryPincodeService,
      private toastr: ToastrService
    ) {
      this.modalOptions = {
        backdrop:'static',
        backdropClass:'registerBackdrop',
        ariaLabelledBy: 'modal-basic-title', 
        centered: true
      }
      this.authService.user.subscribe(user => {
        this.isAuth = !!user;
      });
      this.deliveryPincodeService.shipping_address.subscribe(address => {        
        if(address?.length){
          this.shipping_addresses = address;
        }
        
      })
      
    }
  
    ngOnInit(): void {
      this.pincodeForm = new FormGroup({
          pincode: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]*$')])
      });
    }
    
    public dismissModal() {
      this.activeModal.dismiss();
    }
    loginPopup() {
      this.modalService.open(LoginPopupComponent, this.modalOptions);
    }
    submitDeliveryPincode(){
      this.submitted = true;
      if(this.pincodeForm.valid){
        const pincode = this.pincodeForm.get('pincode').value;
        this.deliveryPincodeService.pincodeSub.next(pincode);
        this.deliveryPincodeService.storePincode(pincode);
        setTimeout(() => {
          this.toastr.success('Delivery location updated', 'Success !');
          this.modalService.dismissAll();
        }, 100)
      }      
    }
    savePincode(address){
      const pincode = address.shipping_address.pincode;
      this.deliveryPincodeService.storePincode(pincode, address.id);
      setTimeout(() => {
        this.toastr.success('Delivery location updated', 'Success !');
        this.modalService.dismissAll();
      }, 100)
    }
}
