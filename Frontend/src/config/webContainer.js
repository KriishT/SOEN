import { WebContainer } from "@webcontainer/api";

let webcontainerInstance = null;

export const getWebContainer = () => {
  if (webcontainerInstance === null) {
    webcontainerInstance = new WebContainer();
  }
  return webcontainerInstance;
};
