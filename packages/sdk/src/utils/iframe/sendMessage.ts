import { IframeMessage } from './constants';

export const sendIframeMessage = (message: IframeMessage) => {
  window.parent.postMessage(message, '*');
};
