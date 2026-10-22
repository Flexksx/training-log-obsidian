export const interceptLink = (event: MouseEvent, open: () => void): void => {
  event.preventDefault();
  open();
};
