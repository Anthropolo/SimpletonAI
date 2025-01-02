import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import pdf from 'pdf-parse';

interface UploadOptions {
  type: 'excel' | 'pdf';
}

export async function uploadDataset(filePath: string, options: UploadOptions) {
  try {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique dataset ID
    const datasetId = `dataset_${Date.now()}`;
    const fileExt = path.extname(filePath);
    const destPath = path.join(uploadDir, `${datasetId}${fileExt}`);

    // Copy file to uploads directory
    fs.copyFileSync(filePath, destPath);

    // Process file based on type
    let content: string;
    if (options.type === 'excel') {
      const workbook = xlsx.readFile(destPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      content = xlsx.utils.sheet_to_json(sheet).map(row => JSON.stringify(row)).join('\n');
    } else if (options.type === 'pdf') {
      const dataBuffer = fs.readFileSync(destPath);
      const pdfContent = await pdf(dataBuffer);
      content = pdfContent.text;
    } else {
      throw new Error(`Unsupported file type: ${options.type}`);
    }

    // Save processed content
    const contentPath = path.join(uploadDir, `${datasetId}.txt`);
    fs.writeFileSync(contentPath, content);

    console.log(`✨ Dataset uploaded successfully! Dataset ID: ${datasetId}`);
    return datasetId;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw error;
  }
}
