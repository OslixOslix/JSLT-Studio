export class JSLTService {
  /**
   * Transforms input JSON using a browser-friendly JSLT-compatible engine.
   */
  static async transform(inputJson: string, jsltSchema: string): Promise<string> {
    try {
      // Lazy import to keep bundle size small and avoid parsing until needed
      const jsonata = (await import("jsonata")).default;

      const parsedInput = JSON.parse(inputJson);
      const expression = jsonata(jsltSchema);
      const transformed = await expression.evaluate(parsedInput);

      return JSON.stringify(transformed ?? null, null, 2);
    } catch (e: any) {
      console.error("Transformation Error", e);
      return JSON.stringify({
        error: "Failed to execute transformation.",
        details: e.message
      }, null, 2);
    }
  }

  static validateJson(jsonStr: string): boolean {
    try {
      JSON.parse(jsonStr);
      return true;
    } catch (e) {
      return false;
    }
  }
}
