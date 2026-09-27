// Filtro de información sensible en el chat.
// - Bloquea números de tarjeta (validación Luhn): nunca deben viajar por el chat.
// - Oculta teléfonos, emails y CLABE/cuentas: evita exponer datos privados y
//   que los pagos se saquen de la plataforma (protección antifraude).

export interface FilterResult {
  blocked: boolean;
  reason?: "CARD_NUMBER";
  body: string;
  redacted: boolean;
}

function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

const CARD_CANDIDATE = /(?:\d[ -]?){13,19}/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const CLABE = /\b\d{18}\b/g;
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)\d{3,4}[\s.-]?\d{4}\b/g;

export function filterMessage(input: string): FilterResult {
  const body = input.trim();
  for (const match of body.match(CARD_CANDIDATE) ?? []) {
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) {
      return { blocked: true, reason: "CARD_NUMBER", body: "", redacted: false };
    }
  }
  let out = body.replace(EMAIL, "[•••]").replace(CLABE, "[•••]").replace(PHONE, "[•••]");
  return { blocked: false, body: out, redacted: out !== body };
}
