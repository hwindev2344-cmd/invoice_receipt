document.addEventListener("DOMContentLoaded", () => {
  const data = InvoiceApp.getQueryData();
  const required = ["student", "schedule", "sessions", "price", "date", "paymentPhone", "currency", "invoiceId"];

  if (!required.every(key => data[key])) {
    document.getElementById("invoiceCard").classList.add("hidden");
    document.getElementById("errorCard").classList.remove("hidden");
    return;
  }

  document.getElementById("payTitle").textContent = `Payment for ${data.student}`;
  document.getElementById("payStudent").textContent = data.student;
  document.getElementById("paySchedule").textContent = data.schedule;
  document.getElementById("paySessions").textContent = data.sessions;
  document.getElementById("payDate").textContent = InvoiceApp.formatDate(data.date);
  document.getElementById("payAmount").textContent =
    InvoiceApp.formatMoney(Number(data.sessions) * Number(data.price), data.currency);
  document.getElementById("phoneNumber").textContent = data.paymentPhone;

  let receiptCanvas = null;
  let receiptId = null;

  document.getElementById("copyPhone").addEventListener("click", async () => {
    await InvoiceApp.copyText(data.paymentPhone);
    InvoiceApp.toast("Phone number copied");
  });

  document.getElementById("paidBtn").addEventListener("click",async () => {
    receiptId = InvoiceApp.randomId("PAY");
    data.paidDate = new Date().toISOString().slice(0, 10);
    receiptCanvas = await InvoiceApp.drawReceipt(
        data,
        receiptId,
        receiptImageDataUrl
    );

    document.getElementById("receiptPreview").src = receiptCanvas.toDataURL("image/png");
    document.getElementById("receiptSection").classList.remove("hidden");
    document.getElementById("receiptSection").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("downloadReceipt").addEventListener("click", () => {
    if (!receiptCanvas) return;
    InvoiceApp.canvasDownload(receiptCanvas, `${receiptId}.png`);
  });

  document.getElementById("shareReceipt").addEventListener("click", async () => {
    if (!receiptCanvas) return;
    try {
      await InvoiceApp.shareCanvas(
        receiptCanvas,
        `${receiptId}.png`,
        "Payment Receipt",
        `Payment receipt for ${data.student}`
      );
    } catch (err) {
      if (err.name !== "AbortError") InvoiceApp.toast("Sharing is not available here.");
    }
  });

  document.getElementById("copyReceiptText").addEventListener("click", async () => {
    const total = Number(data.sessions) * Number(data.price);
    const text = [
      "PAYMENT RECEIPT",
      `Student: ${data.student}`,
      `Invoice: ${data.invoiceId}`,
      `Receipt: ${receiptId}`,
      `Date: ${InvoiceApp.formatDate(data.paidDate)}`,
      `Schedule: ${data.schedule}`,
      `Sessions: ${data.sessions}`,
      `Amount: ${InvoiceApp.formatMoney(total, data.currency)}`
    ].join("\n");

    await InvoiceApp.copyText(text);
    InvoiceApp.toast("Receipt details copied");
  });
});

const receiptFile = document.getElementById("receiptFile");

let receiptImageDataUrl = null;

receiptFile.addEventListener("change", () => {
    const file = receiptFile.files[0];

    if (!file) {
        receiptImageDataUrl = null;
        paidBtn.disabled = true;
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        receiptImageDataUrl = reader.result;
        paidBtn.disabled = false;
    };

    reader.readAsDataURL(file);
});