import {
  DEFAULT_UPLOAD_CONTENT_TYPE,
  MAX_UPLOAD_BYTES,
  decodeBase64Content,
  decodeUploadInput,
  resolveContentType,
  sanitizeFileName,
  toMulterFile,
} from './storage-upload.util.js';

describe('storage upload utils', () => {
  describe('decodeBase64Content', () => {
    it('decodes standard padded base64', () => {
      const buffer = decodeBase64Content('aGVsbG8=');

      expect(buffer.toString('utf8')).toBe('hello');
    });

    it('decodes URL-safe unpadded base64', () => {
      const source = Buffer.from('hello?');
      const urlSafe = source
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const buffer = decodeBase64Content(urlSafe);

      expect(buffer.equals(source)).toBe(true);
    });

    it('tolerates a data URL prefix and whitespace', () => {
      const buffer = decodeBase64Content(
        'data:application/pdf;base64,aGVs\nbG8=',
      );

      expect(buffer.toString('utf8')).toBe('hello');
    });

    it('rejects content that is not base64', () => {
      expect(() => decodeBase64Content('not base64!!')).toThrow(/valid base64/);
    });

    it('rejects empty content', () => {
      expect(() => decodeBase64Content('')).toThrow(/valid base64/);
    });

    it('rejects content above the decoded size limit', () => {
      const oversized = Buffer.alloc(MAX_UPLOAD_BYTES + 1).toString('base64');

      expect(() => decodeBase64Content(oversized)).toThrow(/limit is/);
    });
  });

  describe('sanitizeFileName', () => {
    it('keeps only the last path segment', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
      expect(sanitizeFileName('C:\\docs\\resume.pdf')).toBe('resume.pdf');
    });

    it('removes control characters and trims', () => {
      expect(sanitizeFileName(' resume\u0000.pdf\n')).toBe('resume.pdf');
    });

    it('rejects names without a usable segment', () => {
      expect(() => sanitizeFileName('   ')).toThrow(/usable file name/);
      expect(() => sanitizeFileName('..')).toThrow(/usable file name/);
    });

    it('rejects names that are too long', () => {
      expect(() => sanitizeFileName(`${'a'.repeat(201)}.pdf`)).toThrow(
        /at most 200/,
      );
    });
  });

  describe('resolveContentType', () => {
    it('falls back to the binary content type', () => {
      expect(resolveContentType()).toBe(DEFAULT_UPLOAD_CONTENT_TYPE);
    });

    it('lower-cases a valid MIME type', () => {
      expect(resolveContentType('Application/PDF')).toBe('application/pdf');
    });

    it('rejects a MIME type with parameters', () => {
      expect(() => resolveContentType('text/plain; charset=utf-8')).toThrow(
        /MIME type/,
      );
    });
  });

  describe('decodeUploadInput', () => {
    it('combines the decoded buffer, sanitized name and content type', () => {
      const upload = decodeUploadInput({
        fileName: '../resume.pdf',
        contentBase64: 'aGVsbG8=',
        contentType: 'application/pdf',
      });

      expect(upload.fileName).toBe('resume.pdf');
      expect(upload.mimeType).toBe('application/pdf');
      expect(upload.buffer.toString('utf8')).toBe('hello');
    });
  });

  describe('toMulterFile', () => {
    it('builds the shape consumed by StorageService', () => {
      const buffer = Buffer.from('hello');
      const file = toMulterFile({
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer,
      });

      expect(file.originalname).toBe('resume.pdf');
      expect(file.mimetype).toBe('application/pdf');
      expect(file.size).toBe(5);
      expect(file.buffer).toBe(buffer);
      expect(file.stream).toBeDefined();
    });
  });
});
