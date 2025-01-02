import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    console.log('Received chunk request for dataset:', params.id);
    const datasetId = params.id;
    
    // First, ensure the CLI is built
    console.log('Building CLI...');
    const cliPath = path.resolve(process.cwd(), 'dist/cli/index.js');
    console.log('CLI path:', cliPath);

    return await new Promise<Response>((resolve, reject) => {
      const child = spawn('node', [cliPath, 'chunk', datasetId], {
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        console.log('CLI output:', str);
        stdout += str;
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        console.error('CLI error:', str);
        stderr += str;
      });

      child.on('close', (code) => {
        console.log('CLI process exited with code:', code);
        
        if (code !== 0) {
          console.error('CLI process failed:', stderr);
          resolve(NextResponse.json({ error: stderr || 'Chunking failed' }, { status: 500 }));
          return;
        }

        if (stderr && stderr.includes('Error:')) {
          console.error('Chunking error detected in stderr:', stderr);
          resolve(NextResponse.json({ error: stderr }, { status: 500 }));
          return;
        }

        console.log('Chunking completed successfully');
        resolve(NextResponse.json({ success: true, output: stdout }));
      });

      child.on('error', (error) => {
        console.error('Failed to start CLI process:', error);
        resolve(NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to start CLI process' },
          { status: 500 }
        ));
      });
    });
  } catch (error) {
    console.error('Error during chunking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chunking request' },
      { status: 500 }
    );
  }
}
