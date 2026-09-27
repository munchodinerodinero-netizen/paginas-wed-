import { formatMoney } from "@/shared/money";

export const money = (minor: number, currency: string, intl: string) => `${formatMoney(minor, currency, intl)} ${currency}`;
