// /app/api/stores/route.ts
import { createStore, findUserByEmail, getStoresByUser } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = token.sub;

    const stores = await getStoresByUser(userId);
    return NextResponse.json(stores, { status: 200 });
  } catch (error) {
    console.error("Get stores error:", error);
    return NextResponse.json({ message: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);
  
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const userId = user.id;
    const { name } = await req.json();

    const newStore = await createStore({ name, userId });

    return NextResponse.json(
      { message: "Store created successfully", store: newStore },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create store error:", error);
    return NextResponse.json({ message: "Failed to create store" }, { status: 500 });
  }
}