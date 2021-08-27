import {Plugin, Notice, Keymap} from "obsidian";
import {around} from "monkey-around";

export default class ZkNewPane extends Plugin {
    onload() {
        const zkp = this.zkp = this.app.internalPlugins.plugins["zk-prefixer"];
        const cb = this.cb = zkp.ribbonActions[0].callback;
        const handler = this.handler = (event) => {
            return Keymap.isModifier(event, "Mod") ? this.openInNewPane() : cb(event);
        }
        this.replaceButtonHandlers(cb, handler);
        this.addCommand({ id: "zk-new-pane",   name: "Create a Zettelkasten note in a new pane", checkCallback: (check) => {
            if (!this.zkp.enabled) return false;
            if (check) return true;
            return this.openInNewPane();
        }});
    }

    async openInNewPane() {
        let leaf = this.app.workspace.splitActiveLeaf();
        const remove = around(this.app.workspace, {getLeaf(prev) { return function(){ remove(); return leaf;} }});
        try {
            if (!this.zkp.enabled) throw new Error("Zettelkasten core plugin must be enabled")
            await this.zkp.instance.onCreateNote();
            this.app.workspace.setActiveLeaf(leaf);
            remove();
        } catch(e) {
            remove();
            leaf.detach();
            console.error(e);
            new Notice(e.message);
        }
    }

    replaceButtonHandlers(oldCb, newCb) {
        this.zkp.addedButtonEls.forEach(el => {
            el.removeEventListener("click", oldCb);
            el.addEventListener("click", newCb);
        });
    }

    onunload() {
        this.replaceButtonHandlers(this.handler, this.cb);
    }
}