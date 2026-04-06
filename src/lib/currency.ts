// Currency formatting utilities for Vietnamese Dong

/**
 * Format currency with thousand separators
 * @param amount - Amount to format
 * @param showSymbol - Whether to show ₫ symbol (default: true)
 * @returns Formatted string like "100.000 ₫" or "100.000.000 ₫"
 */
export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  return showSymbol ? `${formatted} ₫` : formatted;
}

/**
 * Format currency in short form
 * @param amount - Amount to format
 * @param showSymbol - Whether to show ₫ symbol (default: true)
 * @returns Formatted string like "100K ₫" or "1.5M ₫" or "1.2B ₫"
 */
export function formatShortCurrency(amount: number, showSymbol: boolean = true): string {
  const absAmount = Math.abs(amount);
  let formatted: string;
  
  if (absAmount >= 1_000_000_000) {
    // Billion (tỷ)
    formatted = `${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    // Million (triệu)
    formatted = `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    // Thousand (nghìn)
    formatted = `${(amount / 1_000).toFixed(0)}K`;
  } else {
    formatted = Math.round(amount).toString();
  }
  
  // Remove trailing .0
  formatted = formatted.replace('.0', '');
  
  return showSymbol ? `${formatted} ₫` : formatted;
}

/**
 * Format compact currency (auto-choose between full and short)
 * @param amount - Amount to format
 * @param threshold - Amount above which to use short format (default: 10M)
 * @param showSymbol - Whether to show ₫ symbol (default: true)
 */
export function formatCompactCurrency(
  amount: number,
  threshold: number = 10_000_000,
  showSymbol: boolean = true
): string {
  if (Math.abs(amount) >= threshold) {
    return formatShortCurrency(amount, showSymbol);
  }
  return formatCurrency(amount, showSymbol);
}

/**
 * Parse Vietnamese formatted currency string to number
 * @param value - String like "100.000" or "100K" or "1.5M"
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and spaces
  const cleaned = value.replace(/[₫\s]/g, '').toUpperCase();
  
  // Handle K, M, B suffixes
  if (cleaned.endsWith('B')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000_000_000;
  }
  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000_000;
  }
  if (cleaned.endsWith('K')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000;
  }
  
  // Remove dot separators and parse
  return parseFloat(cleaned.replace(/\./g, '')) || 0;
}

/**
 * Format currency for input fields
 * @param value - Input value
 * @returns Formatted string for display
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except dots
  const cleaned = value.replace(/[^\d]/g, '');
  if (!cleaned) return '';
  
  // Parse and format
  const num = parseInt(cleaned, 10);
  return new Intl.NumberFormat('vi-VN').format(num);
}
