import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Creates a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const path = join(process.cwd(), 'public/uploads', filename);

    await writeFile(path, buffer);

    // Returns the relative URL for the DB
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
