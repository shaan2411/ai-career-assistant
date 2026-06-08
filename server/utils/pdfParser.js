/**
 * utils/pdfParser.js — Resume Text Extraction
 *
 * Extracts text content from PDF and DOCX resume files.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file using pdf-parse
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new Error('Failed to extract text from PDF file');
  }
};

/**
 * Extract text from a DOCX file by stripping XML markup
 * Uses regex-based extraction as a lightweight alternative to mammoth
 * @param {string} filePath - Absolute path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
const extractFromDOCX = async (filePath) => {
  try {
    // DOCX is a ZIP archive — try to extract XML text content
    // Use regex-based approach to strip XML tags from the word document XML
    const buffer = fs.readFileSync(filePath);

    // Try to find text content in the binary
    // DOCX contains word/document.xml inside which has <w:t> tags
    const content = buffer.toString('binary');

    // Extract text between <w:t> tags (DOCX text elements)
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);

    if (textMatches && textMatches.length > 0) {
      const text = textMatches
        .map((match) => match.replace(/<[^>]*>/g, ''))
        .filter((t) => t.trim().length > 0)
        .join(' ');
      return text;
    }

    // Fallback: strip all XML tags from content
    const stripped = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Filter out binary/non-printable characters
    const printable = stripped
      .split('')
      .filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) < 127)
      .join('');

    return printable.substring(0, 10000); // Limit to 10k chars
  } catch (error) {
    console.error('DOCX parsing error:', error.message);
    throw new Error('Failed to extract text from DOCX file');
  }
};

/**
 * Parse resume file and extract text content
 * @param {string} filePath - Absolute path to resume file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
const parseResume = async (filePath, mimeType) => {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('Resume file not found');
  }

  if (mimeType === 'application/pdf') {
    return await extractFromPDF(absolutePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return await extractFromDOCX(absolutePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

module.exports = { parseResume };
