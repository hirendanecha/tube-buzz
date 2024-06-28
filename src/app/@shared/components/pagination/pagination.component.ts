import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { Pagination } from '../../interfaces/pagination';


@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {

  @Input({ required: true }) items: number;
  @Input() activePage: number = 1;
  @Input() perPage: number = 20;
  @Input() size: "sm" | "lg" = null;

  @Output() onPageChange = new EventEmitter<Pagination>();

  config: Pagination = null;
  perPageCtrl: FormControl;

  constructor() {
    this.perPageCtrl = new FormControl(this.perPage);

    this.perPageCtrl.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.setPaginator();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const items = changes['items'].currentValue;
    if (items) {
      this.items = items;
      this.setPaginator();
    }
  }

  pageChange(page: number = 1): void {
    // if ((page < 1) || (page > this.config?.totalPages) || (page === this.config?.activePage)) {
    //   return;
    // }
    this.activePage = page;
    this.setPaginator();
  }

  setPaginator(): void {
    const totalItems: number = this.items;
    const perPage: number = this.perPageCtrl.value;
    const totalPages: number = Math.ceil(totalItems / perPage);
    let startPage: number, endPage: number, isStartEllipsesShow: boolean, isEndEllipsesShow: boolean;

    if (this.activePage > totalPages) {
      this.activePage = 1;
    }

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
      isStartEllipsesShow = false;
      isEndEllipsesShow = false;
    } else if (this.activePage <= 3) {
      startPage = 1;
      endPage = 4;
      isStartEllipsesShow = false;
      isEndEllipsesShow = true;
    } else if ((this.activePage + 2) >= totalPages) {
      startPage = totalPages - 3;
      endPage = totalPages;
      isStartEllipsesShow = true;
      isEndEllipsesShow = false;
    } else {
      startPage = this.activePage - 1;
      endPage = this.activePage + 1;
      isStartEllipsesShow = true;
      isEndEllipsesShow = true;
    }

    this.config = {
      activePage: this.activePage,
      perPage: perPage,
      totalItems: totalItems,
      totalPages: totalPages,
      isStartEllipsesShow: isStartEllipsesShow,
      isEndEllipsesShow: isEndEllipsesShow,
      pages: startPage <= endPage ? Array(endPage - startPage + 1).fill(0).map((x, i) => startPage + i) : []
    } as Pagination;
    this.onPageChange.emit(this.config);
  }
}
