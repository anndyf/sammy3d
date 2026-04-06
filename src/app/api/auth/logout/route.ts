import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout efetuado' });
  
  // Limpa o cookie de sessão
  response.cookies.delete('sammy_session');

  return response;
}
