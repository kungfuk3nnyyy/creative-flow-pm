import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  orgName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  orgDetail: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: "#c0542e",
  },
  invoiceNumber: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
    color: "#555",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 10,
    color: "#333",
    marginBottom: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 20,
  },
  metaBlock: {},
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f0eb",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  colDescription: {
    flex: 3,
  },
  colQuantity: {
    flex: 1,
    textAlign: "right",
  },
  colUnitPrice: {
    flex: 1,
    textAlign: "right",
  },
  colAmount: {
    flex: 1,
    textAlign: "right",
  },
  headerText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    paddingVertical: 4,
  },
  totalsLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    color: "#555",
  },
  totalsValue: {
    width: 100,
    textAlign: "right",
  },
  totalsBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1a1a1a",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#c0542e",
    marginVertical: 4,
    width: 220,
    alignSelf: "flex-end",
  },
  notes: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#faf8f5",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

export interface InvoicePDFData {
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;

  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;

  orgName: string;
  orgAddress: string | null;
  orgPhone: string | null;
  orgEmail: string | null;
  orgWebsite: string | null;

  lineItems: {
    description: string;
    quantityThousandths: number;
    unitPriceCents: number;
    amountCents: number;
  }[];

  subtotalCents: number;
  taxRateBasisPoints: number;
  taxAmountCents: number;
  totalCents: number;
  balanceDueCents: number;
  notes: string | null;
}

function formatKsh(cents: number): string {
  const major = cents / 100;
  return `Ksh ${major.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatQuantity(thousandths: number): string {
  const value = thousandths / 1000;
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  DUE_ON_RECEIPT: "Due on Receipt",
  NET_15: "Net 15",
  NET_30: "Net 30",
  NET_60: "Net 60",
  MILESTONE: "Milestone-based",
};

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const taxPercent = (data.taxRateBasisPoints / 100).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>{data.orgName}</Text>
            {data.orgAddress && <Text style={styles.orgDetail}>{data.orgAddress}</Text>}
            {data.orgPhone && <Text style={styles.orgDetail}>{data.orgPhone}</Text>}
            {data.orgEmail && <Text style={styles.orgDetail}>{data.orgEmail}</Text>}
            {data.orgWebsite && <Text style={styles.orgDetail}>{data.orgWebsite}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bill To</Text>
          <Text style={styles.clientName}>{data.clientName}</Text>
          {data.clientEmail && <Text style={styles.clientDetail}>{data.clientEmail}</Text>}
          {data.clientAddress && <Text style={styles.clientDetail}>{data.clientAddress}</Text>}
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{formatDate(data.issueDate)}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Payment Terms</Text>
            <Text style={styles.metaValue}>
              {PAYMENT_TERMS_LABELS[data.paymentTerms] ?? data.paymentTerms}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDescription]}>Description</Text>
            <Text style={[styles.headerText, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.headerText, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
          </View>
          {data.lineItems.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{formatQuantity(item.quantityThousandths)}</Text>
              <Text style={styles.colUnitPrice}>{formatKsh(item.unitPriceCents)}</Text>
              <Text style={styles.colAmount}>{formatKsh(item.amountCents)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatKsh(data.subtotalCents)}</Text>
          </View>
          {data.taxRateBasisPoints > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax ({taxPercent}%)</Text>
              <Text style={styles.totalsValue}>{formatKsh(data.taxAmountCents)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, styles.totalsBold]}>Total</Text>
            <Text style={[styles.totalsValue, styles.totalsBold]}>
              {formatKsh(data.totalCents)}
            </Text>
          </View>
          {data.balanceDueCents !== data.totalCents && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Balance Due</Text>
              <Text style={[styles.totalsValue, { fontFamily: "Helvetica-Bold" }]}>
                {formatKsh(data.balanceDueCents)}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Generated by CreativeFlow PM | {data.orgName}</Text>
      </Page>
    </Document>
  );
}
