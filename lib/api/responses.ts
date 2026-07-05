/**
 * Standart API yanıt zarfı — controller'lar tek formatta döner.
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/config/constants';

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  timestamp?: string;
};

export function jsonOk<T>(data: T, status: number = HTTP_STATUS.OK): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonCreated<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return jsonOk(data, HTTP_STATUS.CREATED);
}
