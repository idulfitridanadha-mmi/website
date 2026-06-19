import { getStepStatus, getStepperColorClass, getPaymentBadgeColorClass } from "./tracking";

describe("Tracking UI Utility Helpers", () => {
  describe("getStepStatus", () => {
    it("should return completed for steps equal or prior to current status", () => {
      expect(getStepStatus("MENUNGGU", "MENUNGGU")).toBe("completed");
      expect(getStepStatus("DISEMBELIH", "MENUNGGU")).toBe("completed");
      expect(getStepStatus("DISEMBELIH", "DISEMBELIH")).toBe("completed");
      expect(getStepStatus("DIDISTRIBUSIKAN", "DISEMBELIH")).toBe("completed");
      expect(getStepStatus("DIDISTRIBUSIKAN", "DIDISTRIBUSIKAN")).toBe("completed");
    });

    it("should return active for the step immediately following current status", () => {
      expect(getStepStatus("MENUNGGU", "DISEMBELIH")).toBe("active");
      expect(getStepStatus("DISEMBELIH", "DIDISTRIBUSIKAN")).toBe("active");
    });

    it("should return upcoming for later steps", () => {
      expect(getStepStatus("MENUNGGU", "DIDISTRIBUSIKAN")).toBe("upcoming");
    });

    it("should handle empty status and default to MENUNGGU index", () => {
      expect(getStepStatus("", "MENUNGGU")).toBe("completed");
      expect(getStepStatus("", "DISEMBELIH")).toBe("active");
    });

    it("should handle invalid/unrecognized status (e.g. KABUR) and default to MENUNGGU index", () => {
      expect(getStepStatus("KABUR", "MENUNGGU")).toBe("completed");
      expect(getStepStatus("KABUR", "DISEMBELIH")).toBe("active");
    });
  });

  describe("getStepperColorClass", () => {
    it("should return green classes for completed steps", () => {
      const greenClass = "bg-[#115E38] text-white shadow-md shadow-emerald-900/10";
      expect(getStepperColorClass("MENUNGGU", "MENUNGGU")).toBe(greenClass);
      expect(getStepperColorClass("DISEMBELIH", "DISEMBELIH")).toBe(greenClass);
    });

    it("should return amber pulse classes for active steps", () => {
      const pulseClass = "bg-amber-500 text-white animate-pulse";
      expect(getStepperColorClass("MENUNGGU", "DISEMBELIH")).toBe(pulseClass);
      expect(getStepperColorClass("DISEMBELIH", "DIDISTRIBUSIKAN")).toBe(pulseClass);
    });

    it("should return gray classes for upcoming steps", () => {
      const grayClass = "bg-gray-200 text-gray-400";
      expect(getStepperColorClass("MENUNGGU", "DIDISTRIBUSIKAN")).toBe(grayClass);
    });
  });

  describe("getPaymentBadgeColorClass", () => {
    it("should return green styling for LUNAS", () => {
      const greenStyle = "bg-emerald-100 text-[#115E38] border border-emerald-200";
      expect(getPaymentBadgeColorClass("LUNAS")).toBe(greenStyle);
      expect(getPaymentBadgeColorClass("lunas")).toBe(greenStyle);
    });

    it("should return yellow/amber styling for DP", () => {
      const yellowStyle = "bg-amber-100 text-amber-800 border border-amber-200";
      expect(getPaymentBadgeColorClass("DP")).toBe(yellowStyle);
      expect(getPaymentBadgeColorClass("dp")).toBe(yellowStyle);
    });

    it("should return red styling for BELUM LUNAS and unknown values", () => {
      const redStyle = "bg-red-100 text-red-800 border border-red-200";
      expect(getPaymentBadgeColorClass("BELUM LUNAS")).toBe(redStyle);
      expect(getPaymentBadgeColorClass("belum lunas")).toBe(redStyle);
      expect(getPaymentBadgeColorClass("")).toBe(redStyle);
      expect(getPaymentBadgeColorClass("random")).toBe(redStyle);
    });
  });
});
