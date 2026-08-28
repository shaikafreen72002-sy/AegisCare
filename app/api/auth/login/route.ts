import { NextResponse } from 'next/server';
import { findOrRegisterUser } from '@/lib/stateStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier = 'lakshmi@example.com', name, role = 'PATIENT', is_register = false } = body;

    const storedUser = findOrRegisterUser(identifier, name, role, is_register);

    const user = {
      user_id: storedUser.user_id,
      identifier: storedUser.identifier,
      name: storedUser.name,
      preferred_name: storedUser.preferred_name,
      role: storedUser.role,
      intake_completed: storedUser.intake_completed,
      token: `aegis_jwt_${Date.now()}`
    };

    return NextResponse.json({
      success: true,
      message: is_register 
        ? `Account successfully created for ${user.name}` 
        : `Authenticated successfully as ${user.preferred_name}`,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || 'Authentication error' }, { status: 500 });
  }
}
