import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus, PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getOrderStatusInfo(status: OrderStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case "pending_payment":
      return {
        label: "Menunggu Pembayaran",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "paid":
      return {
        label: "Sudah Dibayar",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    case "processing":
      return {
        label: "Sedang Diproses",
        bg: "bg-blue-50",
        text: "text-polsri-700",
        border: "border-polsri-200",
      };
    case "shipped":
      return {
        label: "Sedang Dikirim",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "completed":
      return {
        label: "Selesai",
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    default:
      return {
        label: status,
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
      };
  }
}

export function getPaymentStatusInfo(status: PaymentStatus): { label: string; color: string } {
  switch (status) {
    case "paid":
      return { label: "Lunas", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    case "unpaid":
      return { label: "Belum Bayar", color: "text-amber-600 bg-amber-50 border-amber-200" };
    case "expired":
      return { label: "Kedaluwarsa", color: "text-slate-500 bg-slate-50 border-slate-200" };
    case "failed":
      return { label: "Gagal", color: "text-red-600 bg-red-50 border-red-200" };
    default:
      return { label: status, color: "text-slate-600 bg-slate-50 border-slate-200" };
  }
}
