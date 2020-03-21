import axios from "axios";
import { getConfig } from "./config";

const defaultOptions = {
  baseURL: getConfig().apiUrl,
};

let instance = axios.create(defaultOptions);

export const getUrl = () => {
  return getConfig().apiUrl;
}

export default {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete
};