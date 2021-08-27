import builder from "obsidian-rollup-presets";

export default builder()
.apply(c => c.output.sourcemap = "inline")
.assign({input: "src/zk-new-pane.js"})
.withInstall(__dirname)
.build();
