import { getPersons } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { data, total } = getPersons(page, pageSize);

  return NextResponse.json({
    data: data,
    total,
    pageCount: Math.ceil(total / pageSize)
  });
}
