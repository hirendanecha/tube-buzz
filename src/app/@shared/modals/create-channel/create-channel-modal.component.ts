import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../services/toast.service';
import { ChannelService } from '../../services/channels.service';
import { AuthService } from '../../services/auth.service';
import { UploadFilesService } from '../../services/upload-files.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create-channel-modal',
  templateUrl: './create-channel-modal.component.html',
  styleUrls: ['./create-channel-modal.component.scss'],
})
export class CreateChannelComponent implements OnInit{
  @Input() title: string = 'Create Channel';
  @Input() channelEditData: any = [];

  userForm = new FormGroup({
    profileid: new FormControl(),
    profile_pic_name: new FormControl(''),
    feature: new FormControl(true),
    firstname: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    unique_link: new FormControl({ value: '', disabled: true }),
  });
  profileImg: any = {
    file: null,
    url: '',
  };
  selectedFile: any;
  myProp: string;
  hasDisplayedError = false;
  userData: any = {};

  constructor(
    private spinner: NgxSpinnerService,
    public toastService: ToastService,
    public activateModal: NgbActiveModal,
    private channelService: ChannelService,
    private uploadFilesService: UploadFilesService,
    public authService: AuthService,
    private router: Router
  ) {
    this.userData = this.authService.getUserData() as any;
  }

  ngOnInit(): void {
    if (this.channelEditData) {
      this.userForm.get('unique_link').enable();
      this.selectedFile = this.channelEditData.profile_pic_name;
      this.userForm.patchValue(this.channelEditData);
    }
  }

  slugify = (str: string) => {
    return str?.length > 0
      ? str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';
  };

  onChannelNameChange(): void {
    this.userForm.get('unique_link').enable();
    const channelName = this.userForm.get('firstname').value;
    const uniqueLink = this.slugify(channelName);
    this.userForm.get('unique_link').setValue(uniqueLink);
  }

  saveChanges(): void {
    this.userForm.get('profileid').setValue(this.userData.profileId)
    if (this.userForm.valid && !this.channelEditData.id) {
      this.spinner.show();
      this.channelService.createChannel(this.userForm.value).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.activateModal.close('success');
          this.toastService.success('Channel created successfully');
          this.channelService.getChannels();
          this.channelService.getMyChannels();
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err);
        },
      });
    } else if (this.userForm.valid && this.channelEditData.id){
      this.spinner.show();
      const id = this.channelEditData.id;
      console.log(this.userForm.value);
      this.channelService.editChannal(id, this.userForm.value).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.toastService.success('Channel Edit successfully');
          this.router.navigate([`channels/${this.userForm.get('unique_link').value}`]);
          this.activateModal.close('success');
          this.channelService.getChannels();
          this.channelService.getMyChannels();
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err);
        },
      });
    }
  }

  upload() {
    this.spinner.show();
    if (this.profileImg.file) {
      this.uploadFilesService.uploadFile(this.profileImg.file).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.body) {
            const profilePic = res?.body?.url;
            this.userForm.get('profile_pic_name').setValue(profilePic);
            this.saveChanges();
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.profileImg = {
            file: null,
            url: '',
          };
        },
      });
    } else if (this.channelEditData.id){
      this.saveChanges();
    } else {
      this.toastService.danger('Please select channel logo!');
    }
  }

  onFileSelected(event: any) {
    this.profileImg.file = event.target?.files?.[0];
    this.selectedFile = URL.createObjectURL(event.target.files[0]);
  }

  removePostSelectedFile(): void {
    this.selectedFile = null;
    this.profileImg = {
      file: null,
      url: '',
    };
  }
}
