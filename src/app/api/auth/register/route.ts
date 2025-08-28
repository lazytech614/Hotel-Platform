import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { hashPassword, generateToken } from '../../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, role } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const tenantId = role === 'Owner' ? uuidv4() : undefined;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      tenantId
    });

    await user.save();

    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      tenantId: user.tenantId 
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    return NextResponse.json({ 
      user: userResponse, 
      token 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
