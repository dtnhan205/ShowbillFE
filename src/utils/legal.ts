export const PLATFORM_DISCLAIMER =
  'Nền tảng không môi giới, không giữ tiền, không xử lý tranh chấp giao dịch giữa người dùng.';

export const UPGRADE_DISCLAIMER =
  'Nâng cấp gói chỉ mở rộng tính năng, không phải chứng nhận uy tín hay bảo lãnh giao dịch.';

export const IMAGE_PROTECTION_TOOLTIP =
  'Chặn copy/screenshot chỉ ở mức giao diện, không bảo vệ tuyệt đối.';

/**
 * Mask common sensitive patterns in text:
 * - phone-like numbers (10–11 digits)
 * - bank account / long digit sequences (>= 8 digits)
 * - emails
 * Notes: "tên thật" is not reliably detectable; this function focuses on high-risk patterns.
 */
export function maskSensitiveText(input: string): string {
  if (!input) return input;

  let text = String(input);

  // Mask email: a***@b***.com
  text = text.replace(
    /\b([A-Z0-9._%+-]{1,64})@([A-Z0-9.-]{1,255}\.[A-Z]{2,24})\b/gi,
    (_m, local: string, domain: string) => {
      const l = local.length <= 2 ? `${local[0] ?? ''}*` : `${local.slice(0, 2)}***`;
      const dParts = String(domain).split('.');
      const d0 = dParts[0] ?? '';
      const dMasked = d0.length <= 1 ? `${d0}*` : `${d0[0]}***`;
      const rest = dParts.slice(1).join('.');
      return `${l}@${dMasked}.${rest || '***'}`;
    },
  );

  // Mask phone-like sequences (VN often 10 digits; allow 10–11)
  text = text.replace(/\b(0?\d{9,10})\b/g, (m) => maskDigits(m));

  // Mask long digit sequences (bank account / transaction codes) >= 8 digits
  text = text.replace(/\b(\d{8,})\b/g, (m) => maskDigits(m));

  // Mask common patterns: "STK: 1234..." or "SĐT 09..."
  text = text.replace(
    /\b((?:stk|số\s*tài\s*khoản|sd?t|số\s*điện\s*thoại|mã\s*giao\s*dịch)\s*[:\-]?\s*)([A-Z0-9]{6,})\b/gi,
    (_m, prefix: string, value: string) => `${prefix}${maskAlphaNum(value)}`,
  );

  return text;
}

function maskDigits(value: string): string {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length || 1);
  const head = digits.slice(0, 2);
  const tail = digits.slice(-2);
  return `${head}${'*'.repeat(Math.max(0, digits.length - 4))}${tail}`;
}

function maskAlphaNum(value: string): string {
  const v = String(value);
  if (v.length <= 4) return '*'.repeat(v.length || 1);
  return `${v.slice(0, 2)}${'*'.repeat(v.length - 4)}${v.slice(-2)}`;
}


