import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
const remote = require("electron").remote;
const globalShortcut = remote.globalShortcut;

interface MyPluginSettings {
  hotkey: string;
  miniDocumentSize: { width: number; height: number };
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  // TODO: this
  hotkey: "CommandOrControl+Shift+M",
  miniDocumentSize: { width: 300, height: 200 },
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "open-mini-document",
      name: "Open mini document",
      callback: () => this.openMiniDocument(),
    });

    this.registerGlobalHotkey();

    this.addSettingTab(new MiniDocumentSettingTab(this.app, this));
  }

  onunload() {
    this.deregisterGlobalHotkey();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerGlobalHotkey() {
    const ret = globalShortcut.register(this.settings.hotkey, () =>
      this.openMiniDocument(),
    );

    if (!ret) {
      console.error(
        `Expected registering ${this.settings.hotkey} hotkey to work`,
      );
    }
  }

  deregisterGlobalHotkey() {
    if (globalShortcut.isRegistered(this.settings.hotkey)) {
      globalShortcut.unregister(this.settings.hotkey);
    }
  }

  async openMiniDocument() {
    const workspace = this.app.workspace;
    const leaf = workspace.getLeaf("split");
    const file = await this.app.vault.create(
      `Mini Document ${Date.now()}.md`,
      "",
    );
    await leaf.openFile(file, { state: { mode: "source" } });

    // TODO:
    // const { width, height } = this.settings.miniDocumentSize;
    // leaf.setDimensions({ width, height });
  }
}

class MiniDocumentSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Hotkey")
      .setDesc(
        "Set the global hotkey for opening a mini document (e.g., CMD+SHIFT+M)",
      )
      .addText((text) =>
        text
          .setPlaceholder("CMD+SHIFT+M")
          .setValue(this.plugin.settings.hotkey)
          .onChange(async (value) => {
            this.plugin.settings.hotkey = value;
            await this.plugin.saveSettings();
            this.plugin.registerGlobalHotkey();
          }),
      );

    new Setting(containerEl)
      .setName("Mini Document Width")
      .setDesc("Set the width of the mini document (in pixels)")
      .addText((text) =>
        text
          .setPlaceholder("300")
          .setValue(String(this.plugin.settings.miniDocumentSize.width))
          .onChange(async (value) => {
            this.plugin.settings.miniDocumentSize.width = Number(value);
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Mini Document Height")
      .setDesc("Set the height of the mini document (in pixels)")
      .addText((text) =>
        text
          .setPlaceholder("200")
          .setValue(String(this.plugin.settings.miniDocumentSize.height))
          .onChange(async (value) => {
            this.plugin.settings.miniDocumentSize.height = Number(value);
            await this.plugin.saveSettings();
          }),
      );
  }
}
