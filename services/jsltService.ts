export class JSLTService {
  /**
   * Transforms input JSON using the Schibsted JSLT execution engine.
   */
  static async transform(inputJson: string, jsltSchema: string): Promise<string> {
    try {
      // Lazy import to avoid pulling the engine until transformation is requested
      const { compile, transform } = await import("jslt-node");

      const parsedInput = JSON.parse(inputJson);
      const compiled = compile(jsltSchema);
      const transformed = transform(compiled, parsedInput);

      return JSON.stringify(transformed, null, 2);
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
