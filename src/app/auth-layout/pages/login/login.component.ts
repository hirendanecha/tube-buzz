import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';
import { ShareService } from 'src/app/@shared/services/share.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  isLike = false;
  isExpand = false;
  loginForm!: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  errorCode = '';
  loginMessage = '';
  msg = '';
  type = 'danger';
  theme = '';
  passwordHidden: boolean = true;

  constructor(
    private modalService:NgbModal,
    private spinner: NgxSpinnerService,
    private authService:AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private tokenStorage: TokenStorageService,
    private shareService: ShareService
  ){
    const isVerify = this.route.snapshot.queryParams['isVerify'];
    if (isVerify === 'false') {
      this.msg =
        'Please check your email and click the activation link to activate your account.';
      this.type = 'success';
    } else if (isVerify === 'true') {
      this.msg = 'Account activated';
      this.type = 'success';
    }
  }
  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.router.navigate([`/home`]);
    } 

    this.loginForm = this.fb.group({
      Email: [null, [Validators.required]],
      Password: [null, [Validators.required]],
    });
  }

  togglePasswordVisibility(passwordInput: HTMLInputElement) {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    this.passwordHidden = !this.passwordHidden;
  }

  onSubmit(): void {
    const token = localStorage.getItem('captcha-token');
    // if (!token) {
    //   this.msg = 'Invalid captcha kindly try again!';
    //   this.type = 'danger';
    //   return;
    // }
    if (this.loginForm.valid) {
      this.spinner.show();
      this.authService.customerlogin(this.loginForm.value).subscribe({
        next: (data: any) => {
          this.spinner.hide();
          if (!data.error) {
            // this.cookieService.set('token', data?.accessToken);
            // this.cookieService.set('userData', JSON.stringify(data?.user));
            this.tokenStorage.saveToken(data?.accessToken);
            this.tokenStorage.saveUser(data.user);
            localStorage.setItem('profileId', data.user.profileId);
            // localStorage.setItem('communityId', data.user.communityId);
            localStorage.setItem('channelId', data.user?.channelId);
            // window.localStorage.user_level_id = 2;
            // window.localStorage.user_id = data.user.Id;
            // window.localStorage.user_country = data.user.Country;
            // window.localStorage.user_zip = data.user.ZipCode;
            this.shareService.getUserDetails();
            this.isLoginFailed = false;
            this.isLoggedIn = true;
            this.toastService.success('Logged in successfully');
            // window.location.reload();
            this.router.navigate([`/home`]);
          } else {
            this.loginMessage = data.mesaage;
            this.spinner.hide();
            this.errorMessage =
              'Invalid Email and Password. Kindly try again !!!!';
            this.isLoginFailed = true;
            // this.toastService.danger(this.errorMessage);
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err.error);
          this.errorMessage = err.error.message; //err.error.message;
          // this.toastService.danger(this.errorMessage);
          this.isLoginFailed = true;
          this.errorCode = err.error.errorCode;
        },
      });
    }
  }
    
  forgotPasswordOpen() {
    const modalRef = this.modalService.open(ForgotPasswordComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.componentInstance.confirmButtonLabel = 'Submit';
    modalRef.componentInstance.closeIcon = true;
    modalRef.result.then((res) => {
      if (res === 'success') {
        this.msg =
          'If the entered email exists you will receive a email to change your password.';
        this.type = 'success';
      }
    });
  }
}
