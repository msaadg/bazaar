// /app/api/reports/stock-movements/route.ts
import { getStockMovements } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const storeId = req.nextUrl.searchParams.get("storeId");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    // Input validation
    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json(
        { message: "Store ID is required and must be a string" },
        { status: 400 }
      );
    }

    // Optional date range validation
    if (startDate && typeof startDate !== "string") {
      return NextResponse.json(
        { message: "Start date must be a string in ISO format" },
        { status: 400 }
      );
    }
    if (endDate && typeof endDate !== "string") {
      return NextResponse.json(
        { message: "End date must be a string in ISO format" },
        { status: 400 }
      );
    }

    const stockMovements = await getStockMovements({
      storeId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json(stockMovements, { status: 200 });
  } catch (error) {
    console.error("Get stock movements error:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}