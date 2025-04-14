// /app/api/products/route.ts
import { getAllProducts } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");

    // Input validation
    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json(
        { message: "Store ID is required and must be a string" },
        { status: 400 }
      );
    }

    const products = await getAllProducts(storeId);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}