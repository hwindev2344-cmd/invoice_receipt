const InvoiceApp = (() => {
  function formatMoney(value, currency = "MMK") {
    const number = Number(value) || 0;
    return `${number.toLocaleString("en-US")} ${currency}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "—";

    const d = new Date(`${dateString}T00:00:00`);

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(d);
  }

  function monthYear(dateString) {
    if (!dateString) return "";

    const d = new Date(`${dateString}T00:00:00`);

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric"
    }).format(d);
  }

  function randomId(prefix = "INV") {
    const random = Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

    return `${prefix}-${Date.now()
      .toString(36)
      .toUpperCase()}-${random}`;
  }

  function getQueryData() {
    const params = new URLSearchParams(location.search);
    const data = {};

    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    return data;
  }

  function buildPaymentUrl(data) {
    const url = new URL("pay.html", location.href);
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value);
    });

    url.search = params.toString();

    return url.href;
  }

  function canvasDownload(canvas, filename) {
    const link = document.createElement("a");

    link.download = filename;
    link.href = canvas.toDataURL("image/png");

    link.click();
  }

  async function shareCanvas(canvas, filename, title, text) {
    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/png")
    );

    const file = new File([blob], filename, {
      type: "image/png"
    });

    if (
      navigator.share &&
      (!navigator.canShare ||
        navigator.canShare({
          files: [file]
        }))
    ) {
      await navigator.share({
        title,
        text,
        files: [file]
      });

      return true;
    }

    canvasDownload(canvas, filename);

    return false;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement("textarea");

      area.value = text;

      document.body.appendChild(area);

      area.select();

      document.execCommand("copy");

      area.remove();

      return true;
    }
  }

  function toast(message) {
    const old = document.querySelector(".toast");

    if (old) {
      old.remove();
    }

    const el = document.createElement("div");

    el.className = "toast";
    el.textContent = message;

    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      bottom: "22px",
      transform: "translateX(-50%)",
      background: "#111827",
      color: "white",
      padding: "11px 16px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "700",
      zIndex: "9999",
      boxShadow: "0 10px 30px rgba(0,0,0,.2)"
    });

    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1800);
  }

  function setupCanvas(width = 1000, height = 1300) {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.arcTo(
      x + w,
      y,
      x + w,
      y + h,
      radius
    );

    ctx.arcTo(
      x + w,
      y + h,
      x,
      y + h,
      radius
    );

    ctx.arcTo(
      x,
      y + h,
      x,
      y,
      radius
    );

    ctx.arcTo(
      x,
      y,
      x + w,
      y,
      radius
    );

    ctx.closePath();
  }

  // Load uploaded receipt image
  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(
        new Error("Could not load receipt image.")
      );

      img.src = dataUrl;
    });
  }

  // Draw image without stretching it
  function fitImageContain(ctx, img, x, y, w, h) {
    const scale = Math.min(
      w / img.width,
      h / img.height
    );

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const drawX =
      x + (w - drawWidth) / 2;

    const drawY =
      y + (h - drawHeight) / 2;

    // Background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(x, y, w, h);

    ctx.drawImage(
      img,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
  }

  function drawInvoice(data) {
    const canvas = setupCanvas(1000, 1250);
    const ctx = canvas.getContext("2d");

    const total =
      Number(data.sessions) *
      Number(data.price);

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#ffffff";

    roundedRect(
      ctx,
      50,
      50,
      900,
      1150,
      28
    );

    ctx.fill();

    ctx.fillStyle = "#111827";

    roundedRect(
      ctx,
      50,
      50,
      900,
      245,
      28
    );

    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 28px Arial";

    ctx.fillText(
      "STUDENT PAYMENT",
      95,
      105
    );

    ctx.font = "800 54px Arial";

    ctx.fillText(
      "INVOICE",
      95,
      175
    );

    ctx.font = "400 25px Arial";
    ctx.fillStyle = "#d1d5db";

    ctx.fillText(
      monthYear(data.date),
      95,
      230
    );

    ctx.fillStyle = "#6b7280";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "INVOICE DATE",
      95,
      355
    );

    ctx.fillStyle = "#111827";
    ctx.font = "700 28px Arial";

    ctx.fillText(
      formatDate(data.date),
      95,
      395
    );

    ctx.fillStyle = "#6b7280";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "STUDENT",
      580,
      355
    );

    ctx.fillStyle = "#111827";
    ctx.font = "700 28px Arial";

    ctx.fillText(
      data.student,
      580,
      395
    );

    const tableX = 95;
    const tableY = 470;
    const tableW = 810;

    const rows = [
      ["Schedule", data.schedule],
      ["Sessions", String(data.sessions)],
      [
        "Price / Session",
        formatMoney(
          data.price,
          data.currency
        )
      ]
    ];

    ctx.fillStyle = "#f9fafb";

    roundedRect(
      ctx,
      tableX,
      tableY,
      tableW,
      270,
      18
    );

    ctx.fill();

    ctx.fillStyle = "#6b7280";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "DESCRIPTION",
      tableX + 25,
      tableY + 42
    );

    ctx.fillText(
      "DETAIL",
      tableX + 570,
      tableY + 42
    );

    rows.forEach((row, i) => {
      const y =
        tableY +
        92 +
        i * 58;

      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.moveTo(
        tableX + 20,
        y - 26
      );

      ctx.lineTo(
        tableX + tableW - 20,
        y - 26
      );

      ctx.stroke();

      ctx.fillStyle = "#111827";
      ctx.font = "600 23px Arial";

      ctx.fillText(
        row[0],
        tableX + 25,
        y
      );

      ctx.font = "700 23px Arial";

      ctx.fillText(
        row[1],
        tableX + 570,
        y
      );
    });

    ctx.fillStyle = "#111827";

    roundedRect(
      ctx,
      95,
      790,
      810,
      160,
      20
    );

    ctx.fill();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "GRAND TOTAL",
      130,
      840
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 50px Arial";

    ctx.fillText(
      formatMoney(
        total,
        data.currency
      ),
      130,
      900
    );

    ctx.fillStyle = "#9ca3af";
    ctx.font = "400 19px Arial";

    ctx.fillText(
      `Invoice: ${data.invoiceId}`,
      95,
      1030
    );

    ctx.fillText(
      "Use the payment link to view payment instructions.",
      95,
      1070
    );

    ctx.fillStyle = "#6b7280";
    ctx.font = "400 18px Arial";

    ctx.fillText(
      "Generated in browser • No payment is processed by this page.",
      95,
      1140
    );

    return canvas;
  }

  // IMPORTANT:
  // This function is async because it loads the customer's
  // uploaded payment receipt image.
  async function drawReceipt(
    data,
    receiptId,
    receiptImageDataUrl
  ) {
    const canvas = setupCanvas(
      1000,
      1500
    );

    const ctx = canvas.getContext("2d");

    const total =
      Number(data.sessions) *
      Number(data.price);

    // Load uploaded payment receipt
    let proofImage = null;

    if (receiptImageDataUrl) {
      proofImage =
        await loadImageFromDataUrl(
          receiptImageDataUrl
        );
    }

    // Background
    ctx.fillStyle = "#f3f4f6";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Main card
    ctx.fillStyle = "#ffffff";

    roundedRect(
      ctx,
      50,
      50,
      900,
      1400,
      28
    );

    ctx.fill();

    // Header
    ctx.fillStyle = "#111827";

    roundedRect(
      ctx,
      50,
      50,
      900,
      280,
      28
    );

    ctx.fill();

    // Check icon
    ctx.fillStyle = "#dcfce7";

    ctx.beginPath();

    ctx.arc(
      145,
      145,
      48,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#16a34a";
    ctx.font = "800 58px Arial";

    ctx.fillText(
      "✓",
      126,
      166
    );

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 42px Arial";

    ctx.fillText(
      "PAYMENT RECEIPT",
      225,
      145
    );

    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#d1d5db";

    ctx.fillText(
      "Payment submitted",
      225,
      190
    );

    ctx.font = "700 20px Arial";

    ctx.fillText(
      formatDate(data.paidDate),
      225,
      235
    );

    // Student
    ctx.fillStyle = "#6b7280";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "STUDENT",
      95,
      395
    );

    ctx.fillStyle = "#111827";
    ctx.font = "700 30px Arial";

    ctx.fillText(
      data.student,
      95,
      435
    );

    // Payment details
    const lines = [
      ["Schedule", data.schedule],
      ["Sessions", String(data.sessions)],
      [
        "Price / Session",
        formatMoney(
          data.price,
          data.currency
        )
      ],
      ["Invoice", data.invoiceId]
    ];

    let y = 510;

    lines.forEach(([label, value]) => {
      ctx.fillStyle = "#6b7280";
      ctx.font = "600 21px Arial";

      ctx.fillText(
        label,
        95,
        y
      );

      ctx.fillStyle = "#111827";
      ctx.font = "700 21px Arial";

      ctx.fillText(
        value,
        550,
        y
      );

      ctx.strokeStyle = "#e5e7eb";

      ctx.beginPath();

      ctx.moveTo(
        95,
        y + 22
      );

      ctx.lineTo(
        905,
        y + 22
      );

      ctx.stroke();

      y += 72;
    });

    // Amount
    ctx.fillStyle = "#111827";

    roundedRect(
      ctx,
      95,
      850,
      810,
      160,
      20
    );

    ctx.fill();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "700 20px Arial";

    ctx.fillText(
      "AMOUNT PAID / SUBMITTED",
      130,
      900
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 48px Arial";

    ctx.fillText(
      formatMoney(
        total,
        data.currency
      ),
      130,
      960
    );

    // ==========================================
    // UPLOADED PAYMENT PROOF
    // ==========================================

    ctx.fillStyle = "#111827";
    ctx.font = "800 22px Arial";

    ctx.fillText(
      "UPLOADED PAYMENT PROOF",
      95,
      1055
    );

    const imageX = 95;
    const imageY = 1080;
    const imageW = 810;
    const imageH = 250;

    // Image container
    ctx.save();

    roundedRect(
      ctx,
      imageX,
      imageY,
      imageW,
      imageH,
      18
    );

    ctx.clip();

    if (proofImage) {
      fitImageContain(
        ctx,
        proofImage,
        imageX,
        imageY,
        imageW,
        imageH
      );
    } else {
      ctx.fillStyle = "#f3f4f6";

      ctx.fillRect(
        imageX,
        imageY,
        imageW,
        imageH
      );

      ctx.fillStyle = "#6b7280";
      ctx.font = "500 20px Arial";

      ctx.fillText(
        "No payment proof uploaded",
        imageX + 250,
        imageY + 135
      );
    }

    ctx.restore();

    // Image border
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;

    roundedRect(
      ctx,
      imageX,
      imageY,
      imageW,
      imageH,
      18
    );

    ctx.stroke();

    // Footer
    ctx.fillStyle = "#6b7280";
    ctx.font = "400 18px Arial";

    ctx.fillText(
      `Receipt: ${receiptId}`,
      95,
      1370
    );

    ctx.fillText(
      "Please send this receipt to the seller after making payment.",
      95,
      1405
    );

    ctx.fillText(
      "This receipt is a payment submission record, not bank confirmation.",
      95,
      1435
    );

    return canvas;
  }

  return {
    formatMoney,
    formatDate,
    monthYear,
    randomId,
    getQueryData,
    buildPaymentUrl,
    canvasDownload,
    shareCanvas,
    copyText,
    toast,
    drawInvoice,
    drawReceipt
  };
})();