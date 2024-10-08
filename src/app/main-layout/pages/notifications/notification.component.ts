import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { AuthService } from 'src/app/@shared/services/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationsComponent {
  notificationList: any[] = [];
  activePage = 1;
  hasMoreData = false;

  constructor(
    private customerService: CustomerService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getNotificationList();
  }

  getNotificationList() {
    this.spinner.show();
    const id = this.authService.getUserData()?.profileId;
    const data = {
      page: this.activePage,
      size: 30,
    };
    this.customerService.getNotificationList(Number(id), data).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (this.activePage < res.pagination.totalPages) {
          this.hasMoreData = true;
        }
        this.notificationList = [...this.notificationList, ...res?.data];
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  viewUserPost(id) {
    this.router.navigate([`post/${id}`]);
  }

  removeNotification(id: number): void {
    this.customerService.deleteNotification(id).subscribe({
      next: (res: any) => {
        this.toastService.success(
          res.message || 'Notification delete successfully'
        );
        this.getNotificationList();
      },
    });
  }

  readUnreadNotification(id, isRead): void {
    this.customerService.readUnreadNotification(id, isRead).subscribe({
      next: (res) => {
        this.toastService.success(res.message);
        this.getNotificationList();
      },
    });
  }

  loadMoreNotification(): void {
    this.activePage = this.activePage + 1;
    this.getNotificationList();
  }
}
