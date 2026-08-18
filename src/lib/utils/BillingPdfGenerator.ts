import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BILLING_CONFIG } from '../config/billingConfig';
import { Purchase } from '../api/purchases';

const SKILVI_LOGO_URL = '/api/billing/logo';

type RGB = [number, number, number];

export class BillingPdfGenerator {
  /**
   * Main entry point.
   *
   * Client-side only:
   * Order data -> PDF generated in browser -> download
   */
  static async generateBill(
    purchase: Purchase,
    customerName: string,
    customerEmail: string
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const cfg = BILLING_CONFIG;
    const seller = cfg.business;
    const labels = cfg.labels;

    // ============================================================
    // PAGE / GRID
    // ============================================================

    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();

    const MARGIN_X = 16;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

    const FOOTER_HEIGHT = 18;
    const CONTENT_BOTTOM = PAGE_HEIGHT - FOOTER_HEIGHT;

    // ============================================================
    // SKILVI VISUAL SYSTEM
    // ============================================================

    const COLORS: Record<string, RGB> = {
      ink: [15, 23, 42],
      navy: [18, 32, 59],
      blue: [45, 93, 190],
      blueSoft: [239, 246, 255],
      ember: [232, 91, 48],
      text: [45, 55, 72],
      muted: [100, 116, 139],
      lightMuted: [148, 163, 184],
      line: [226, 232, 240],
      panel: [248, 250, 252],
      white: [255, 255, 255],
      success: [22, 163, 74],
      successSoft: [240, 253, 244],
      warning: [217, 119, 6],
      danger: [220, 38, 38],
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const safeText = (
      value: unknown,
      fallback = '—'
    ): string => {
      if (value === null || value === undefined) {
        return fallback;
      }

      const str = String(value).trim();

      return str.length ? str : fallback;
    };

    const cleanOrderId = safeText(purchase.orderId);

    const formatCurrency = (value: number): string => {
      const amount = Number(value || 0);

      /**
       * IMPORTANT:
       * jsPDF Helvetica often does not render ₹ correctly.
       *
       * We therefore use "INR" inside the PDF by default unless
       * your project loads a Unicode font.
       *
       * This avoids the broken glyph seen in the current PDF.
       */
      return `INR ${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const formatDate = (value: string | Date): string => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return '—';
      }

      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const truncateMiddle = (
      value: string,
      maxLength: number
    ) => {
      if (value.length <= maxLength) {
        return value;
      }

      const left = Math.ceil(maxLength / 2);
      const right = Math.floor(maxLength / 2);

      return `${value.slice(0, left)}...${value.slice(-right)}`;
    };

    const drawText = (
      text: string,
      x: number,
      y: number,
      options: {
        size?: number;
        color?: RGB;
        bold?: boolean;
        align?: 'left' | 'center' | 'right';
        maxWidth?: number;
      } = {}
    ) => {
      doc.setFont(
        'helvetica',
        options.bold === false ? 'normal' : 'bold'
      );

      doc.setFontSize(options.size ?? 9);
      doc.setTextColor(...(options.color ?? COLORS.text));

      doc.text(text, x, y, {
        align: options.align ?? 'left',
        maxWidth: options.maxWidth,
      });
    };

    const drawLabel = (
      text: string,
      x: number,
      y: number,
      align: 'left' | 'right' = 'left'
    ) => {
      drawText(
        text.toUpperCase(),
        x,
        y,
        {
          size: 7,
          color: COLORS.muted,
          bold: true,
          align,
        }
      );
    };

    const drawPanel = (
      x: number,
      y: number,
      width: number,
      height: number,
      fill: RGB = COLORS.white,
      border: RGB = COLORS.line
    ) => {
      doc.setFillColor(...fill);
      doc.setDrawColor(...border);

      doc.roundedRect(
        x,
        y,
        width,
        height,
        3,
        3,
        'FD'
      );
    };

    const drawDivider = (
      y: number,
      x1 = MARGIN_X,
      x2 = PAGE_WIDTH - MARGIN_X
    ) => {
      doc.setDrawColor(...COLORS.line);
      doc.setLineWidth(0.25);
      doc.line(x1, y, x2, y);
    };

    const getStatusColor = (status: string): RGB => {
      const normalized = status.toLowerCase();

      if (
        normalized.includes('paid') ||
        normalized.includes('success') ||
        normalized.includes('completed')
      ) {
        return COLORS.success;
      }

      if (
        normalized.includes('pending') ||
        normalized.includes('processing')
      ) {
        return COLORS.warning;
      }

      if (
        normalized.includes('failed') ||
        normalized.includes('cancel') ||
        normalized.includes('refund')
      ) {
        return COLORS.danger;
      }

      return COLORS.muted;
    };

    // ============================================================
    // LOGO
    // ============================================================

    const loadLogo = async (): Promise<string | null> => {
      try {
        const response = await fetch(SKILVI_LOGO_URL, {
          // Changed to 'same-origin' as we are using the proxy route, to avoid cors issues.
          mode: 'same-origin',
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(
            `Logo request failed: ${response.status}`
          );
        }

        const svgText = await response.text();

        /**
         * Convert SVG into a data URL, then into a PNG so that
         * jsPDF can reliably embed it.
         */
        const svgBlob = new Blob(
          [svgText],
          { type: 'image/svg+xml' }
        );

        const blobUrl = URL.createObjectURL(svgBlob);

        try {
          const image = await new Promise<HTMLImageElement>(
            (resolve, reject) => {
              const img = new Image();

              img.onload = () => resolve(img);

              img.onerror = () =>
                reject(
                  new Error('Unable to decode Skilvi logo')
                );

              img.src = blobUrl;
            }
          );

          const canvas = document.createElement('canvas');

          const logoWidth = 900;
          const logoHeight =
            Math.max(
              1,
              Math.round(
                (image.height / image.width) * logoWidth
              )
            );

          canvas.width = logoWidth;
          canvas.height = logoHeight;

          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error(
              'Unable to create logo rendering context'
            );
          }

          context.clearRect(
            0,
            0,
            logoWidth,
            logoHeight
          );

          context.drawImage(
            image,
            0,
            0,
            logoWidth,
            logoHeight
          );

          return canvas.toDataURL(
            'image/png',
            1
          );
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      } catch (error) {
        console.warn(
          '[Skilvi PDF] Logo could not be loaded:',
          error
        );

        return null;
      }
    };

    const logoDataUrl = await loadLogo();

    // ============================================================
    // DATA
    // ============================================================

    const orderId = cleanOrderId;

    const invoiceNo = `SKV-${orderId
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12)
      .toUpperCase()}`;

    const courseTitle = safeText(
      purchase.courseTitle,
      'Skilvi Learning Program'
    );

    const paymentStatus = safeText(
      purchase.paymentStatus,
      'PAID'
    );

    const paymentMethod = safeText(
      purchase.paymentMethod,
      'Online Payment'
    );

    const total = Number(
      purchase.amount || 0
    );

    // ============================================================
    // TAX
    // ============================================================

    let taxableAmount = total;
    let cgst = 0;
    let sgst = 0;

    if (
      cfg.tax.enabled &&
      total > 0
    ) {
      const totalTaxRate =
        (
          cfg.tax.cgstPercent +
          cfg.tax.sgstPercent
        ) / 100;

      if (cfg.tax.isInclusive) {
        taxableAmount =
          total / (1 + totalTaxRate);
      }

      cgst =
        taxableAmount *
        (cfg.tax.cgstPercent / 100);

      sgst =
        taxableAmount *
        (cfg.tax.sgstPercent / 100);
    }

    const subtotal = taxableAmount;

    // ============================================================
    // PAGE BACKGROUND
    // ============================================================

    doc.setFillColor(...COLORS.white);

    doc.rect(
      0,
      0,
      PAGE_WIDTH,
      PAGE_HEIGHT,
      'F'
    );

    // ============================================================
    // TOP BRAND BAR
    // ============================================================

    doc.setFillColor(...COLORS.navy);

    doc.rect(
      0,
      0,
      PAGE_WIDTH,
      3.5,
      'F'
    );

    doc.setFillColor(...COLORS.ember);

    doc.rect(
      0,
      3.5,
      PAGE_WIDTH,
      1.1,
      'F'
    );

    // ============================================================
    // HEADER
    // ============================================================

    let headerY = 14;

    if (logoDataUrl) {
      try {
        /**
         * Width is intentionally fixed.
         * Height is proportional so the actual logo never gets
         * visually stretched.
         */
        const logoWidth = 34;
        const logoHeight = 10;

        doc.addImage(
          logoDataUrl,
          'PNG',
          MARGIN_X,
          headerY - 5,
          logoWidth,
          logoHeight,
          undefined,
          'FAST'
        );
      } catch {
        drawText(
          'Skilvi',
          MARGIN_X,
          headerY + 1,
          {
            size: 17,
            color: COLORS.navy,
            bold: true,
          }
        );
      }
    } else {
      drawText(
        'Skilvi',
        MARGIN_X,
        headerY + 1,
        {
          size: 17,
          color: COLORS.navy,
          bold: true,
        }
      );
    }

    drawText(
      'Learning • Skills • Growth',
      PAGE_WIDTH - MARGIN_X,
      headerY,
      {
        size: 7.5,
        color: COLORS.muted,
        bold: false,
        align: 'right',
      }
    );

    // ============================================================
    // INVOICE TITLE ROW
    // ============================================================

    const titleY = 30;

    drawText(
      labels.invoiceTitle || 'PURCHASE INVOICE',
      PAGE_WIDTH - MARGIN_X,
      titleY,
      {
        size: 19,
        color: COLORS.navy,
        bold: true,
        align: 'right',
      }
    );

    drawText(
      invoiceNo,
      PAGE_WIDTH - MARGIN_X,
      titleY + 7,
      {
        size: 8,
        color: COLORS.blue,
        bold: true,
        align: 'right',
      }
    );

    drawText(
      'Computer-generated purchase document',
      PAGE_WIDTH - MARGIN_X,
      titleY + 13,
      {
        size: 7,
        color: COLORS.lightMuted,
        bold: false,
        align: 'right',
      }
    );

    // ============================================================
    // SELLER INFORMATION
    // ============================================================

    const sellerY = 44;
    
    const address = safeText(
      seller.address,
      'Business address not configured'
    );

    const addressLines = doc.splitTextToSize(
      address,
      85
    );

    const sellerHeight = Math.max(28, 16 + addressLines.length * 3.5);

    drawPanel(
      MARGIN_X,
      sellerY,
      CONTENT_WIDTH,
      sellerHeight,
      COLORS.panel,
      COLORS.panel
    );

    // Brand accent
    doc.setFillColor(...COLORS.blue);

    doc.roundedRect(
      MARGIN_X,
      sellerY,
      2.2,
      sellerHeight,
      1,
      1,
      'F'
    );

    drawText(
      safeText(
        seller.legalName,
        seller.name
      ),
      MARGIN_X + 9,
      sellerY + 9,
      {
        size: 9.5,
        color: COLORS.navy,
        bold: true,
      }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);

    doc.text(
      addressLines,
      MARGIN_X + 9,
      sellerY + 14
    );

    // Contact block

    const contactX =
      PAGE_WIDTH / 2 + 18;

    drawLabel(
      'Contact',
      contactX,
      sellerY + 8
    );

    drawText(
      safeText(seller.email),
      contactX,
      sellerY + 14,
      {
        size: 8,
        color: COLORS.text,
        bold: false,
      }
    );

    if ((seller as any).gstin) {
      drawText(
        `GSTIN  ${(seller as any).gstin}`,
        contactX,
        sellerY + 20,
        {
          size: 7.5,
          color: COLORS.muted,
          bold: false,
        }
      );
    }

    // ============================================================
    // BILL TO / ORDER DETAILS
    // ============================================================

    const detailsY = sellerY + sellerHeight + 4;
    const detailsHeight = 52;
    const gap = 6;
    const columnWidth =
      (CONTENT_WIDTH - gap) / 2;

    // --------------------------------
    // BILL TO
    // --------------------------------

    drawPanel(
      MARGIN_X,
      detailsY,
      columnWidth,
      detailsHeight
    );

    drawLabel(
      labels.billTo || 'Bill To',
      MARGIN_X + 8,
      detailsY + 9
    );

    drawText(
      safeText(customerName, 'Customer'),
      MARGIN_X + 8,
      detailsY + 19,
      {
        size: 11,
        color: COLORS.navy,
        bold: true,
      }
    );

    drawText(
      safeText(customerEmail),
      MARGIN_X + 8,
      detailsY + 26,
      {
        size: 8,
        color: COLORS.muted,
        bold: false,
        maxWidth: columnWidth - 16,
      }
    );

    // --------------------------------
    // ORDER DETAILS
    // --------------------------------

    const orderX =
      MARGIN_X +
      columnWidth +
      gap;

    drawPanel(
      orderX,
      detailsY,
      columnWidth,
      detailsHeight
    );

    drawLabel(
      'Order Details',
      orderX + 8,
      detailsY + 9
    );

    // Row 1
    drawLabel(
      labels.orderId || 'Order ID',
      orderX + 8,
      detailsY + 14
    );

    drawText(
      truncateMiddle(orderId, 21),
      orderX + 8,
      detailsY + 20,
      {
        size: 7.6,
        color: COLORS.navy,
        bold: true,
        maxWidth: 61,
      }
    );

    drawLabel(
      labels.orderDate || 'Order Date',
      orderX + columnWidth - 8,
      detailsY + 14,
      'right'
    );

    drawText(
      formatDate(purchase.purchaseDate),
      orderX + columnWidth - 8,
      detailsY + 20,
      {
        size: 7.8,
        color: COLORS.text,
        bold: false,
        align: 'right',
      }
    );

    // Row 2
    drawLabel(
      labels.paymentMethod || 'Payment Method',
      orderX + 8,
      detailsY + 28
    );

    drawText(
      paymentMethod,
      orderX + 8,
      detailsY + 34,
      {
        size: 7.8,
        color: COLORS.text,
        bold: false,
      }
    );

    drawLabel(
      labels.paymentStatus || 'Payment Status',
      orderX + columnWidth - 8,
      detailsY + 28,
      'right'
    );

    const statusColor =
      getStatusColor(paymentStatus);

    const statusWidth = 22;
    const statusHeight = 6;

    const statusX =
      orderX +
      columnWidth -
      8 -
      statusWidth;

    const statusY =
      detailsY + 30;

    doc.setFillColor(...statusColor);

    doc.roundedRect(
      statusX,
      statusY,
      statusWidth,
      statusHeight,
      2,
      2,
      'F'
    );

    drawText(
      paymentStatus.toUpperCase(),
      statusX + statusWidth / 2,
      statusY + 4.2,
      {
        size: 5.8,
        color: COLORS.white,
        bold: true,
        align: 'center',
      }
    );

    // Row 3 (Transaction ID)
    drawLabel(
      labels.transactionId || 'Transaction ID',
      orderX + 8,
      detailsY + 42
    );

    drawText(
      purchase.paymentRef ? truncateMiddle(purchase.paymentRef, 35) : 'N/A',
      orderX + 8,
      detailsY + 48,
      {
        size: 7.6,
        color: COLORS.navy,
        bold: true,
        maxWidth: columnWidth - 16,
      }
    );

    // ============================================================
    // PURCHASE SUMMARY HEADING
    // ============================================================

    const summaryHeadingY =
      detailsY + detailsHeight + 6;

    drawText(
      'Purchase Summary',
      MARGIN_X,
      summaryHeadingY,
      {
        size: 12,
        color: COLORS.navy,
        bold: true,
      }
    );

    drawText(
      'Details of the learning product included in this purchase.',
      MARGIN_X,
      summaryHeadingY + 5,
      {
        size: 7.5,
        color: COLORS.muted,
        bold: false,
      }
    );

    // ============================================================
    // PURCHASE TABLE
    // ============================================================

    const tableY =
      summaryHeadingY + 12;

    autoTable(doc, {
      startY: tableY,

      margin: {
        left: MARGIN_X,
        right: MARGIN_X,
      },

      tableWidth: CONTENT_WIDTH,

      head: [[
        'ITEM',
        'QTY',
        'UNIT PRICE',
        'DISCOUNT',
        'AMOUNT',
      ]],

      body: [[
        courseTitle,
        '1',
        formatCurrency(subtotal),
        formatCurrency(0),
        formatCurrency(subtotal),
      ]],

      theme: 'plain',

      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: COLORS.text,
        lineColor: COLORS.line,
        lineWidth: 0.2,
        cellPadding: {
          top: 5.5,
          bottom: 5.5,
          left: 4,
          right: 4,
        },
        valign: 'middle',
        overflow: 'linebreak',
      },

      headStyles: {
        fillColor: COLORS.navy,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 7.2,
        cellPadding: {
          top: 4.8,
          bottom: 4.8,
          left: 4,
          right: 4,
        },
      },

      bodyStyles: {
        fillColor: COLORS.white,
      },

      alternateRowStyles: {
        fillColor: COLORS.panel,
      },

      columnStyles: {
        0: {
          cellWidth: 83,
          halign: 'left',
        },
        1: {
          cellWidth: 14,
          halign: 'center',
          overflow: 'visible',
        },
        2: {
          cellWidth: 30,
          halign: 'right',
          overflow: 'visible',
        },
        3: {
          cellWidth: 29,
          halign: 'right',
          overflow: 'visible',
        },
        4: {
          cellWidth: 29,
          halign: 'right',
          fontStyle: 'bold',
          overflow: 'visible',
        },
      },

      didDrawCell: (data) => {
        if (
          data.section === 'body' &&
          data.column.index === 0
        ) {
          doc.setFillColor(...COLORS.blue);

          doc.rect(
            data.cell.x,
            data.cell.y,
            1.2,
            data.cell.height,
            'F'
          );
        }
      },
    });

    let yPos =
      (doc as any).lastAutoTable.finalY + 6;

    // ============================================================
    // TOTALS
    // ============================================================

    const totalsWidth = 88;
    const totalsX =
      PAGE_WIDTH -
      MARGIN_X -
      totalsWidth;

    const totalsHeight =
      cfg.tax.enabled ? 48 : 34;

    drawPanel(
      totalsX,
      yPos,
      totalsWidth,
      totalsHeight,
      COLORS.panel,
      COLORS.panel
    );

    const totalLabelX =
      totalsX + 8;

    const totalValueX =
      PAGE_WIDTH - MARGIN_X - 8;

    let totalsY =
      yPos + 10;

    drawText(
      'Subtotal',
      totalLabelX,
      totalsY,
      {
        size: 8,
        color: COLORS.text,
        bold: false,
      }
    );

    drawText(
      formatCurrency(subtotal),
      totalValueX,
      totalsY,
      {
        size: 8,
        color: COLORS.text,
        bold: false,
        align: 'right',
      }
    );

    totalsY += 7;

    if (cfg.tax.enabled) {
      drawText(
        labels.taxableAmount || 'Taxable Amount',
        totalLabelX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
        }
      );

      drawText(
        formatCurrency(taxableAmount),
        totalValueX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
          align: 'right',
        }
      );

      totalsY += 7;

      drawText(
        `CGST (${cfg.tax.cgstPercent}%)`,
        totalLabelX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
        }
      );

      drawText(
        formatCurrency(cgst),
        totalValueX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
          align: 'right',
        }
      );

      totalsY += 7;

      drawText(
        `SGST (${cfg.tax.sgstPercent}%)`,
        totalLabelX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
        }
      );

      drawText(
        formatCurrency(sgst),
        totalValueX,
        totalsY,
        {
          size: 8,
          color: COLORS.text,
          bold: false,
          align: 'right',
        }
      );

      totalsY += 8;
    } else {
      totalsY += 8;
    }

    drawDivider(
      totalsY,
      totalLabelX,
      totalValueX
    );

    totalsY += 9;

    drawText(
      labels.grandTotal || 'Total Paid',
      totalLabelX,
      totalsY,
      {
        size: 10.5,
        color: COLORS.navy,
        bold: true,
      }
    );

    drawText(
      formatCurrency(total),
      totalValueX,
      totalsY,
      {
        size: 11,
        color: COLORS.blue,
        bold: true,
        align: 'right',
      }
    );

    // ============================================================
    // PAYMENT CONFIRMATION
    // ============================================================

    const paymentY =
      yPos +
      totalsHeight +
      5;

    drawPanel(
      MARGIN_X,
      paymentY,
      CONTENT_WIDTH,
      19,
      COLORS.successSoft,
      COLORS.successSoft
    );

    // Status circle
    doc.setFillColor(...COLORS.success);

    doc.circle(
      MARGIN_X + 9,
      paymentY + 9.5,
      4,
      'F'
    );

    drawText(
      '✓',
      MARGIN_X + 9,
      paymentY + 11.2,
      {
        size: 7,
        color: COLORS.white,
        bold: true,
        align: 'center',
      }
    );

    drawText(
      'Payment recorded successfully',
      MARGIN_X + 18,
      paymentY + 8,
      {
        size: 8.5,
        color: COLORS.navy,
        bold: true,
      }
    );

    drawText(
      `Payment method: ${paymentMethod}`,
      MARGIN_X + 18,
      paymentY + 13.5,
      {
        size: 7.3,
        color: COLORS.muted,
        bold: false,
      }
    );

    // ============================================================
    // NOTES
    // ============================================================

    let notesY =
      paymentY + 24;

    // If notes block would overlap the footer, start a new page
    if (notesY + 20 > PAGE_HEIGHT - FOOTER_HEIGHT) {
      doc.addPage();
      
      // Top brand bar
      doc.setFillColor(...COLORS.navy);
      doc.rect(0, 0, PAGE_WIDTH, 3.5, 'F');
      doc.setFillColor(...COLORS.ember);
      doc.rect(0, 3.5, PAGE_WIDTH, 1.1, 'F');
      
      notesY = 20;
    }

    drawText(
      'Payment & Purchase Note',
      MARGIN_X,
      notesY,
      {
        size: 8.5,
        color: COLORS.navy,
        bold: true,
      }
    );

    const notes = 'Payment and course purchases are processed through Skilvi. This invoice is generated electronically from the corresponding Skilvi transaction records.';

    const notesLines = doc.splitTextToSize(
      notes,
      CONTENT_WIDTH
    );

    doc.text(
      notesLines,
      MARGIN_X,
      notesY + 6
    );

    // ============================================================
    // FIXED FOOTERS
    // ============================================================

    const totalPages = (doc.internal as any).getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      const footerY = PAGE_HEIGHT - 10;

      // Draw the divider line slightly higher so it doesn't intersect the logo
      drawDivider(PAGE_HEIGHT - FOOTER_HEIGHT - 1);

      if (logoDataUrl) {
        try {
          doc.addImage(
            logoDataUrl,
            'PNG',
            MARGIN_X,
            footerY - 5,
            24,
            7.2,
            undefined,
            'FAST'
          );
        } catch {
          drawText('SKILVI', MARGIN_X, footerY, { size: 8, color: COLORS.navy, bold: true });
        }
      } else {
        drawText('SKILVI', MARGIN_X, footerY, { size: 8, color: COLORS.navy, bold: true });
      }

      drawText(
        seller.website || 'https://www.skilvi.in',
        PAGE_WIDTH / 2,
        footerY,
        { size: 7, color: COLORS.muted, bold: false, align: 'center' }
      );

      drawText(
        `Page ${i} of ${totalPages}`,
        PAGE_WIDTH - MARGIN_X,
        footerY,
        { size: 7, color: COLORS.lightMuted, bold: false, align: 'right' }
      );
    }

    // ============================================================
    // DOWNLOAD
    // ============================================================

    const safeFilename = orderId
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .slice(0, 24);

    doc.save(
      `Skilvi_Invoice_${safeFilename || 'Purchase'}.pdf`
    );
  }
}