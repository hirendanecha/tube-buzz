import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ShareService } from 'src/app/@shared/services/share.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';

@Component({
  selector: 'app-notifications-modal',
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.scss']
})
export class NotificationsModalComponent {

  constructor(
    public sharedService: ShareService,
    private customerService: CustomerService,
    private activeModal: NgbActiveModal,
    private activeOffcanvas: NgbActiveOffcanvas
  ) {
    this.sharedService.getNotificationList();
  }

  readUnreadNotification(postId: string, notificationId: number): void {
    this.customerService.readUnreadNotification(notificationId, 'Y').subscribe({
      next: (res) => {
        // const url = `https://freedom.buzz/post/${postId}`;
        // window.open(url, "_blank");
        // this.router.navigate([`post/${postId}`]);
        this.closeModal();
      },
    });
  }

  closeModal(): void {
    this.activeModal?.dismiss();
    this.activeOffcanvas?.dismiss();
  }
}
