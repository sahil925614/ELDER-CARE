export async function withGatewayCheckout(checkout: () => Promise<void>) {
  // Body-mounted gateway overlays cannot appear above a native modal's top layer.
  const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
  dialog?.close();
  try {
    await checkout();
  } finally {
    if (dialog?.isConnected && !dialog.open) dialog.showModal();
  }
}
