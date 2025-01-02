import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id;
    
    // First, ensure the CLI is built
    console.log('Building CLI...');
    await execAsync('npm run build:cli', { cwd: process.cwd() });
    
    // Execute the compiled CLI command
    const cliPath = path.resolve(process.cwd(), 'dist/cli/index.js');
    const command = `node ${cliPath} chunk ${datasetId}`;
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command);
    
    // Log the output for debugging
    if (stdout) console.log('Command output:', stdout);
    if (stderr) console.error('Command stderr:', stderr);

    // Check for actual errors in stderr
    if (stderr && stderr.includes('Error:')) {
      console.error('Chunking error:', stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Error during chunking:', error);
    
    // Extract the actual error message
    let errorMessage = error instanceof Error ? error.message : 'Failed to process chunking request';
    if (error instanceof Error && 'stderr' in error) {
      // @ts-ignore
      const stderr = error.stderr as string;
      if (stderr && stderr.includes('Error:')) {
        errorMessage = stderr.split('Error:')[1].trim();
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
