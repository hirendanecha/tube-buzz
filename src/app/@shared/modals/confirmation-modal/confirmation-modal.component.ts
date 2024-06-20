import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent implements OnInit{
  @Input() cancelButtonLabel: string | undefined = 'Cancel';
  @Input() confirmButtonLabel: string | undefined = 'Confirm';
  @Input() title: string | undefined = 'Confirmation Dialog';
  @Input() message: string | undefined;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.activeModal.close();
    }, 30000);
  }
}
