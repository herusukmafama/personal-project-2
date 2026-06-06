/*
  Responsibility:
  Validates uploaded DOCX files and converts them into an intermediate browser-side
  representation using Mammoth.js.

  JSON mapping rules belong in json-mapper.js.
*/

(function attachDocxParser(global) {
  "use strict";

  const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
  const DOCX_EXTENSION = ".docx";
  const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  class FileValidationError extends Error {
    constructor(messages) {
      super(messages.join(" "));
      this.name = "FileValidationError";
      this.messages = messages;
    }
  }

  function validateDocxFile(file, options = {}) {
    const maxFileSizeBytes = options.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE_BYTES;
    const errors = [];

    if (!file) {
      errors.push("Please choose a .docx file.");
      return { valid: false, errors };
    }

    const fileName = file.name || "";
    const hasDocxExtension = fileName.toLowerCase().endsWith(DOCX_EXTENSION);
    const hasSupportedMimeType = !file.type || file.type === DOCX_MIME_TYPE;

    if (!hasDocxExtension || !hasSupportedMimeType) {
      errors.push("Only Microsoft Word .docx files are supported.");
    }

    if (file.size === 0) {
      errors.push("The selected file is empty.");
    }

    if (file.size > maxFileSizeBytes) {
      errors.push(`The selected file is larger than ${formatBytes(maxFileSizeBytes)}.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async function parseDocxFile(file, options = {}) {
    const validation = validateDocxFile(file, options);

    if (!validation.valid) {
      throw new FileValidationError(validation.errors);
    }

    if (!global.mammoth || typeof global.mammoth.convertToHtml !== "function") {
      throw new Error("Mammoth.js is not loaded. Check lib/mammoth.browser.min.js.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await global.mammoth.convertToHtml(
      { arrayBuffer },
      {
        includeDefaultStyleMap: true,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh"
        ]
      }
    );

    const htmlDocument = new DOMParser().parseFromString(result.value, "text/html");

    return {
      fileName: file.name,
      fileSize: file.size,
      html: result.value,
      text: normalizeSpaces(htmlDocument.body.textContent || ""),
      metadata: extractMetadataTable(htmlDocument),
      messages: (result.messages || []).map((message) => ({
        type: message.type || "info",
        message: message.message || String(message)
      }))
    };
  }

  function extractMetadataTable(htmlDocument) {
    const metadata = {};
    const firstTable = htmlDocument.querySelector("table");

    if (!firstTable) {
      return metadata;
    }

    firstTable.querySelectorAll("tr").forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td, th"));

      if (cells.length < 2) {
        return;
      }

      const key = normalizeKey(cells[0].textContent);
      const value = normalizeSpaces(cells[1].textContent);

      if (key && value) {
        metadata[key] = value;
      }
    });

    return metadata;
  }

  function normalizeKey(value) {
    return normalizeSpaces(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_, character) => character.toUpperCase());
  }

  function normalizeSpaces(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  global.DocxParser = {
    DEFAULT_MAX_FILE_SIZE_BYTES,
    FileValidationError,
    formatBytes,
    parseDocxFile,
    validateDocxFile
  };
})(window);
