// /app/api/stock-in/route.ts
import { createStockMovement, upsertProduct } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, name, quantity, storeId } = await req.json();

    // Input validation
    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { message: "Product ID is required and must be a string" },
        { status: 400 }
      );
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Product name is required and must be a string" },
        { status: 400 }
      );
    }
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { message: "Quantity must be a positive number" },
        { status: 400 }
      );
    }
    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json(
        { message: "Store ID is required and must be a string" },
        { status: 400 }
      );
    }

    const product = await upsertProduct({ productId, name, quantity, storeId });

    await createStockMovement({ productId, type: "STOCK_IN", quantity, storeId });

    return NextResponse.json(
      { message: "Stock added successfully", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stock-in error:", error);
    return NextResponse.json({ message: "Failed to add stock" }, { status: 500 });
  }
}