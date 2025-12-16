export class JSLTService {
  /**
   * Transforms input JSON using the official Schibsted JSLT engine executed locally on the server.
   */
  static async transform(inputJson: string, jsltSchema: string): Promise<string> {
    const endpoint = import.meta.env.VITE_JSLT_ENDPOINT ?? "/api/transform";

    try {
      const parsedInput = JSON.parse(inputJson);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: parsedInput,
          jslt: jsltSchema
        })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Engine responded with ${response.status}: ${details}`);
      }

      const result = await response.json();
      return JSON.stringify(result, null, 2);
    } catch (e: any) {
      console.error("Transformation Error", e);
      return JSON.stringify({
        error: "Failed to execute transformation using the official JSLT engine.",
        details: e.message ?? String(e)
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
