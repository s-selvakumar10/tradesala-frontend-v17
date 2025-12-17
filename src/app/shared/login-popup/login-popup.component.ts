import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { RegisterPopupComponent } from '../register-popup/register-popup.component';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPopupComponent implements OnInit {
  
  modalOptions:NgbModalOptions;
  
  
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'registerBackdrop',
      ariaLabelledBy: 'modal-basic-title', 
      centered: true
    }
  }

  ngOnInit(): void {
  }
  
  public dismissModal() {
    this.activeModal.dismiss();
  }
  registerPopup() {
    this.modalService.open(RegisterPopupComponent, this.modalOptions);
  }
}
