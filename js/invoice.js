document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("invoiceForm");
  const dateInput = document.getElementById("invoiceDate");
  const result = document.getElementById("result");
  const preview = document.getElementById("invoicePreview");
  const linkInput = document.getElementById("paymentLink");

  dateInput.value = new Date().toISOString().slice(0, 10);

  let currentCanvas = null;
  let currentData = null;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = {
      student: document.getElementById("studentName").value.trim(),
      schedule: document.getElementById("schedule").value.trim(),
      sessions: document.getElementById("sessions").value,
      price: document.getElementById("price").value,
      date: dateInput.value,
      paymentPhone: document.getElementById("paymentPhone").value.trim(),
      currency: document.getElementById("currency").value.trim() || "MMK",
      invoiceId: InvoiceApp.randomId("INV")
    };

    if (!data.student || !data.schedule || !data.sessions || !data.price || !data.date || !data.paymentPhone) {
      return;
    }

    currentData = data;
    currentCanvas = InvoiceApp.drawInvoice(data);
    preview.src = currentCanvas.toDataURL("image/png");

    const paymentUrl = InvoiceApp.buildPaymentUrl(data);
    linkInput.value = paymentUrl;
    document.getElementById("openPayment").href = paymentUrl;

    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("downloadInvoice").addEventListener("click", () => {
    if (!currentCanvas || !currentData) return;
    InvoiceApp.canvasDownload(
      currentCanvas,
      `${currentData.invoiceId}.png`
    );
  });

  document.getElementById("shareInvoice").addEventListener("click", async () => {
    if (!currentCanvas || !currentData) return;
    try {
      await InvoiceApp.shareCanvas(
        currentCanvas,
        `${currentData.invoiceId}.png`,
        "Student Invoice",
        `Invoice for ${currentData.student}`
      );
    } catch (err) {
      if (err.name !== "AbortError") InvoiceApp.toast("Sharing is not available here.");
    }
  });

  document.getElementById("copyLink").addEventListener("click", async () => {
    await InvoiceApp.copyText(linkInput.value);
    InvoiceApp.toast("Payment link copied");
  });
});
