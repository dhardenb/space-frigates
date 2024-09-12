import { Ai } from "./ai.js";

describe("Ai", () => {
  let ai;

  beforeEach(() => {
    ai = new Ai(750); // Assuming 750 is the default mapRadius
  });

  describe("calculateDistanceFromBorder", () => {
    it("should return 0 when the object is at the border", () => {
      const gameObject = { LocationX: 750, LocationY: 0 };
      expect(ai.calculateDistanceFromBorder(gameObject)).toBeCloseTo(0);
    });

    it("should return 750 when the object is at the center", () => {
      const gameObject = { LocationX: 0, LocationY: 0 };
      expect(ai.calculateDistanceFromBorder(gameObject)).toBeCloseTo(750);
    });

    it("should return the correct distance for an object between center and border", () => {
      const gameObject = { LocationX: 300, LocationY: 400 };
      const expectedDistance = 750 - Math.sqrt(300 * 300 + 400 * 400);
      expect(ai.calculateDistanceFromBorder(gameObject)).toBeCloseTo(expectedDistance);
    });

    it("should handle negative coordinates correctly", () => {
      const gameObject = { LocationX: -300, LocationY: -400 };
      const expectedDistance = 750 - Math.sqrt(300 * 300 + 400 * 400);
      expect(ai.calculateDistanceFromBorder(gameObject)).toBeCloseTo(expectedDistance);
    });
  });
});
