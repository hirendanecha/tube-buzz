import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, forkJoin, fromEvent } from 'rxjs';
import { Customer } from 'src/app/@shared/constant/customer';
import { ConfirmationModalComponent } from 'src/app/@shared/modals/confirmation-modal/confirmation-modal.component';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, AfterViewInit {
  customer: Customer = new Customer();
  useDetails: any = {};
  allCountryData: any = [];
  isEdit = false;
  userMail: string;
  userId: number;
  userlocalId: number;
  profileId: number;
  profileImg: any = {
    file: null,
    url: '',
  };
  profileCoverImg: any = {
    file: null,
    url: '',
  };
  apiUrl = environment.apiUrl + 'customers/';

  @ViewChild('zipCode') zipCode: ElementRef;

  userForm = new FormGroup({
    FirstName: new FormControl('', [Validators.required]),
    LastName: new FormControl('', [Validators.required]),
    Country: new FormControl('', [Validators.required]),
    Zip: new FormControl({ value: '', disabled: true }, [Validators.required]),
    MobileNo: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    City: new FormControl({ value: '', disabled: true }, [Validators.required]),
    State: new FormControl({ value: '', disabled: true }, [
      Validators.required,
    ]),
    Username: new FormControl('', [Validators.required]),
    UserID: new FormControl('', [Validators.required]),
    ProfilePicName: new FormControl('', [Validators.required]),
    CoverPicName: new FormControl('', [Validators.required]),
  });

  constructor(
    public authService: AuthService,
    private commonService: CommonService,
    private toasterService: ToastService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private uploadService:UploadFilesService,
    private sharedService:SharedService,
    private toastService: ToastService,
    private router: Router,
    private customerService:CustomerService,
    private tokenStorage:TokenStorageService
  ) {
    this.profileId = +localStorage.getItem('profileId');
    this.userMail = JSON.parse(localStorage.getItem('userData'))?.Email;
    if (this.profileId) {
      this.getProfile(this.profileId);
    }
    this.useDetails = JSON.parse(this.authService.getUserData() as any);
    console.log(this.useDetails);
  }
  ngOnInit(): void {
    console.log("mail",this.userMail);
    
    this.getAllCountries();
    this.getUserDetails();
  }
  ngAfterViewInit(): void {
    fromEvent(this.zipCode.nativeElement, 'input')
      .pipe(debounceTime(1000))
      .subscribe((event) => {
        const val = event['target'].value;
        if (val.length > 3) {
          this.onZipChange(val);
        }
      });
  }

  getUserDetails(): void {
    const data = {
      FirstName: this.useDetails?.FirstName,
      LastName: this.useDetails?.LastName,
      Country: this.useDetails?.Country,
      Zip: this.useDetails?.Zip,
      City: this.useDetails?.City,
      State: this.useDetails?.State,
      Username: this.useDetails?.Username,
      MobileNo: this.useDetails?.MobileNo || '',
      UserID: this.useDetails?.UserID,
      ProfilePicName: this.useDetails?.ProfilePicName,
      CoverPicName: this.useDetails?.CoverPicName,
      // Email:this.useDetails?.Email
    };
    this.userForm.setValue(data);
  }
  getProfile(id): void {
    this.spinner.show();
    this.customerService.getProfile(id).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.data) {
          this.customer = res.data[0];
          this.getAllCountries();
        }
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  saveChanges(): void {
    this.spinner.show();
    if (this.userForm?.value) {
      const profileId = this.useDetails.Id;
      const apiUrl = `${this.apiUrl}profile/${profileId}`;
      this.commonService.update(apiUrl, this.userForm.value).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.isEdit = false;
          this.toasterService.success(res.message);
        },
        error: (error: any) => {
          this.spinner.hide();
          console.log(error);
        },
      });
    } else {
      this.spinner.hide();
      this.toasterService.danger('something went wrong!');

    }
  }

  getAllCountries() {
    this.commonService.get(`${this.apiUrl}countries`).subscribe({
      next: (result) => {
        this.allCountryData = result;
        this.userForm.get('Zip').enable();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  changeCountry(e: any) {
    this.userForm.get('Country')!.setValue(e.target.value);
    this.userForm.get('Zip')!.setValue('');
    this.userForm.get('State')!.setValue('');
    this.userForm.get('City')!.setValue('');
  }

  onZipChange(event) {
    const country = this.userForm.value.Country;
    const zip = event;

    this.commonService
      .get(`${this.apiUrl}zip/${zip}?country=${country}`)
      .subscribe({
        next: (data: any[]) => {
          const zip_data = data[0];
          if (zip_data?.state) {
            // zip_data
            //   ? this.userForm.get('State')!.setValue(zip_data.state)
            //   : null;
            // zip_data ? this.userForm.get('City')!.setValue(zip_data.city) : null;
            this.userForm.get('State').enable();
            this.userForm.get('City').enable();
            this.userForm.get('State')!.setValue(zip_data.state);
            this.userForm.get('City')!.setValue(zip_data.city);
            console.log(zip_data);
          } else {
            this.userForm.get('State').disable();
            this.userForm.get('City').disable();
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
  resetForm() {
    this.getUserDetails();
  }
  onChangeTag(event) {
    this.customer.Username = event.target.value
      .replaceAll(' ', '')
      .replaceAll(/\s*,+\s*/g, ',');
  }

  onChangeData(): void {
    this.isEdit = true;
  }
  convertToUppercase(event: any) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
    inputValue = inputValue.replace(/\s/g, '');
    inputElement.value = inputValue.toUpperCase();
  }
  onProfileImgChange(event: any): void {
    this.profileImg = event;
  }

  onProfileCoverImgChange(event: any): void {
    this.profileCoverImg = event;
  }
  uploadImgAndUpdateCustomer(): void {
    let uploadObs = {};
    if (this.profileImg?.file?.name) {
      uploadObs['profileImg'] = this.uploadService.uploadFile(
        this.profileImg?.file
      );
    }

    if (this.profileCoverImg?.file?.name) {
      uploadObs['profileCoverImg'] = this.uploadService.uploadFile(
        this.profileCoverImg?.file
      );
    }

    if (Object.keys(uploadObs)?.length > 0) {
      this.spinner.show();

      forkJoin(uploadObs).subscribe({
        next: (res: any) => {
          if (res?.profileImg?.body?.url) {
            this.profileImg['file'] = null;
            this.profileImg['url'] = res?.profileImg?.body?.url;
            this.sharedService['userData']['ProfilePicName'] =
              this.profileImg['url'];
          }

          if (res?.profileCoverImg?.body?.url) {
            this.profileCoverImg['file'] = null;
            this.profileCoverImg['url'] = res?.profileCoverImg?.body?.url;
            this.sharedService['userData']['CoverPicName'] =
              this.profileCoverImg['url'];
          }

          this.updateCustomer();
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      this.updateCustomer();
    }
  }
  updateCustomer(): void {
    if (this.profileId) {
      this.spinner.show();
      this.customer.ProfilePicName =
        this.profileImg?.url || this.customer.ProfilePicName;
      this.customer.CoverPicName =
        this.profileCoverImg?.url || this.customer.CoverPicName;
      this.customer.IsActive = 'Y';
      this.customer.UserID = +this.userId;
      this.customerService
        .updateProfile(this.profileId, this.customer)
        .subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (!res.error) {
              this.toastService.success(res.message);
              this.sharedService.getUserDetails();
            } else {
              this.toastService.danger(res?.message);
            }
          },
          error: (error) => {
            console.log(error.error.message);
            this.spinner.hide();
            this.toastService.danger(error.error.message);
          },
        });
    }
  }
  confirmAndUpdateCustomer(): void {
    if (this.profileId) {
      const modalRef = this.modalService.open(ConfirmationModalComponent, {
        centered: true,
      });
      modalRef.componentInstance.title = 'Update Profile';
      modalRef.componentInstance.confirmButtonLabel = 'Update';
      modalRef.componentInstance.cancelButtonLabel = 'Cancel';
      modalRef.componentInstance.message =
        'Are you sure want to update profile details?';

      modalRef.result.then((res) => {
        if (res === 'success') {
          this.uploadImgAndUpdateCustomer();
        }
      });
    }
  }
  deleteAccount(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.title = 'Delete Account';
    modalRef.componentInstance.confirmButtonLabel = 'Delete';
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.componentInstance.message =
      'Are you sure want to delete your account?';
    modalRef.result.then((res) => {
      if (res === 'success') {
        this.customerService
          .deleteCustomer(this.userlocalId, this.profileId)
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.toastService.success(
                  res.message || 'Account deleted successfully'
                );
                this.tokenStorage.signOut();
                this.router.navigateByUrl('register');
              }
            },
            error: (error) => {
              console.log(error);
              this.toastService.success(error.message);
            },
          });
      }
    });
  }
}
