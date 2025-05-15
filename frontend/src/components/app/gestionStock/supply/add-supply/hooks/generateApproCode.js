export function generateApproCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `APPRO-${year}-${month}-${day}-${seconds}`;
}
