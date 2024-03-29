import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.mjs",
    format: "es",
  },
  plugins: [typescript()],
  external: ["readline-sync", "crypto", "fs", "inquirer", "chalk"],
};
