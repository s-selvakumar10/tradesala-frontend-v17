import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { LoginPopupComponent } from '../login-popup/login-popup.component';

@Component({
  selector: 'app-register-popup',
  templateUrl: './register-popup.component.html',
  styleUrls: ['./register-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPopupComponent implements OnInit {
  
  modalOptions:NgbModalOptions;

  constructor(
    public activeModal: NgbActiveModal, 
    private modalService: NgbModal
  ) {
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'loginBackdrop',
      ariaLabelledBy: 'modal-basic-title', 
      centered: true
    }
  }

  ngOnInit(): void {
  }
  public dismissModal() {
    this.activeModal.dismiss();
  }
  loginPopup() {
    this.modalService.dismissAll(RegisterPopupComponent);
    this.modalService.open(LoginPopupComponent, this.modalOptions);
  }
}
