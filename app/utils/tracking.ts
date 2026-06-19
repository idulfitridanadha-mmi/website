export function getStepStatus(currentStatus: string, step: string): "completed" | "active" | "upcoming" {
  const order = ["MENUNGGU", "DISEMBELIH", "DIDISTRIBUSIKAN"];
  let currentIndex = order.indexOf((currentStatus || "MENUNGGU").toUpperCase());
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  const stepIndex = order.indexOf(step.toUpperCase());

  if (currentIndex >= stepIndex) return "completed";
  if (currentIndex + 1 === stepIndex) return "active";
  return "upcoming";
}

export function getStepperColorClass(currentStatus: string, step: string): string {
  const status = getStepStatus(currentStatus, step);
  if (status === "completed") {
    return "bg-[#115E38] text-white shadow-md shadow-emerald-900/10";
  }
  if (status === "active") {
    return "bg-amber-500 text-white animate-pulse";
  }
  return "bg-gray-200 text-gray-400";
}

export function getPaymentBadgeColorClass(statusBayar: string): string {
  const status = (statusBayar || "").toUpperCase();
  if (status === "LUNAS") {
    return "bg-emerald-100 text-[#115E38] border border-emerald-200";
  }
  if (status === "DP") {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }
  return "bg-red-100 text-red-800 border border-red-200";
}
