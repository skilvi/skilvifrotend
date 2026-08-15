import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Image, pdf
} from '@react-pdf/renderer';

interface CertPDFProps {
  studentName: string;
  certId: string;
  role: string;
  courseName: string;
  orgName: string;
  startDate: Date | string;
  endDate: Date | string;
  qrCodeUrl?: string;
  college?: string;
  department?: string;
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    borderWidth: 3,
    borderColor: "#ea580c",
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#ea580c",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerQr: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  headerCertId: {
    fontSize: 6,
    color: "#6b7280",
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  orgBlock: {
    flexDirection: "column",
  },
  orgName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ea580c",
    letterSpacing: 1.5,
  },
  orgTagline: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // ── Main title ─────────────────────────────────────────────────────────────
  certTitleRow: {
    alignItems: "center",
    marginBottom: 8,
  },
  certLabel: {
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  certTitle: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 4,
    letterSpacing: 1,
  },
  certSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 6,
    letterSpacing: 2,
  },

  // ── Recipient ──────────────────────────────────────────────────────────────
  recipientName: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: "#ea580c",
    textAlign: "center",
    marginBottom: 10,
  },

  // ── Body text ──────────────────────────────────────────────────────────────
  bodyText: {
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  highlight: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },

  // ── Info grid ─────────────────────────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 8,
    color: "#9ca3af",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },

  // ── Signatures ─────────────────────────────────────────────────────────────
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  signatureBox: {
    alignItems: "center",
    width: "40%",
  },
  signatureSpace: {
    height: 36,
    marginBottom: 4,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    width: "100%",
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
  },
});

export const CertificateDocument: React.FC<CertPDFProps> = (props) => {
  const orgName = props.orgName || "EmberQuest";
  const courseName = props.courseName || "";
  const role = props.role || "Learner";
  
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  const formattedStartDate = start.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedEndDate = end.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Approximate duration in months
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) months = 1;

  // Since React-PDF needs a fully qualified URL sometimes to fetch successfully
  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : "http://localhost:3050/logo.png";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* ── Top bar: logo + org ───────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.headerLeft}>
            <Image src={logoUrl} style={styles.logo} />
            <View style={styles.orgBlock}>
              <Text style={styles.orgName}>{orgName.toUpperCase()} SOFTWARE COMPANY</Text>
              <Text style={styles.orgTagline}>Achieving Excellence Together</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {props.qrCodeUrl && (
              <Image src={props.qrCodeUrl} style={styles.headerQr} />
            )}
            <Text style={styles.headerCertId}>ID: {props.certId}</Text>
          </View>
        </View>

        {/* ── Certificate Title ─────────────────────────────────────────── */}
        <View style={styles.certTitleRow}>
          <Text style={styles.certLabel}>— OFFICIAL —</Text>
          <Text style={styles.certTitle}>Certificate of Completion</Text>
          <Text style={styles.certSubtitle}>This certificate is proudly presented to</Text>
        </View>

        {/* ── Recipient Name ────────────────────────────────────────────── */}
        <Text style={styles.recipientName}>{props.studentName}</Text>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <Text style={styles.bodyText}>
          {"has successfully completed the programme as "}
          <Text style={styles.highlight}>{role}</Text>
          {courseName ? ` in the ${courseName} programme` : ""}
          {" at "}<Text style={styles.highlight}>{orgName}</Text>
          {` for a duration of ${months} month${months > 1 ? "s" : ""},`}
          {" demonstrating exceptional dedication and professional excellence."}
        </Text>

        {/* ── Info Grid ─────────────────────────────────────────────────── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{" "}</Text>
            <Text style={styles.infoValue}>{courseName || role}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{months} Month{months > 1 ? "s" : ""}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>From</Text>
            <Text style={styles.infoValue}>{formattedStartDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>To</Text>
            <Text style={styles.infoValue}>{formattedEndDate}</Text>
          </View>
        </View>

        {/* ── Signatures ────────────────────────────────────────────────── */}
        <View style={styles.signaturesRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Adarsh babu M</Text>
            <Text style={styles.signatureTitle}>CEO, {orgName}</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureSpace} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Sameer</Text>
            <Text style={styles.signatureTitle}>Manager, {orgName}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export async function downloadCertificatePDF(props: CertPDFProps) {
  const blob = await pdf(<CertificateDocument {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Certificate-${props.studentName.replace(/\s+/g, '-')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
