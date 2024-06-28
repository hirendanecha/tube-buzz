export interface Pagination {
  activePage: number,
  perPage: number,
  totalItems: number,
  totalPages?: number,
  isStartEllipsesShow?: boolean,
  isEndEllipsesShow?: boolean,
  pages?: number[]
}
