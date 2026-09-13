import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';

/**
 * Extract text content from an uploaded file.
 * Supports PDF, DOCX, and PPTX formats.
 */
export async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  switch (ext) {
    case '.pdf':
      return await extractPDF(filePath);
    case '.docx':
      return await extractDOCX(filePath);
    case '.pptx':
      return await extractPPTX(filePath);
    default:
      throw new Error(`Unsupported file format: ${ext}. Please upload a PDF, DOCX, or PPTX file.`);
  }
}

/**
 * Extract text from a PDF file using pdf-parse.
 */
async function extractPDF(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text?.trim();

    if (!text || text.length < 50) {
      throw new Error('The PDF appears to be empty or contains very little text. It may be a scanned document or image-based PDF.');
    }

    return text;
  } catch (err) {
    if (err.message.includes('appears to be empty')) throw err;
    throw new Error(`Failed to read PDF file. The file may be corrupted or password-protected. (${err.message})`);
  }
}

/**
 * Extract text from a DOCX file using mammoth.
 */
async function extractDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value?.trim();

    if (!text || text.length < 50) {
      throw new Error('The DOCX file appears to be empty or contains very little text content.');
    }

    return text;
  } catch (err) {
    if (err.message.includes('appears to be empty')) throw err;
    throw new Error(`Failed to read DOCX file. The file may be corrupted. (${err.message})`);
  }
}

/**
 * Extract text from a PPTX file by parsing the XML inside the ZIP.
 * PPTX files are ZIP archives containing XML slide files.
 */
async function extractPPTX(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    // Find all slide XML files (ppt/slides/slide1.xml, slide2.xml, etc.)
    const slideEntries = entries
      .filter(e => /^ppt\/slides\/slide\d+\.xml$/i.test(e.entryName))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/slide(\d+)/)[1]);
        const numB = parseInt(b.entryName.match(/slide(\d+)/)[1]);
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      throw new Error('The PPTX file contains no slides.');
    }

    const texts = [];

    for (const entry of slideEntries) {
      const xml = entry.getData().toString('utf8');
      // Extract text from <a:t> tags (PowerPoint text runs)
      const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
      if (matches) {
        const slideText = matches
          .map(m => m.replace(/<[^>]+>/g, '').trim())
          .filter(t => t.length > 0)
          .join(' ');
        if (slideText) {
          texts.push(slideText);
        }
      }
    }

    const fullText = texts.join('\n\n');

    if (!fullText || fullText.length < 50) {
      throw new Error('The PPTX file appears to be empty or contains very little text content.');
    }

    return fullText;
  } catch (err) {
    if (err.message.includes('appears to be empty') || err.message.includes('no slides')) throw err;
    throw new Error(`Failed to read PPTX file. The file may be corrupted. (${err.message})`);
  }
}
