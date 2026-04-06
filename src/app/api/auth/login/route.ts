import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // SAMMY3D Admin Password (Simple and Functional for Enterprise use)
    if (username === 'sammy3d' && password === 'admin2024') {
      const response = NextResponse.json({ success: true, message: 'Autenticado' });
      
      // Define o cookie de sessão (expira em 24h)
      response.cookies.set({
        name: 'sammy_session',
        value: 'sammy_admin_session_token', // O middleware apenas verifica a presença, simplificado para o ERP.
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 24h
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Credenciais inválidas' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro no servidor' }, { status: 500 });
  }
}
