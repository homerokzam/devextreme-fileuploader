import http, { getUrl } from "./httpService";

const apiEndpoint = "Documentos";

export function getUploadUrl(empresaId, chunks) {
  const schunks = JSON.stringify(chunks);
  const baseUrl = `${getUrl()}${apiEndpoint}/${empresaId}/${schunks}`;
  return baseUrl;
}

export function getDocumentos(empresaId) {
  const baseUrl = `${apiEndpoint}/${empresaId}`;
  return http.get(baseUrl);
}

export function getDocumento(empresaId, filename) {
  const baseUrl = `${apiEndpoint}/Documento/${empresaId}/${filename}`;
  return http.get(baseUrl, { responseType: 'blob' });
}

export function deleteDocumento(empresaId, filename) {
  let url = `${apiEndpoint}/${empresaId}/${filename}`;
  return http.delete(url);
}