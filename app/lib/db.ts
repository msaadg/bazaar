// /app/lib/db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Product {
  id: string;
  name: string;
  currentQuantity: number;
}

export async function upsertProduct(data: { productId: string; name: string; quantity: number }) {
  return prisma.product.upsert({
    where: { id: data.productId },
    update: { currentQuantity: { increment: data.quantity } },
    create: { id: data.productId, name: data.name, currentQuantity: data.quantity },
  });
}

export async function reduceProductStock(productId: string, quantity: number): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error("Product not found");
  }
  if (product.currentQuantity < quantity) {
    throw new Error("Insufficient stock");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { currentQuantity: { decrement: quantity } },
  });

  if (updatedProduct.currentQuantity < 10) {
    console.log(`Low stock alert: ${updatedProduct.name} has ${updatedProduct.currentQuantity} units left`);
  }

  return updatedProduct;
}

export async function createStockMovement(data: {
  productId: string;
  type: "STOCK_IN" | "SALE" | "MANUAL_REMOVAL";
  quantity: number;
}) {
  return prisma.stockMovement.create({
    data: {
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      currentQuantity: true,
    },
  });
}

export async function disconnect() {
  await prisma.$disconnect();
}

export default prisma;