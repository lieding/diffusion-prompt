import { readTextFile } from "./general";

const LocalStorage_ID = "obp_presets";

export class OneButtonPresets {
  script_dir = '';
  DEFAULT_OBP_FILE = "/presets/obp_presets.default";
  OBP_FILE = "/userfiles/obp_presets.json";
  CUSTOM_OBP = "Custom...";
  RANDOM_PRESET_OBP = "All (random)...";

  opb_presets: Record<string, any> = {};

  async load_obp_presets() {
    const default_data = (await this._load_data(this.DEFAULT_OBP_FILE)) ?? {};
    const data = JSON.parse(localStorage.getItem(LocalStorage_ID) ?? "{}");

    const newdata = { ...default_data, ...data };

    this.opb_presets = newdata;

    // this._save_data(this.OBP_FILE, newdata)
    return newdata as Record<string, Record<string, string>>
  }

  async _load_data(file_path: string) {
    let content = await readTextFile(file_path);
    if (content)
      return JSON.parse(content);
    file_path = this.DEFAULT_OBP_FILE;
    return readTextFile(file_path).then(data => data ? JSON.parse(data) : null);
  }

  // _save_data(file_path: string, data) {
  //   with open(file_path, "w") as f:
  //     json.dump(data, f, indent=2)
  // }

  save_obp_preset(perf_options: Record<string, any>) {
    localStorage.setItem(LocalStorage_ID, JSON.stringify(perf_options));
    this.opb_presets = { ...this.opb_presets, ...perf_options };
  }

  get_obp_preset(name: string) {
    return this.opb_presets[name];
  }
}