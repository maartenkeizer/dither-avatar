import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
  },
  {
    entry: ["src/react.tsx"],
    format: ["esm", "cjs"],
    dts: true,
  },
]);
