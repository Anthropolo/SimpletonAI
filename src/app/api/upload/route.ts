import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const datasetId = uuidv4();
    const filename = `${datasetId}_${file.name}`;
    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    const filepath = path.join(uploadDir, filename);

    // Write file to uploads directory
    await writeFile(filepath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      datasetId,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
