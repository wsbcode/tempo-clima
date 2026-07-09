const FULL_CIRCLE_DEGREES = 360;

export function toWindCardinal(degrees: number): "N" | "NE" | "E" | "SE" | "S" | "SO" | "O" | "NO" {
   const normalized = ((degrees % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;

   if (normalized <= 22.5 || normalized >= 337.5) {
      return "N";
   }
   if (normalized <= 67.5) {
      return "NE";
   }
   if (normalized <= 112.5) {
      return "E";
   }
   if (normalized <= 157.5) {
      return "SE";
   }
   if (normalized <= 202.5) {
      return "S";
   }
   if (normalized <= 247.5) {
      return "SO";
   }
   if (normalized <= 292.5) {
      return "O";
   }
   return "NO";
}
