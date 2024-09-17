import { readTextFile } from "./general";

const ScriptDir = 'scripts';

const UserfilesFolder = 'userfiles';
const DirectoryfilesFolder = '';

function readContent (
  content: string,
  skipheader: boolean,
  listoflistmode: boolean,
  delimiter: string,
  gender: string,
  antilist: string[],
  lowerandstrip: number,
) {
  const list = content.split('\n');
  let isFirst = true;
  const ret = [];
  for (const line of list) {
    if (isFirst) {
      isFirst = false;
      if (skipheader)
        continue;
    }
    if (listoflistmode) {
      ret.push(line.split(delimiter));
    } else {
      const cols = line.split(delimiter);
      const first = cols[0];
      const second = cols[1];
      if(
        gender != "all" &&
        (second == gender || second == "genderless" || second == "both") || gender == "all"
      ) {
        if(!antilist.includes(first.toLowerCase().trim())){
          if(lowerandstrip == 1)
            ret.push(first.toLowerCase().trim())        
          else
            ret.push(first)
        }
      }
    }
  }
  return ret;
}

export function csv_to_list_(obj: {
  csvfilename: string,
  antilist: string[],
  skipheader?: boolean,
  gender?: string,
  insanitylevel?: number,
  delimiter?: string,
  directory?: string,
}) {
  return csv_to_list(
    obj.csvfilename,
    obj.antilist,
    obj.directory ?? '/csvfiles/',
    0,
    obj.delimiter ?? ';',
    false,
    obj.skipheader ?? false,
    obj.gender ?? "all",
    obj.insanitylevel ?? -1
  );
} 

export async function csv_to_list(
  csvfilename: string,
  antilist: any[] = [],
  directory="/csvfiles/",
  lowerandstrip=0,
  delimiter=";",
  listoflistmode = false,
  skipheader = false,
  gender = "all",
  insanitylevel = -1
) {
  let replacing = true;
  const userfilesDirectory = "/userfiles/";
  const userfileAddonName = csvfilename + "_addon.csv";
  const userfileReplaceName = csvfilename + "_replace.csv";
  const lightfileName = csvfilename + "_light.csv";
  const mediumfileName = csvfilename + "_medium.csv";
  let csvlist: (string | string[])[] = [];
  
  // check if there is a replace file
  if(["/csvfiles/", "/csvfiles/special_lists/", "/csvfiles/templates/"].includes(directory)){
    // for filename in os.listdir(userfilesfolder):
    //     if(filename == userfilereplacename):
    //             # Just override the parameters, and let it run normally
    //             full_path = os.path.join(script_dir, userfilesdirectory )
    //             csvfilename = csvfilename + "_replace"
    //             replacing = True

    // Go check for light or medium files if there is no override and there is an insanitylevel
    if(!replacing && insanitylevel > 0) {
      if(insanitylevel < 4) {
        if (csvfilename.includes('medium')) {
          csvfilename = csvfilename + "_light";
          replacing = true;
        }                                
      }
      // under 7, than only SOMETIMES take the full list
      if(insanitylevel < 7 && Math.random() * 13 < 12 && !replacing) {
        if (csvfilename.includes('light')) {
          csvfilename = csvfilename + "_medium"
          replacing = true
        }                     
      }
    }
  }                

  // return empty list if we can't find the file. Build for antilist.csv
  let content = await readTextFile(directory + csvfilename + ".csv");
  if (content) {
    const l = readContent(content, skipheader, listoflistmode, delimiter, gender, antilist, lowerandstrip);
    csvlist = csvlist.concat(l);
  }
  // dirty hack for possible .txt files
  else {
    content = await readTextFile(directory + csvfilename + ".txt");
    if (content) {
      const l = readContent(content, skipheader, listoflistmode, delimiter, gender, antilist, lowerandstrip);
      csvlist = csvlist.concat(l);
    }
  }

  // do the add ons!
  // if(directory=="/csvfiles/" || directory=="/csvfiles/special_lists/"){
  //   let content = await readTextFile(UserfilesFolder + csvfilename + "_addon" + ".csv");
  //   if (content)
  //     csvlist.push(...readContent(content, skipheader, listoflistmode, delimiter, gender, antilist, lowerandstrip));
  // }

  // remove duplicates, but check only for lowercase stuff
  let deduplicatedList: (string | string[])[] = [];
  const lowercaseElements = new Set();
  if(!listoflistmode) {
    for (const element of csvlist) {
      if (typeof element === 'string') {
        const lowercase_element = element.toLowerCase();
        if (!lowercaseElements.has(lowercase_element)) {
          lowercaseElements.add(lowercase_element);
          deduplicatedList.push(element);
        }
      }
    }
  } else {
    deduplicatedList = csvlist;
  }
  
  return deduplicatedList;
}