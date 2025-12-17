import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/auth.service';
import { AddressService } from 'src/app/core/services/address.service';
import { ApiService } from 'src/app/shared/services/api.service';
 import * as constants from 'src/app/shared/constant';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  stateList: any;
  countryList: any;
  addressShippingForm: FormGroup;
  addressBillingForm: FormGroup;
  showBilling: boolean = true;
  userId: any = 0;
  listOfAddress: any = [];
  stateListMap: any = {};
  countryListMap: any = {};
  isEdit: boolean = false;
  selectedAddress: any = {};
  showAddressForm: boolean = false;
  showBillingForm: boolean = true;
  public toggle(element: HTMLElement) {
    element.classList.toggle('show');
  }
 
  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    public toast: ToastrService,
    private authService: AuthService,
    public addressService: AddressService,
    private viewScroller: ViewportScroller
  ) { }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      const isAuth = !!user;
      if (isAuth) {
        this.userId = user.id;
      }
    });
    this.getCommonData();
    this.createAddressForm();
    this.listAddress();
  }

  createAddressForm() {

    this.addressShippingForm = this.formBuilder.group({
      name: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(constants.mobNumberPattern), Validators.minLength(10), Validators.maxLength(10)]],
      address1: [null, Validators.required],
      address2: [null],
      city: [null, Validators.required],
      country: ['', Validators.required],
      postalcode : [null, [
				Validators.required,
				Validators.minLength(6),
				Validators.maxLength(8),
				Validators.pattern('^[0-9]*$')]],
      state: ['', Validators.required],
      copyToBilling: [false]
    });
    
  }
 
  getCommonData() {
    let url = `${'/v1/states'}`;
    this.api.getAll(url).subscribe((commonRes: any) => {
      this.stateList = commonRes;
      let x = {};
      commonRes?.forEach((element: any) => {
        x[element.id] = element.name;
      });
      this.stateListMap = x;
      
    })
    url = `${'/v1/country'}`;
    this.api.getAll(url).subscribe(commonRes => {
      this.countryList = [commonRes['100']];
      let x = {};
      let c = commonRes['100'];
      x[c.id] = c.name;
      this.countryListMap = x;
    })
  }
  validateNextTab(formName) {
    if (formName.invalid) {
      this.toast.error('Please Enter All Field');
      return;
    } else {
      this.save();
    }
  }

  save() {
    
    if (this.addressShippingForm.invalid) {
      this.toast.error('Please Enter All Field');
      return;
    } else {
      
      let obj: any = {
        "shipping_address": {
          "name": this.addressShippingForm.value.name,
          "mobile_number": this.addressShippingForm.value.mobile,
          "line1": this.addressShippingForm.value.address1,
          "line2": this.addressShippingForm.value.address2,
          "city": this.addressShippingForm.value.city,
          "state": this.addressShippingForm.value.state,
          "country": this.addressShippingForm.value.country,
          "pincode": this.addressShippingForm.value.postalcode
        },        
        "billing_address": {},        
        
      };
      
      
      this.storeAddress(obj);
    }
  }

  update() {
    
    if (this.addressShippingForm.invalid && this.showAddressForm) {
      this.toast.error('Please Enter All Field');
      return;
    } else {
      const same_as_shipping = this.addressShippingForm.value.copyToBilling;
      let obj: any = {
        "same_as_shipping": false,
      };

      if (this.showAddressForm) {
        obj.shipping_address = {
          "name": this.addressShippingForm.value.name,
          "mobile_number": this.addressShippingForm.value.mobile,
          "line1": this.addressShippingForm.value.address1,
          "line2": this.addressShippingForm.value.address2,
          "city": this.addressShippingForm.value.city,
          "state": this.addressShippingForm.value.state,
          "country": this.addressShippingForm.value.country,
          "pincode": this.addressShippingForm.value.postalcode
        }
        
      }
      
      obj.id = this.selectedAddress.id;
      
      this.updateAddress(obj);
    }
  }

  storeAddress(obj) {
    this.addressService.storeAddress(obj).subscribe(response => {
      if (response.status) {
        this.toast.info(response.message, 'Alert!');
        this.addressShippingForm.reset();
        this.reset();
      } else {
        this.toast.info(response.message, 'Alert!');
      }
    }, err => {
      console.log(err);
    })
  }

  listAddress() {
    this.addressService.listAddress(this.userId).subscribe(response => {
      this.listOfAddress = response;
    }, err => {
      console.log(err);
    })
  }
  

  editAddress(id, type) {
    this.isEdit = true;
    this.showAddressForm = false;    
    this.selectedAddress = this.listOfAddress.find((e: any) => e.id == id);
   
    //this.viewScroller.scrollToPosition([150, 150]);
    this.viewScroller.setOffset([200, 200]);
    this.viewScroller.scrollToAnchor('addressForm'); 

    if (type == 'shipping') {
      this.showAddressForm = true;
      this.addressShippingForm = this.formBuilder.group({
        name: [this.selectedAddress?.shipping_address?.name || null, Validators.required],
        mobile: [
          this.selectedAddress?.shipping_address?.mobile_number || null, 
          [
            Validators.required, 
            Validators.pattern(constants.mobNumberPattern), 
            Validators.minLength(10), 
            Validators.maxLength(10)
            
          ]
        ],
        address1: [this.selectedAddress?.shipping_address?.line1 || null, Validators.required],
        address2: [this.selectedAddress?.shipping_address?.line2 || null],
        city: [this.selectedAddress?.shipping_address?.city || null, Validators.required],
        country: [this.selectedAddress?.shipping_address?.country || null, Validators.required],
        postalcode: [
          this.selectedAddress?.shipping_address?.pincode || null, 
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(8),
            Validators.pattern('^[0-9]*$')]
        ],
        state: [this.selectedAddress?.shipping_address?.state || null, Validators.required],
        copyToBilling: [false]
      });
      
    }
    
  }

  removeAddress(id) {
    this.addressService.removeAddress(this.userId, id).subscribe((response: any) => {
      
      if (response.status) {
        this.toast.info(response.message, 'Alert!');
        this.reset();
      } else {
        this.toast.info(response.message, 'Alert!');
      }
      this.reset();
    }, err => {
      console.log(err);
    })
  }

  updateAddress(obj) {
    this.addressService.updateAddress(this.userId, obj.id, obj).subscribe((response: any) => {
      
      if (response.status) {
        this.toast.success(response.message, 'Success!');
        this.reset();
      } else {
        this.toast.error(response.message, 'Error!');
      }
      this.reset();
    }, err => {
      console.log(err);
    })
  }
 
  addAddress(){
    this.showAddressForm = true;
  }

  handleChange(evt) {
    var target = evt.target;
    if (target.checked) {
      this.setDefaultAddress(evt.target.value);
    } else {
     
    }
  }
  setDefaultAddress(id){
    let obj: any = {};
    obj.set_default = 1; 
    this.addressService.updateAddress(this.userId, id, obj).subscribe((response: any) => {
      
      if (response.status) {
        this.toast.success(response.message, 'Success!');
        this.reset();
      } else {
        this.toast.error(response.message, 'Error!');
      }
      this.reset();
    }, err => {
      console.log(err);
    })
  }
  reset() {
    this.isEdit = false;
    this.selectedAddress = {};
    this.showAddressForm = false;
    this.showBillingForm = true;
    this.showBilling = true;
    this.createAddressForm();
    this.listAddress();
  }

}
