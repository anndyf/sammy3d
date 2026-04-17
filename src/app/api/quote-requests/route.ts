import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/api";

// GET: Lista todas as solicitações (Admin) com paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get('page')  || '1',  10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip  = (Math.max(1, page) - 1) * limit;

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.quote.count(),
    ]);

    return NextResponse.json({
      data: quotes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("GET Quotes Error:", error);
    return apiError("Erro ao buscar solicitações.", 500, error.message);
  }
}

// POST: Cliente envia uma solicitação pública
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, clientContact, projectName, description, fileUrl, purpose, dimensions, preferredColor, externalLink } = body;

    const validationError = requireFields({ clientName, clientContact, projectName });
    if (validationError) return validationError;

    const quote = await prisma.quote.create({
      data: {
        clientName:     String(clientName),
        clientContact:  String(clientContact),
        projectName:    String(projectName),
        purpose:        purpose        ? String(purpose)         : null,
        dimensions:     dimensions     ? String(dimensions)      : null,
        preferredColor: preferredColor ? String(preferredColor)  : null,
        description:    description    ? String(description)     : null,
        fileUrl:        fileUrl        ? String(fileUrl)         : null,
        externalLink:   externalLink   ? String(externalLink)    : null,
        status:         'PENDING',
      },
    });

    return NextResponse.json({ success: true, id: quote.id }, { status: 201 });
  } catch (error: any) {
    console.error("POST Quote Error:", error);
    return apiError("Erro ao criar solicitação.", 500, error.message);
  }
}
