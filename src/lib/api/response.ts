import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  status = 200,
) {
  return NextResponse.json(
    {
      data,
    },
    { status },
  );
}