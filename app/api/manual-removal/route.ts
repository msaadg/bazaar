// src/pages/api/manual-removal.ts
import { createStockMovement, reduceProductStock } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity } = await req.json();

    // Input validation
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ message: "Product ID is required and must be a string" }, { status: 400 });
    }
    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ message: "Quantity must be a positive number" }, { status: 400 });
    }

    // Reduce the product's stock (includes low stock alert)
    let updatedProduct;
    try {
      updatedProduct = await reduceProductStock(productId, quantity);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Product not found") {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      if (error instanceof Error && error.message === "Insufficient stock") {
        return NextResponse.json({ message: "Insufficient stock for removal" }, { status: 400 });
      }
      throw error;
    }

    // Record the stock movement
    await createStockMovement({ productId, type: "MANUAL_REMOVAL", quantity });

    return NextResponse.json({ message: "Stock removed successfully", product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error("Manual removal error:", error);
    return NextResponse.json({ message: "Failed to remove stock" }, { status: 500 });
  }
}