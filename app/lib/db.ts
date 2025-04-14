// /app/lib/db.ts
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Product } from "@/app/lib/types";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function upsertProduct(data: {
  productId: string;
  name: string;
  quantity: number;
  storeId: string;
}) {
  return prisma.product.upsert({
    where: { id: data.productId },
    update: { currentQuantity: { increment: data.quantity } },
    create: {
      id: data.productId,
      name: data.name,
      currentQuantity: data.quantity,
      storeId: data.storeId,
    },
  });
}

export async function reduceProductStock(
  productId: string,
  quantity: number,
  storeId: string
): Promise<Product> {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!product) {
    throw new Error("Product not found in the specified store");
  }
  if (product.currentQuantity < quantity) {
    throw new Error("Insufficient stock");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { currentQuantity: { decrement: quantity } },
  });

  if (updatedProduct.currentQuantity < 10) {
    console.log(
      `Low stock alert: ${updatedProduct.name} has ${updatedProduct.currentQuantity} units left in store ${storeId}`
    );
  }

  return updatedProduct;
}

export async function createStockMovement(data: {
  productId: string;
  type: "STOCK_IN" | "SALE" | "MANUAL_REMOVAL";
  quantity: number;
  storeId: string;
}) {
  return prisma.stockMovement.create({
    data: {
      productId: data.productId,
      type: data.type,
      quantity: data.quantity,
      storeId: data.storeId,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getAllProducts(storeId: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { storeId },
    select: {
      id: true,
      name: true,
      currentQuantity: true,
      storeId: true,
    },
  });
}

export async function getStoresByUser(userId: string) {
  return prisma.store.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
  });
}

// Add this new function to fetch stock movements with filters
export async function getStockMovements({
  storeId,
  startDate,
  endDate,
}: {
  storeId: string;
  startDate?: string; // ISO string, e.g., "2025-01-01T00:00:00.000Z"
  endDate?: string; // ISO string, e.g., "2025-12-31T23:59:59.999Z"
}) {
  return prisma.stockMovement.findMany({
    where: {
      storeId,
      ...(startDate && endDate
        ? {
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
    select: {
      id: true,
      productId: true,
      type: true,
      quantity: true,
      timestamp: true,
      storeId: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

export async function createStore(data: { name: string; userId: string }) {
  try {
    return await prisma.store.create({
      data: {
        name: data.name,
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create store: ${error.message}`);
    }
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function disconnect() {
  await prisma.$disconnect();
}

export default prisma;