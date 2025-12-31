import pako from 'pako';

const gzipFile = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const compressed = pako.gzip(new Uint8Array(arrayBuffer));
      const fileCompressed = new File([compressed], `${file.name}.gz`, {
        type: 'application/octet-stream',
      });
      resolve(fileCompressed);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const gzipJson = (
  json: object,
  fileName: `${string}.gz` = 'file.json.gz',
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const jsonString = JSON.stringify(json);
      const compressedData = pako.gzip(jsonString);
      const blobCompressed = new File([compressedData], fileName, {
        type: 'application/octet-stream',
      });
      resolve(blobCompressed);
    } catch (error) {
      reject(error);
    }
  });
};

export const CompressUtils = { gzipFile, gzipJson };
