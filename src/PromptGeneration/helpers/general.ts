export function readTextFile (filepath: string) {
  return fetch(filepath)
    .then(response => response.text())
    .then(text => text)
    .catch(error => null);
}

export function normal_dist(insanitylevel: number) {
  return ((Math.random() * 9 + 1) < insanitylevel) || insanitylevel >= 10;
}

export function uncommon_dist(insanitylevel: number) {
  return randint(1, 18) < insanitylevel || insanitylevel >= 10;
}

export async function artist_descriptions_csv_to_list(csvfilename: string) {
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
      ret.push(obj["Description"]);
    }
  }
  return ret;
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

export function chance_roll(insanitylevel: number, chance: string) {
  const chance_mapping: Record<string, { set_number: number, message: string }> = {
    'never': {'set_number': 0, 'message': ""},
    'novel': {'set_number': 500, 'message': "Uh, something novel has been added to the prompt. Interesting."},
    'extraordinary': {'set_number': 200, 'message': "Extraordinary! Something special has been added to the prompt"},
    'unique': {'set_number': 75, 'message': "Critical hit! Something unique has been added to the prompt"},
    'legendary': {'set_number': 50, 'message': "Nice! adding something legendary to the prompt"},
    'rare': {'set_number': 30, 'message': "adding something rare to the prompt"},
    'uncommon': {'set_number': 18, 'message': ""},
    'normal': {'set_number': 10, 'message': ""},
    'common': {'set_number': 5, 'message': ""},
    'always': {'set_number': 1, 'message': ""},
  }
  if (chance == 'never')
    return false
  if (chance in chance_mapping) {
    const properties = chance_mapping[chance]
    const set_number = properties['set_number']
    const message = properties['message']
    // if we have insanity level of 10, then every under rare is alwas true
    if (set_number <= 35 && insanitylevel >= 10) {
      if(message != "") console.log(message)
      return true 
    }
    const roll = randint(1, set_number) < insanitylevel
    if(message != "" && roll)
      console.log(message)
    return roll
  } else
    throw new Error("Invalid chance value: {chance}")
}

export function arrayRemove (arr: string[], value: string) {
  const cnt = arr.reduce((a, v) => (v === value ? a + 1 : a), 0);
  for (let i = 0; i < cnt; i++) {
    arr.splice(arr.indexOf(value), 1);
  }
}

export function unique_dist(insanitylevel: number) {
  const roll = (randint(1, 75) < insanitylevel)
  if(roll)
    console.log("Critical hit! Something unique has been added to the prompt")
  return roll
}