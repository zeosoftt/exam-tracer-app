/**
 * Pagination Utilities
 */

import { PAGINATION } from '@/config/constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(page?: number, pageSize?: number): PaginationParams {
  const parsedPage = Math.max(1, page || 1);
  const parsedPageSize = Math.min(
    PAGINATION.MAX_PAGE_SIZE,
    Math.max(PAGINATION.MIN_PAGE_SIZE, pageSize || PAGINATION.DEFAULT_PAGE_SIZE)
  );

  return {
    page: parsedPage,
    pageSize: parsedPageSize,
  };
}

export function getSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = getTotalPages(total, pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
