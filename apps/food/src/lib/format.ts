const euro = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" });
const integer = new Intl.NumberFormat("en");

export const formatEuro = (amount: number) => euro.format(amount);
export const formatCount = (n: number) => integer.format(n);
