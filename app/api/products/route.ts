// src/pages/api/products.ts
import { getAllProducts } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}