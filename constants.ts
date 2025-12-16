export const DEFAULT_INPUT_JSON = `{
  "menu": {
    "popup": {
      "menuitem": [
       {
          "value": "Open",
          "onclick": "OpenDoc()"
        },
        {
          "value": "Close",
          "onclick": "CloseDoc()"
        }
      ]
    }
  }
}`;

export const DEFAULT_JSLT_SCHEMA = `{
  "result" : {for (.menu.popup.menuitem)
    .value : .onclick
  }
}`;

export const DEFAULT_OUTPUT_PREVIEW = `// Output will appear here after transformation...`;
