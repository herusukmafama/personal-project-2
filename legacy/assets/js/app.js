/*
  Responsibility:
  Coordinates browser UI events, file selection, DOCX parsing, JSON preview,
  and JSON download actions.

  This file does not implement DOCX parsing or JSON mapping rules.
*/

(function attachConverterApp(global) {
  "use strict";

  const state = {
    selectedFile: null,
    generatedJson: null,
    downloadFileName: "converted.json"
  };

  const elements = {
    fileInput: document.getElementById("docx-file"),
    fileName: document.getElementById("file-name"),
    conversionStatus: document.getElementById("conversion-status"),
    convertButton: document.getElementById("convert-button"),
    resetButton: document.getElementById("reset-button"),
    downloadButton: document.getElementById("download-button"),
    messageBox: document.getElementById("message-box"),
    previewMeta: document.getElementById("preview-meta"),
    jsonOutput: document.getElementById("json-output")
  };

  function initialize() {
    elements.fileInput.addEventListener("change", handleFileSelection);
    elements.convertButton.addEventListener("click", handleConvertClick);
    elements.resetButton.addEventListener("click", resetState);
    elements.downloadButton.addEventListener("click", handleDownloadClick);
    renderInitialState();
  }

  function handleFileSelection(event) {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    state.selectedFile = file;
    state.generatedJson = null;
    state.downloadFileName = file ? buildDownloadFileName(file.name) : "converted.json";

    if (!file) {
      resetState();
      return;
    }

    const validation = global.DocxParser.validateDocxFile(file);
    elements.fileName.textContent = `${file.name} (${global.DocxParser.formatBytes(file.size)})`;
    elements.convertButton.disabled = !validation.valid;
    elements.downloadButton.disabled = true;
    elements.jsonOutput.textContent = "{}";
    elements.previewMeta.textContent = "Preview will appear after conversion.";

    if (!validation.valid) {
      setStatus("Validation failed");
      showMessage(validation.errors.join(" "), "error");
      return;
    }

    setStatus("Ready to convert");
    showMessage("File is valid. Click Convert to generate JSON.", "success");
  }

  async function handleConvertClick() {
    if (!state.selectedFile) {
      showMessage("Please choose a .docx file first.", "error");
      return;
    }

    setBusy(true);
    setStatus("Converting");
    showMessage("Reading DOCX and applying mapping rules...", "neutral");

    try {
      const parsedDocument = await global.DocxParser.parseDocxFile(state.selectedFile);
      const mappedJson = global.JsonMapper.mapParsedDocumentToJson(parsedDocument);
      state.generatedJson = mappedJson;
      elements.jsonOutput.textContent = JSON.stringify(mappedJson, null, 2);
      elements.previewMeta.textContent = `${mappedJson.page_title || "Converted document"} - ${parsedDocument.messages.length} parser message(s)`;
      elements.downloadButton.disabled = false;
      setStatus("Converted");
      showMessage("JSON generated successfully. You can download the result.", "success");
    } catch (error) {
      state.generatedJson = null;
      elements.downloadButton.disabled = true;
      elements.jsonOutput.textContent = "{}";
      elements.previewMeta.textContent = "Preview will appear after conversion.";
      setStatus("Failed");
      showMessage(error.message || "Conversion failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  function handleDownloadClick() {
    if (!state.generatedJson) {
      showMessage("No generated JSON is available to download.", "error");
      return;
    }

    const jsonText = JSON.stringify(state.generatedJson, null, 2);
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = state.downloadFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);

    showMessage(`Downloaded ${state.downloadFileName}.`, "success");
  }

  function resetState() {
    state.selectedFile = null;
    state.generatedJson = null;
    state.downloadFileName = "converted.json";
    elements.fileInput.value = "";
    renderInitialState();
  }

  function renderInitialState() {
    elements.fileName.textContent = "No file selected";
    elements.conversionStatus.textContent = "Waiting for upload";
    elements.convertButton.disabled = true;
    elements.downloadButton.disabled = true;
    elements.jsonOutput.textContent = "{}";
    elements.previewMeta.textContent = "Preview will appear after conversion.";
    showMessage("", "neutral");
  }

  function setBusy(isBusy) {
    elements.convertButton.disabled = isBusy || !state.selectedFile;
    elements.resetButton.disabled = isBusy;
    elements.fileInput.disabled = isBusy;
    elements.convertButton.textContent = isBusy ? "Converting..." : "Convert";
  }

  function setStatus(value) {
    elements.conversionStatus.textContent = value;
  }

  function showMessage(message, type) {
    elements.messageBox.textContent = message;
    elements.messageBox.className = "message-box";

    if (type === "error") {
      elements.messageBox.classList.add("is-error");
    }

    if (type === "warning") {
      elements.messageBox.classList.add("is-warning");
    }

    if (type === "success") {
      elements.messageBox.classList.add("is-success");
    }
  }

  function buildDownloadFileName(fileName) {
    return String(fileName || "converted.docx").replace(/\.docx$/i, ".json");
  }

  document.addEventListener("DOMContentLoaded", initialize);
})(window);
