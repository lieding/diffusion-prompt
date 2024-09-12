export function readTextFile (filepath: string) {
  return fetch(filepath)
    .then(response => response.text())
    .then(text => text)
    .catch(error => null);
}

export function normal_dist(insanitylevel: number) {
  return ((Math.random() * 9 + 1) < insanitylevel) || insanitylevel >= 10;
}

export async function artist_category_csv_to_list(csvfilename: string, category: string) {
  const full_path = "/csvfiles/";
  const content = await readTextFile(full_path + csvfilename + ".csv");
  const [ header, lines ] = content?.split('\n') ?? [];
  const ret: string[] = [];
  if (header && lines.length) {
    const headerCols = header.split(',');
    for (const line of lines) {
      const cols = line.split(',');
      const obj: Record<string, string> = {};
      for (let i = 0; i < cols.length; i++) {
        obj[headerCols[i]] = cols[i];
      }
      if (obj[category] == "1") {
        ret.push(obj["Artist"]);
      }
    }
  }
  return ret;
}

/**
 * the default delimiter is ';'
*/
export async function load_config_csv(suffix = "") {
  const full_path_config_file =  "/userfiles/";
  const full_path_default_config_file = "/csvfiles/config/";
  let config_file = '';
  let default_config_file = '';
  if(suffix) {
    config_file = full_path_config_file + 'config_' + suffix + '.csv'
    default_config_file = full_path_default_config_file + 'default_config_' + suffix + '.csv'
  } else {
    config_file = full_path_config_file + 'config.csv';
    default_config_file = full_path_default_config_file + 'default_config.csv';
  }

  let content = await readTextFile(config_file);
  if (!content) content = await readTextFile(default_config_file);
  content = content ?? '';
  const lines = content.split('\n').filter(line => line.length > 0).filter(line => !line.startsWith('#'));
  return lines.map(line => line.split(';'));
}

export function randomChoice (arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randint (num1: number, num2: number) {
  return Math.floor(Math.random() * (num2 - num1 + 1) + num1);
}

export function rare_dist(insanitylevel: number) {
  const roll = (randint(1, 30) < insanitylevel || insanitylevel >= 10);
  if(roll)
    console.log("adding something rare to the prompt");
  return roll;
}

export function common_dist(insanitylevel: number) {
  return randint(1, 5) < insanitylevel || insanitylevel >= 10;
}