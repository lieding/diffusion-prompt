import { csv_to_list, csv_to_list_ } from "./helpers/csvUtil";
import {
  arrayRemove,
  artist_category_csv_to_list, artist_descriptions_csv_to_list, chance_roll, common_dist, load_config_csv,
  normal_dist, randint, randomChoice, rare_dist, uncommon_dist, unique_dist
} from "./helpers/general";
import { OneButtonPresets } from "./helpers/presets";
import { translate_main_subject } from "./helpers/subjectUtils";

const OBPresets = new OneButtonPresets();

function split_prompt_to_words(text: string) {
  // first get all the words

  // Use a regular expression to replace non-alphabetic characters with spaces
  text = text.replace(/[^a-zA-Z,-]/g, ' ') //re.sub(r'[^a-zA-Z,-]', ' ', text)

  // Split the string by commas and spaces
  let words = text.split(/[,\s]+/)
  // Remove leading/trailing whitespaces from each word
  words = words.map(it => it.trim()).filter(it => it);

  // Convert the list to a set to remove duplicates, then convert it back to a list
  const listsinglewords = Array.from(new Set(words));

  let allwords = [];

  // now get all words clumped together by commas
  if (text.includes(","))
    allwords = text.split(',')
  else
    allwords = [text]
  // Remove leading/trailing whitespaces from each word and convert to lowercase
  words = allwords.map(it => it.trim().toLowerCase()).filter(it => it);

  // Filter out empty words and duplicates
  const listwords = Array.from(new Set(words));

  let totallist = [...listsinglewords, ...listwords]

  totallist = Array.from(new Set(totallist));

  return totallist
}

function cleanup(completeprompt: string, advancedprompting: boolean, insanitylevel = 5) {
  // This part is turned off, will bring it back later as an option
    
  // first, move LoRA's to the back dynamically

  // Find all occurrences of text between < and > using regex
  // allLoRA = re.findall(r"<[^>]+>", completeprompt)

  // Remove the extracted matches from completeprompt
  // completeprompt = re.sub(r"<[^>]+>", "", completeprompt)


  // if we are not using advanced prompting, remove any hybrid stuff:
  if(!advancedprompting) {
    const hybridpattern = r'\[\w+\|\w+\]'
    // Replace the matched pattern with the first word in the group
    completeprompt = re.sub(hybridpattern, replace_match, completeprompt)

    // Doesnt work if there are multiple words, so then just get rid of things as is :D
    completeprompt = completeprompt.replace("[", " ")
    completeprompt = completeprompt.replace("]", " ")
    completeprompt = completeprompt.replace("|", " ")
  }

  // sometimes if there are not enough artist, we get left we things formed as (:1.2)
  completeprompt = re.sub(r'\(\:\d+\.\d+\)', '', completeprompt)

  // lets also remove some wierd stuff on lower insanitylevels
  if(insanitylevel < 7):
      completeprompt = completeprompt.replace("DayGlo", " ")
      completeprompt = completeprompt.replace("fluorescent", " ")

  // all cleanup steps moved here
  completeprompt = re.sub(r'\[ ', '[', completeprompt)
  completeprompt = re.sub(r'\[,', '[', completeprompt)
  completeprompt = re.sub(r' \]', ']', completeprompt)
  completeprompt = re.sub(r' \|', '|', completeprompt)
  //completeprompt = re.sub(r' \"', '\"', completeprompt)
  //completeprompt = re.sub(r'\" ', '\"', completeprompt)
  completeprompt = re.sub(r'\( ', '(', completeprompt)
  completeprompt = re.sub(r' \(', '(', completeprompt)
  completeprompt = re.sub(r'\) ', ')', completeprompt)
  completeprompt = re.sub(r' \)', ')', completeprompt)

  completeprompt = re.sub(' :', ':', completeprompt)
  completeprompt = re.sub(',::', '::', completeprompt)
  completeprompt = re.sub(',:', ':', completeprompt)

  completeprompt = re.sub(',,', ', ', completeprompt)
  completeprompt = re.sub(',,', ', ', completeprompt)
  completeprompt = re.sub(',,,', ', ', completeprompt)
  completeprompt = re.sub(', ,', ',', completeprompt)
  completeprompt = re.sub(' , ', ', ', completeprompt)
  completeprompt = re.sub(' ,', ',', completeprompt)
  completeprompt = re.sub(' ,', ',', completeprompt)
  completeprompt = re.sub(' ,', ',', completeprompt)
  completeprompt = re.sub(r',\(', ', (', completeprompt)



  while "  " in completeprompt:
      completeprompt = re.sub('  ', ' ', completeprompt)
  completeprompt = re.sub('a The', 'The', completeprompt)
  completeprompt = re.sub('the the', 'the', completeprompt)
  completeprompt = re.sub(', ,', ',', completeprompt)
  completeprompt = re.sub(',,', ',', completeprompt)

  completeprompt = re.sub(', of a', ' of a', completeprompt)
  completeprompt = re.sub('of a,', 'of a', completeprompt)
  completeprompt = re.sub('of a of a', 'of a', completeprompt)
  completeprompt = re.sub(' a a ', ' a ', completeprompt)

  // a / an
  completeprompt = re.sub(' a a', ' an a', completeprompt)
  completeprompt = re.sub(' a e', ' an e', completeprompt)
  completeprompt = re.sub(' a i', ' an i', completeprompt)
  completeprompt = re.sub(' a u', ' an u', completeprompt)
  completeprompt = re.sub(' a o', ' an o', completeprompt)


  completeprompt = re.sub('art art', 'art', completeprompt)
  completeprompt = re.sub('Art art', 'art', completeprompt)
  completeprompt = re.sub('lighting lighting', 'lighting', completeprompt)
  completeprompt = re.sub('Lighting lighting', 'lighting', completeprompt)
  completeprompt = re.sub('light lighting', 'light', completeprompt)
  completeprompt = re.sub('-artiststyle- art,', '', completeprompt)
  completeprompt = re.sub('-artiststyle- art', '', completeprompt)
  completeprompt = re.sub('-artiststyle-', '', completeprompt)
  completeprompt = re.sub('-artistmedium-', '', completeprompt)
  completeprompt = re.sub('-artistdescription-', '', completeprompt)
  completeprompt = re.sub('- art ', '', completeprompt)

  completeprompt = re.sub('anime anime', 'anime', completeprompt)
  completeprompt = re.sub('anime, anime', 'anime', completeprompt)

  completeprompt = re.sub('shot shot', 'shot', completeprompt)
  

  completeprompt = re.sub('a his', 'his', completeprompt)
  completeprompt = re.sub('a her', 'her', completeprompt)
  completeprompt = re.sub('they is', 'they are', completeprompt)
  completeprompt = re.sub('they has', 'they have', completeprompt)

  // some space tricks
  completeprompt = re.sub('- shaped', '-shaped', completeprompt)
  completeprompt = re.sub('echa- ', 'echa-', completeprompt)
  completeprompt = re.sub('style -', 'style-', completeprompt)
  completeprompt = re.sub(', as a', ' as a', completeprompt)


  //small fix for multisubject thing
  completeprompt = re.sub('a 2', '2', completeprompt)
  completeprompt = re.sub('a 3', '3', completeprompt)
  completeprompt = re.sub('a 4', '4', completeprompt)
  completeprompt = re.sub('a 5', '5', completeprompt)


  // clean up some hacky multiples with adding a s to the end
  completeprompt = re.sub('fs ', 'ves ', completeprompt)
  completeprompt = re.sub('fs,', 'ves,', completeprompt)
  completeprompt = re.sub('sss ', 'ss ', completeprompt)
  completeprompt = re.sub('sss,', 'ss,', completeprompt)
  completeprompt = re.sub(' Mans', ' Men,', completeprompt)
  completeprompt = re.sub(' mans', ' men', completeprompt)
  completeprompt = re.sub(' Womans,', ' Women', completeprompt)
  completeprompt = re.sub(' womans,', ' women,', completeprompt)
  completeprompt = re.sub(r'\(Mans', '(Men,', completeprompt)
  completeprompt = re.sub(r'\(mans', '(men', completeprompt)
  completeprompt = re.sub(r'\(Womans', '(Women', completeprompt)
  completeprompt = re.sub(r'\(womans', '(women', completeprompt)

  completeprompt = re.sub('-sameothersubject-', 'it', completeprompt)
  completeprompt = re.sub('-samehumansubject-', 'the person', completeprompt)

  
  completeprompt = re.sub(r'(?<!\()\s?\(', ' (', completeprompt)
  completeprompt = re.sub(r'\)(?![\s)])', ') ', completeprompt)

  // Move the extracted LoRA's to the end of completeprompt
  //completeprompt += " " + " ".join(allLoRA)   

  completeprompt = completeprompt.replace(' . ', '. ')
  completeprompt = completeprompt.replace(', . ', '. ')
  completeprompt = completeprompt.replace(',. ', '. ')
  completeprompt = completeprompt.replace('., ', '. ')
  completeprompt = completeprompt.replace('. . ', '. ')

  completeprompt = completeprompt.strip(", ")

  return completeprompt
}

function custom_or(values: string[], insanitylevel = 5) {
  // Check if the last element is one of the specific values
  const last_element = values[-1]
  const first_element = values[0]
  let selected_value = ''
  
  if (last_element in ['always', 'common', 'normal','uncommon', 'rare', 'legendary','unique', 'extraordinary', 'novel', 'never']) {
    // If we do not hit the change roll, then take the first element.
    if (!(chance_roll(insanitylevel, last_element)))
      return first_element
    // Else anything but the first or last element
    else {
      arrayRemove(values, first_element)
      arrayRemove(values, last_element)
      const selected_value = randomChoice(values)
      return selected_value
    }
  } else
    // Randomly select one element from the list
    selected_value = randomChoice(values)
  return selected_value;
}

function parse_custom_functions(completeprompt: string, insanitylevel = 5) {
  //print(completeprompt)

  // Regular expression pattern to match 'or()' function calls and their arguments
  let ORpattern = /OR\((.*?)\)/
  let ORbasesearch = 'OR('



  while (completeprompt.includes(ORbasesearch)) {
    // basically start from right to left to start replacing, so we can do nesting
    // probably not very stable, but seems to work :)
    const startofOR = completeprompt.indexOf(ORbasesearch)

    const lastpartofcompleteprompt = completeprompt.substring(startofOR)

    // Find all 'or()' function calls and their arguments in the text
    const matches = Array.from(lastpartofcompleteprompt.match(/OR\((.*?)\)/ig) ?? [])

    // Sort the matches based on the length of the OR expressions
    matches.sort((a, b) => a.length - b.length)


    const match = matches[0] // get the first value, so smallest goes first!

    let or_replacement = ""


    // Split the arguments by ';'
    const argumentss = match.split(';').map(it => it.trim())
    
    // Evaluate the 'or()' function and append the result to the results list

    // For debugging, enable these lines
    //print(completeprompt)
    //print(arguments)
    or_replacement = custom_or(argumentss, insanitylevel)
    const completematch = 'OR(' + match + ')'
    completeprompt = completeprompt.replace(completematch, or_replacement)
  }

  

  return completeprompt
}

function replacewildcard(
  completeprompt: string,
  insanitylevel: number,
  wildcard: string,
  listname: string[],
  activatehybridorswap: boolean,
  advancedprompting: boolean,
  artiststyleselector = ""
) {
  if(!listname.length)
    // handling empty lists
    completeprompt = completeprompt.replace(wildcard, "",1)
  else {
    while (completeprompt.includes(wildcard)) {
      if(unique_dist(insanitylevel) and activatehybridorswap == True and len(listname)>2 and advancedprompting==True) {
        hybridorswaplist = ["hybrid", "swap"]
        hybridorswap = random.choice(hybridorswaplist)
        replacementvalue = random.choice(listname)
        listname.remove(replacementvalue)
        hybridorswapreplacementvalue = "[" + replacementvalue
        
        if(hybridorswap == "hybrid"):
                replacementvalue = random.choice(listname)
                listname.remove(replacementvalue)
                hybridorswapreplacementvalue += "|" + replacementvalue + "] "
        if(hybridorswap == "swap"):
                replacementvalue = random.choice(listname)
                listname.remove(replacementvalue)
                hybridorswapreplacementvalue += ":" + replacementvalue + ":" + str(random.randint(1,20)) +  "] "
        
        completeprompt = completeprompt.replace(wildcard, hybridorswapreplacementvalue,1)
      }

      //if list is not empty
      if(bool(listname)):
          replacementvalue = random.choice(listname)
          if(wildcard not in ["-heshe-", "-himher-","-hisher-"]):
              listname.remove(replacementvalue)
          
      else:
          replacementvalue = ""

      // override for artist and artiststyle, only for first artist
      if(wildcard == "-artist-" and ("-artiststyle-" in completeprompt or "-artistmedium-" in completeprompt or "-artistdescription-" in completeprompt)):
          artiststyles = []
          artiststyle = []
          chosenartiststyle = ""
          artistscomplete = artist_category_by_category_csv_to_list("artists_and_category",replacementvalue)
          artiststyles = artistscomplete[0]
          artistmediums = artistscomplete[1]
          artistdescriptions = artistscomplete[2]
          artiststyle = [x.strip() for x in artiststyles[0].split(",")]

          artiststyle = list(filter(lambda x: len(x) > 0, artiststyle)) # remove empty values

          if(artiststyleselector in artiststyle):
              artiststyle.remove(artiststyleselector)

          # Sorry folks, this only works when you directly select it as a style
          if("nudity" in artiststyle):
              artiststyle.remove("nudity")

          # keep on looping until we have no more wildcards or no more styles to choose from
          # leftovers will be removed in the cleaning step
          while bool(artiststyle) and "-artiststyle-" in completeprompt:
          
              chosenartiststyle = random.choice(artiststyle)
              completeprompt = completeprompt.replace("-artiststyle-",chosenartiststyle ,1)
              artiststyle.remove(chosenartiststyle)

          if("-artistmedium-" in completeprompt):
              if(artistmediums[0].lower() not in completeprompt.lower()):
                  completeprompt = completeprompt.replace("-artistmedium-",artistmediums[0] ,1)

          if("-artistdescription-" in completeprompt):
              completeprompt = completeprompt.replace("-artistdescription-",artistdescriptions[0] ,1)
          
          while bool(artiststyle) and "-artiststyle-" in completeprompt:
          
              chosenartiststyle = random.choice(artiststyle)
              completeprompt = completeprompt.replace("-artiststyle-",chosenartiststyle ,1)
              artiststyle.remove(chosenartiststyle)

      
      
      # Sneaky overrides for "same" wildcards
      # Are overwritten with their first parent
      if(wildcard == "-outfit-" or wildcard == "-minioutfit-"):
          completeprompt = completeprompt.replace("-sameoutfit-", replacementvalue,1)

      # Why do it in this detail?? Because we can:
      # Check if "from" exists in the string. For example Chun Li from Streetfighter, becomes Chun li
      if "from" in replacementvalue:
          # Find the index of "from" in the string
          from_index = replacementvalue.find("from")

          # Remove everything from and including "from"
          replacementvalueforoverrides = replacementvalue[:from_index].strip()
      else:
          replacementvalueforoverrides = replacementvalue

      if(wildcard in ["-human-"
                      ,"-humanoid-"
                      , "-manwoman-"                            
                      , "-manwomanrelation-"
                      , "-manwomanmultiple-"]
                      and "-samehumansubject-" in completeprompt):
                      if(completeprompt.index(wildcard) < completeprompt.index("-samehumansubject-")):
                          completeprompt = completeprompt.replace("-samehumansubject-", "the " + replacementvalueforoverrides)
      
      if(wildcard in ["-fictional-"
                      , "-nonfictional-"
                      , "-firstname-"
                      , "-oppositefictional-"
                      , "-oppositenonfictional-"]
                      and "-samehumansubject-" in completeprompt):
                      if(completeprompt.index(wildcard) < completeprompt.index("-samehumansubject-")):
                          completeprompt = completeprompt.replace("-samehumansubject-", replacementvalueforoverrides)
      
      # job is here, to prevent issue with a job outfit being replace. So doing it later solves that issue
      if(wildcard in ["-job-"]
                      and "-samehumansubject-" in completeprompt):
                      if(completeprompt.index(wildcard) < completeprompt.index("-samehumansubject-")):
                          completeprompt = completeprompt.replace("-samehumansubject-", "the " + replacementvalueforoverrides)
      
      
      # This one last, since then it is the only subject we have left
      if(wildcard in ["-malefemale-"]
          and "-samehumansubject-" in completeprompt):
          if(completeprompt.index(wildcard) < completeprompt.index("-samehumansubject-")):
              completeprompt = completeprompt.replace("-samehumansubject-", "the " + replacementvalueforoverrides)

      if(wildcard in ["-animal-"                         
                      , "-object-"
                      , "-vehicle-"
                      , "-food-"
                      , "-objecttotal-" 
                      , "-space-"
                      , "-flora-"
                      , "-location-"
                      , "-building-"]
                  and "-sameothersubject-" in completeprompt):
          if(completeprompt.index(wildcard) < completeprompt.index("-sameothersubject-")):
                      completeprompt = completeprompt.replace("-sameothersubject-", "the " + replacementvalueforoverrides)



      completeprompt = completeprompt.replace(wildcard, replacementvalue,1)
    }
  }

  return completeprompt
}


// builds a prompt dynamically
// insanity level controls randomness of propmt 0-10
// forcesubject van be used to force a certain type of subject
// Set artistmode to none, to exclude artists

async function build_dynamic_prompt(
  insanitylevel = 5,
  forcesubject = "all",
  artists = "all",
  imagetype = "all",
  onlyartists = false,
  antivalues = "",
  prefixprompt = "",
  suffixprompt ="",
  promptcompounderlevel ="1",
  seperator = "comma",
  givensubject="",
  smartsubject = true,
  giventypeofimage="",
  imagemodechance = 20,
  gender = "all",
  subtypeobject="all",
  subtypehumanoid="all",
  subtypeconcept="all",
  advancedprompting=true,
  hardturnoffemojis=false,
  seed=-1,
  overrideoutfit="",
  prompt_g_and_l = false,
  base_model = "SD1.5",
  OBP_preset = "",
  prompt_enhancer = "none",
  subtypeanimal="all",
  subtypelocation="all",
  preset_prefix = "",
  preset_suffix = ""
) {
  let remove_weights = false;
  let less_verbose = false;
  let add_vomit = true;
  let add_quality = true;
  let anime_mode = false;
  let configfilesuffix = ""
  if (forcesubject ==  "------ all")
    forcesubject = "all";

  let superprompter = false;
  prompt_enhancer = prompt_enhancer.toLowerCase();
  if (["superprompter", "superprompt", "superprompt-v1", "hyperprompt"].includes(prompt_enhancer))
    superprompter = true;
  if (superprompter)
    base_model = "Stable Cascade";

  // new method of subject choosing from the interface, lets translate this:
  let subjectlist = translate_main_subject(forcesubject);
  forcesubject = subjectlist[0];

  // ugly but it works :D Keeps both methods working while the UI changes.
  if (subtypeobject != "all" || subtypeobject)
    subtypeobject = subjectlist[1]
  if (subtypeanimal != "all" || subtypeanimal)
    subtypeanimal = subjectlist[1]
  if (subtypelocation != "all" || subtypelocation)
    subtypelocation = subjectlist[1]
  if (subtypehumanoid != "all" || subtypehumanoid)
    subtypehumanoid = subjectlist[1]
  if(subtypeconcept != "all" || subtypeconcept)
    subtypeconcept = subjectlist[1]

  // set seed
  // For use in ComfyUI (might bring to Automatic1111 as well)
  // lets do it when its larger than 0
  // Otherwise, just do nothing And it will keep on working based on an earlier set seed
  if(seed > 0)
    seed = Math.random()

  let originalinsanitylevel = insanitylevel
  if (advancedprompting && Math.floor(Math.random() * Math.max(0, insanitylevel - 2)) <= 0) {
    // advancedprompting == false
  }

  let original_OBP_preset = OBP_preset;
  let antistring: any
  let selected_opb_preset: any

  if(OBP_preset == OBPresets.RANDOM_PRESET_OBP) {
    const obp_options = await OBPresets.load_obp_presets();
    const random_preset_keys = Object.keys(obp_options);
    const random_preset = random_preset_keys[Math.floor(Math.random() * random_preset_keys.length)];
    console.log("Engaging randomized presets, locking on to: " + random_preset);

    selected_opb_preset = OBPresets.get_obp_preset(random_preset);
    insanitylevel = selected_opb_preset["insanitylevel"];
    forcesubject = selected_opb_preset["subject"];
    artists = selected_opb_preset["artist"];
    subtypeobject = selected_opb_preset["chosensubjectsubtypeobject"];
    subtypehumanoid = selected_opb_preset["chosensubjectsubtypehumanoid"];
    subtypeconcept = selected_opb_preset["chosensubjectsubtypeconcept"];
    gender = selected_opb_preset["chosengender"];
    imagetype = selected_opb_preset["imagetype"];
    imagemodechance = selected_opb_preset["imagemodechance"];
    givensubject = selected_opb_preset["givensubject"];
    smartsubject = selected_opb_preset["smartsubject"];
    overrideoutfit = selected_opb_preset["givenoutfit"];
    prefixprompt = selected_opb_preset["prefixprompt"];
    suffixprompt = selected_opb_preset["suffixprompt"];
    giventypeofimage = selected_opb_preset["giventypeofimage"];
    antistring = selected_opb_preset["antistring"];

    // api support tricks for OBP presets
    OBP_preset = "";
  }

  if(OBP_preset && OBP_preset != 'Custom...') {
    selected_opb_preset = OBPresets.get_obp_preset(OBP_preset);
    insanitylevel = selected_opb_preset["insanitylevel"];
    forcesubject = selected_opb_preset["subject"];
    artists = selected_opb_preset["artist"];
    subtypeobject = selected_opb_preset["chosensubjectsubtypeobject"];
    subtypehumanoid = selected_opb_preset["chosensubjectsubtypehumanoid"];
    subtypeconcept = selected_opb_preset["chosensubjectsubtypeconcept"];
    gender = selected_opb_preset["chosengender"];
    imagetype = selected_opb_preset["imagetype"];
    imagemodechance = selected_opb_preset["imagemodechance"];
    givensubject = selected_opb_preset["givensubject"];
    smartsubject = selected_opb_preset["smartsubject"];
    overrideoutfit = selected_opb_preset["givenoutfit"];
    prefixprompt = selected_opb_preset["prefixprompt"];
    suffixprompt = selected_opb_preset["suffixprompt"];
    giventypeofimage = selected_opb_preset["giventypeofimage"];
    antistring = selected_opb_preset["antistring"];
  }

  prefixprompt = preset_prefix + ", " + prefixprompt;
  suffixprompt = suffixprompt + ", " + preset_suffix; // build_dynamic_prompt.py LINE121

  // new method of subject choosing from the interface, lets translate this:
  // really hacky way of doing this now.
  if(forcesubject.includes('-')) {
    subjectlist = translate_main_subject(forcesubject);
    forcesubject = subjectlist[0];

    // ugly but it works :D Keeps both methods working while the UI changes.
    if(subtypeobject != "all" || subtypeobject)
      subtypeobject = subjectlist[1]
    if(subtypeanimal != "all" || subtypeanimal)
      subtypeanimal = subjectlist[1]
    if(subtypelocation != "all" || subtypelocation)
      subtypelocation = subjectlist[1]
    if(subtypehumanoid != "all" || subtypehumanoid)
      subtypehumanoid = subjectlist[1]
    if(subtypeconcept != "all" || subtypeconcept)
      subtypeconcept = subjectlist[1]
  } // build_dynamic_prompt.py LINE140

      
  let originalartistchoice = artists;
  let doartistnormal = true;
  let outfitmode = 0;

  let animalashuman = false;

  let partlystylemode = false;
  // cheat for presets
  let basemodel: any
  if (OBP_preset == "Waifu''s" || OBP_preset == "Husbando''s")
    basemodel = "Anime Model"
  // Base model options, used to change things in prompt generation. Might be able to extend to different forms like animatediff as well?
  let base_model_options = ["SD1.5", "SDXL", "Stable Cascade", "Anime Model"];
  if (!(base_model in base_model_options))
    base_model = "SD1.5" // Just in case there is no option here.
  // "SD1.5" -- Standard, future: More original style prompting
  // "SDXL" -- Standard (for now), future: More natural language
  // "Stable Cascade" -- Remove weights
  if(base_model == "Stable Cascade") {
    remove_weights = true;
    add_vomit = false;
    add_quality = false;
  }
  if (base_model == "SD1.5")
    less_verbose = true;
  if (base_model == "Anime Model") {
    less_verbose = true;
    advancedprompting = false;
    anime_mode = true;
    configfilesuffix = "anime";
  }
  
  // Hard overwrite some stuff because people dont config this themselves
  if((anime_mode || imagetype == "all - anime") && (artists == "all" || normal_dist(insanitylevel)))
    artists = "none";

  // load the config file
  let config = await load_config_csv(configfilesuffix); // build_dynamic_prompt.py LINE180

  // first build up a complete anti list. Those values are removing during list building
  // this uses the antivalues string AND the antilist.csv
  const emptylist: never[] = [];
  let antilist = (await csv_to_list("antilist", emptylist, "./userfiles/", 1)) as string[];
  
  const antivaluelist = antivalues.split(",");

  antilist = [...antilist, ...antivaluelist];

  // clean up antivalue list:
  antilist = antilist.map(x => x.toString().toLowerCase().trim()); // build_dynamic_prompt.py LINE193

  // Some tricks for gender to make sure we can choose Him/Her/It etc on the right time.
  if (gender == "all") {
    const genderchoicelist = ["male", "female"];
    gender = randomChoice(genderchoicelist);
  }
  let heshelist = ["it"];
  let hisherlist = ["its"];
  let himherlist = ["it"];
  // we also need to oppositegender for some fun!
  let oppositegender = "male";
  if (gender == "male")
    oppositegender = "female"; // build_dynamic_prompt.py LINE207

  // build all lists here

  const colorlist = await csv_to_list("colors",antilist)
  const animallist = await csv_to_list("animals",antilist)    
  const materiallist = await csv_to_list("materials",antilist)
  const objectlist = await csv_to_list("objects",antilist)
  const fictionallist = await csv_to_list_({csvfilename:"fictional characters",antilist,skipheader:true,gender})
  const nonfictionallist = await csv_to_list_({csvfilename:"nonfictional characters",antilist,skipheader:true,gender})
  const oppositefictionallist = await csv_to_list_({csvfilename:"fictional characters",antilist,skipheader:true,gender:oppositegender})
  const oppositenonfictionallist = await csv_to_list_({csvfilename:"nonfictional characters",antilist,skipheader:true,gender:oppositegender})
  const conceptsuffixlist = await csv_to_list("concept_suffix",antilist)
  const buildinglist = await csv_to_list("buildings",antilist)
  const vehiclelist = await csv_to_list("vehicles",antilist)
  const outfitlist = await csv_to_list("outfits",antilist)
  const locationlist = await csv_to_list("locations",antilist)
  const backgroundlist = await csv_to_list("backgrounds",antilist)

  const accessorielist = await csv_to_list("accessories",antilist,"./csvfiles/",0,"?",false,false,gender)
  const artmovementlist = await csv_to_list("artmovements",antilist)
  const bodytypelist = await csv_to_list_({csvfilename:"body_types",antilist,skipheader:true,gender})
  const cameralist = await csv_to_list("cameras",antilist)
  const colorschemelist = await csv_to_list("colorscheme",antilist)
  const conceptprefixlist = await csv_to_list("concept_prefix",antilist)
  const culturelist = await csv_to_list("cultures",antilist)
  let descriptorlist = await csv_to_list("descriptors",antilist)
  const devmessagelist = await csv_to_list("devmessages",antilist)
  const directionlist = await csv_to_list_({csvfilename:"directions",antilist,insanitylevel})
  const emojilist = await csv_to_list("emojis",antilist)
  const eventlist = await csv_to_list("events",antilist)
  const focuslist = await csv_to_list_({csvfilename:"focus",antilist, insanitylevel})
  const greatworklist = await csv_to_list("greatworks",antilist)
  const haircolorlist = await csv_to_list("haircolors",antilist)
  const hairstylelist = await csv_to_list("hairstyles",antilist)
  const hairvomitlist = await csv_to_list("hairvomit",antilist,"./csvfiles/",0,"?",false,false)
  
  const humanoidlist = await csv_to_list("humanoids",antilist) // build_dynamic_prompt.py LINE244
  let imagetypelist = [];
  if(anime_mode || imagetype=="all - anime") {
    if(imagetype == "all")
      imagetype = "all - anime"
    imagetypelist = await csv_to_list_({csvfilename:"imagetypes_anime",antilist, insanitylevel, delimiter:"?"})
  } else {
    imagetypelist = await csv_to_list_({csvfilename:"imagetypes",antilist, insanitylevel, delimiter:"?"})
  }
      

  const joblist = await csv_to_list_({csvfilename:"jobs",antilist,skipheader:true,gender})
  const lenslist = await csv_to_list_({csvfilename:"lenses",antilist, insanitylevel})
  const lightinglist = await csv_to_list_({csvfilename:"lighting",antilist, insanitylevel})
  const malefemalelist = await csv_to_list_({csvfilename:"malefemale",antilist,skipheader:true,gender})
  const manwomanlist = await csv_to_list_({csvfilename:"manwoman",antilist,skipheader:true,gender})
  const moodlist = await csv_to_list_({csvfilename:"moods",antilist, insanitylevel})
  const othertypelist = await csv_to_list("othertypes",antilist)
  const poselist = await csv_to_list("poses",antilist)
  const qualitylist = await csv_to_list("quality",antilist)
  const shotsizelist = await csv_to_list_({csvfilename:"shotsizes",antilist, insanitylevel})
  const timeperiodlist = await csv_to_list("timeperiods",antilist)
  const vomitlist = await csv_to_list_({csvfilename:"vomit",antilist, insanitylevel})
  if(anime_mode) {
    const replacements = {
      "-allstylessuffix-": "-buildfacepart-",
      "-artistdescription-": "-buildfacepart-"
    };

    vomitlist.forEach((vomit,i) => {
      for (const [key, value] of Object.entries(replacements)) {
        vomitlist[i] = vomit.toString().replace(key, value);
      }
    });
  } // build_dynamic_prompt.py LINE273

  const foodlist = await csv_to_list("foods", antilist)
  const genderdescriptionlist = await csv_to_list_({csvfilename:"genderdescription",antilist,skipheader:true,gender})
  const minilocationlist = await csv_to_list("minilocations", antilist)
  const minioutfitlist = await csv_to_list("minioutfits",antilist,"./csvfiles/",0,"?",false,false,gender)
  const seasonlist = await csv_to_list("seasons", antilist)
  const elaborateoutfitlist = await csv_to_list("elaborateoutfits", antilist)
  const minivomitlist = await csv_to_list("minivomit", antilist)
  const imagetypequalitylist = await csv_to_list("imagetypequality", antilist)
  const rpgclasslist = await csv_to_list("rpgclasses", antilist)
  const brandlist = await csv_to_list("brands", antilist)
  const spacelist = await csv_to_list("space", antilist)
  const poemlinelist = await csv_to_list("poemlines", antilist)
  const songlinelist = await csv_to_list("songlines", antilist)
  const musicgenrelist = await csv_to_list("musicgenres", antilist)
  const manwomanrelationlist = await csv_to_list_({csvfilename:"manwomanrelations",antilist,skipheader:true,gender})
  const manwomanmultiplelist = await csv_to_list_({csvfilename:"manwomanmultiples",antilist,skipheader:true,gender,delimiter:"?"})
  const waterlocationlist = await csv_to_list("waterlocations", antilist)
  const containerlist = await csv_to_list("containers", antilist)
  const firstnamelist = await csv_to_list_({csvfilename:"firstnames",antilist,skipheader:true,gender})
  const floralist = await csv_to_list("flora", antilist)
  const printlist = await csv_to_list("prints", antilist)
  const patternlist = await csv_to_list("patterns", antilist)
  const chairlist = await csv_to_list("chairs", antilist)
  const cardnamelist = await csv_to_list("card_names", antilist)
  const coveringlist = await csv_to_list("coverings", antilist)
  const facepartlist = await csv_to_list("faceparts", antilist)
  const outfitvomitlist = await csv_to_list_({csvfilename:"outfitvomit",antilist,delimiter:"?"})
  const humanvomitlist = await csv_to_list("humanvomit", antilist)
  const eyecolorlist = await csv_to_list("eyecolors", antilist)
  const fashiondesignerlist = await csv_to_list("fashiondesigners", antilist)
  const colorcombinationlist = await csv_to_list("colorcombinations", antilist)
  const materialcombinationlist = await csv_to_list("materialcombinations", antilist)
  const agelist = await csv_to_list("ages", antilist)
  const agecalculatorlist = await csv_to_list("agecalculator", antilist)
  const elementlist = await csv_to_list("elements", antilist)
  const settinglist = await csv_to_list("settings", antilist)
  const charactertypelist = await csv_to_list("charactertypes", antilist)
  const objectstoholdlist = await csv_to_list("objectstohold", antilist)
  const episodetitlelist = await csv_to_list_({csvfilename:"episodetitles",antilist,skipheader:true})
  const flufferlist = await csv_to_list("fluff", antilist)
  let tokenlist: any[] = []
  
  // New set of lists
  const locationfantasylist = await csv_to_list("locationsfantasy", antilist)
  const locationscifilist = await csv_to_list("locationsscifi", antilist)
  const locationvideogamelist = await csv_to_list("locationsvideogame", antilist)
  const locationbiomelist = await csv_to_list("locationsbiome", antilist)
  const locationcitylist = await csv_to_list("locationscities", antilist)
  const birdlist = await csv_to_list("birds", antilist)
  const catlist = await csv_to_list_({csvfilename:"cats", antilist,delimiter:"?"})
  const doglist = await csv_to_list_({csvfilename:"dogs", antilist,delimiter:"?"})
  const insectlist = await csv_to_list("insects", antilist)
  const pokemonlist = await csv_to_list("pokemon", antilist)
  const pokemontypelist = await csv_to_list("pokemontypes", antilist)
  const occultlist = await csv_to_list("occult", antilist)
  const marinelifelist = await csv_to_list("marinelife", antilist)
  

  // additional descriptor lists
  const outfitdescriptorlist = await csv_to_list("outfitdescriptors",antilist)
  const hairdescriptorlist = await csv_to_list("hairdescriptors",antilist)
  const humandescriptorlist = await csv_to_list("humandescriptors",antilist)
  const locationdescriptorlist = await csv_to_list("locationdescriptors",antilist)
  const basicbitchdescriptorlist = await csv_to_list("basicbitchdescriptors",antilist)
  const animaldescriptorlist = await csv_to_list("animaldescriptors",antilist) // build_dynamic_prompt.py LINE340

  // descriptorlist becomes one with everything
  const descriptortotallist = [
    ...descriptorlist,
    ...outfitdescriptorlist,
    ...hairdescriptorlist,
    ...humandescriptorlist,
    ...locationdescriptorlist,
    ...basicbitchdescriptorlist,
    ...animaldescriptorlist
  ];
  // Deduplicate the list while preserving casings
  descriptorlist = []
  const seen_items = new Set();

  for (const item of descriptortotallist) {
    // Convert the item to lowercase to ignore casing
    const item_lower = item.toString().toLowerCase();
    
    if (!seen_items.has(item_lower)) {
      seen_items.add(item_lower)
      descriptorlist.push(item)
    }
  }

  const humanlist = [...fictionallist, ...nonfictionallist, ...humanoidlist]
  const objecttotallist = [
    ...objectlist,
    ...buildinglist,
    ...vehiclelist,
    ...foodlist,
    ...spacelist,
    ...floralist,
    ...containerlist,
    ...occultlist
  ];
  const outfitprinttotallist = [
    ...objecttotallist,
    ...locationlist,
    ...colorlist,
    ...musicgenrelist,
    ...seasonlist,
    ...animallist,
    ...patternlist
  ]
  let humanactivitycheatinglist = [];
  if(less_verbose)
    humanactivitycheatinglist = ["-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "-miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)"]
  else
    humanactivitycheatinglist = ["OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)",
                              "OR(;, -heshe- is;uncommon) -miniactivity- OR(in;at) a OR(-location-;-building-;-waterlocation-)"]
  
  // build artists list
  if (artists == "wild")
    artists = "all (wild)" // build_dynamic_prompt.py LINE378

  // we want to create more cohorence, so we are adding all (wild) mode for the old logic
    
  // all else will be more constrained per type, to produce better images.
  // the popular artists will be used more the lower the insanitylevel is
  // Future: add in personal artists lists as well
  
  // lets maybe go wild "sometimes", based on insanitylevel
  if (artists == "all" && rare_dist(insanitylevel)) {
    artists = "all (wild)"
    originalartistchoice = artists
  }

  const artisttypes = ["popular", "3D",	"abstract",	"angular", "anime"	,"architecture",	"art nouveau",	"art deco",	"baroque",	"bauhaus", 	"cartoon",	"character",	"children's illustration", 	"cityscape", "cinema",	"clean",	"cloudscape",	"collage",	"colorful",	"comics",	"cubism",	"dark",	"detailed", 	"digital",	"expressionism",	"fantasy",	"fashion",	"fauvism",	"figurativism",	"graffiti",	"graphic design",	"high contrast",	"horror",	"impressionism",	"installation",	"landscape",	"light",	"line drawing",	"low contrast",	"luminism",	"magical realism",	"manga",	"melanin",	"messy",	"monochromatic",	"nature",	"photography",	"pop art",	"portrait",	"primitivism",	"psychedelic",	"realism",	"renaissance",	"romanticism",	"scene",	"sci-fi",	"sculpture",	"seascape",	"space",	"stained glass",	"still life",	"storybook realism",	"street art",	"streetscape",	"surrealism",	"symbolism",	"textile",	"ukiyo-e",	"vibrant",	"watercolor",	"whimsical"]
  let artiststyleselector = ""
  let artiststyleselectormode = "normal"
  let generateartist = true
  if(artists == "all" && normal_dist(insanitylevel + 1)) {
    artiststyleselector = randomChoice(artisttypes)
    artists = artiststyleselector
  } else if(artists == "all") {
    artiststyleselectormode = "custom"
    // then else maybe do nothing??
    if (randint(0,6) == 0 && !onlyartists)
      generateartist = false
    // go popular! Or even worse, we go full greg mode!
    else if(common_dist(Math.max(3,insanitylevel)))
      artists = "popular" 
    else if(randint(0,1) == 0) {
      // only on lower instanity levels anyway
      if(insanitylevel < 6)
        //too much greg mode!
        artists = "greg mode"
      else
        artists = "popular"
    } else
      artists = "none"
  } else
    artiststyleselectormode = "custom" // build_dynamic_prompt.py LINE417

  let artistlist: any[] = []
  // create artist list to use in the code, maybe based on category  or personal lists
  if(
    artists != "all (wild)" &&
    artists != "all" &&
    artists != "none" &&
    !artists.startsWith("personal_artists") &&
    !artists.startsWith("personal artists") &&
    artists in artisttypes
  )
    artistlist = await artist_category_csv_to_list("artists_and_category",artists)
  else if(artists.startsWith("personal_artists") || artists.startsWith("personal artists")) {
    artists = artists.replaceAll(" ","_") // add underscores back in
    artistlist = await csv_to_list(artists,antilist,"./userfiles/")
  } else if (artists != "none")
    artistlist = await csv_to_list("artists",antilist) // build_dynamic_prompt.py LINE 429


  // create special artists lists, used in templates
  const fantasyartistlist = await artist_category_csv_to_list("artists_and_category","fantasy")
  const popularartistlist = await artist_category_csv_to_list("artists_and_category","popular")
  const romanticismartistlist = await artist_category_csv_to_list("artists_and_category","romanticism")
  const photographyartistlist = await artist_category_csv_to_list("artists_and_category","photography")
  const portraitartistlist = await artist_category_csv_to_list("artists_and_category","portrait")
  const characterartistlist = await artist_category_csv_to_list("artists_and_category","character")
  const landscapeartistlist = await artist_category_csv_to_list("artists_and_category","landscape")
  const scifiartistlist = await artist_category_csv_to_list("artists_and_category","sci-fi")
  const graphicdesignartistlist = await artist_category_csv_to_list("artists_and_category","graphic design")
  const digitalartistlist = await artist_category_csv_to_list("artists_and_category","digital")
  const architectartistlist = await artist_category_csv_to_list("artists_and_category","architecture")
  const cinemaartistlist = await artist_category_csv_to_list("artists_and_category","cinema")
  const gregmodelist = await csv_to_list("gregmode", antilist)


  // add any other custom lists
  const stylestiloralist = await csv_to_list("styles_ti_lora",antilist,"./userfiles/")
  const generatestyle = Boolean(stylestiloralist?.length)

  const custominputprefixlist = await csv_to_list("custom_input_prefix",antilist,"./userfiles/")
  let generatecustominputprefix = Boolean(custominputprefixlist?.length)

  const custominputmidlist = await csv_to_list("custom_input_mid",antilist,"./userfiles/")
  const generatecustominputmid = Boolean(custominputmidlist?.length)

  const custominputsuffixlist = await csv_to_list("custom_input_suffix",antilist,"./userfiles/")
  const generatecustominputsuffix = Boolean(custominputsuffixlist?.length)

  const customsubjectslist = await csv_to_list("custom_subjects",antilist,"./userfiles/")
  const customoutfitslist = await csv_to_list("custom_outfits",antilist,"./userfiles/")

  // special lists
  const backgroundtypelist = await csv_to_list("backgroundtypes", antilist,"./csvfiles/special_lists/",0,"?")
  const insideshotlist = await csv_to_list("insideshots", antilist,"./csvfiles/special_lists/",0,"?")
  const photoadditionlist = await csv_to_list("photoadditions", antilist,"./csvfiles/special_lists/",0,"?")
  let buildhairlist = [], buildoutfitlist = [], humanadditionlist = [], objectadditionslist = [],
    buildfacelist = [], buildaccessorielist = [], humanactivitylist = [], humanexpressionlist = [];
  if(less_verbose) {
    buildhairlist = await csv_to_list("buildhair_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    buildoutfitlist = await csv_to_list("buildoutfit_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    humanadditionlist = await csv_to_list("humanadditions_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    objectadditionslist = await csv_to_list("objectadditions_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    buildfacelist = await csv_to_list("buildface_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    buildaccessorielist = await csv_to_list("buildaccessorie_less_verbose", antilist,"./csvfiles/special_lists/",0,"?")
    humanactivitylist = await csv_to_list("human_activities_less_verbose",antilist,"./csvfiles/",0,"?",false,false)
    humanexpressionlist = await csv_to_list("humanexpressions_less_verbose",antilist,"./csvfiles/",0,"?",false,false)
  } else {
    buildhairlist = await csv_to_list("buildhair", antilist,"./csvfiles/special_lists/",0,"?")
    buildoutfitlist = await csv_to_list("buildoutfit", antilist,"./csvfiles/special_lists/",0,"?")
    humanadditionlist = await csv_to_list("humanadditions", antilist,"./csvfiles/special_lists/",0,"?")
    objectadditionslist = await csv_to_list("objectadditions", antilist,"./csvfiles/special_lists/",0,"?")
    buildfacelist = await csv_to_list("buildface", antilist,"./csvfiles/special_lists/",0,"?")
    buildaccessorielist = await csv_to_list("buildaccessorie", antilist,"./csvfiles/special_lists/",0,"?")
    humanactivitylist = await csv_to_list("human_activities",antilist,"./csvfiles/",0,"?",false,false)
    humanexpressionlist = await csv_to_list("humanexpressions",antilist,"./csvfiles/",0,"?",false,false)
  }

  humanactivitylist = [...humanactivitylist, ...humanactivitycheatinglist]

  const animaladditionlist = await csv_to_list("animaladditions", antilist,"./csvfiles/special_lists/",0,"?")
  
  const minilocationadditionslist = await csv_to_list("minilocationadditions", antilist,"./csvfiles/special_lists/",0,"?")
  const overalladditionlist = await csv_to_list("overalladditions", antilist,"./csvfiles/special_lists/",0,"?")
  let imagetypemodelist = await csv_to_list("imagetypemodes", antilist,"./csvfiles/special_lists/",0,"?")
  const miniactivitylist = await csv_to_list("miniactivity", antilist,"./csvfiles/special_lists/",0,"?")
  const animalsuffixadditionlist = await csv_to_list("animalsuffixadditions", antilist,"./csvfiles/special_lists/",0,"?")
  const buildfacepartlist = await csv_to_list("buildfaceparts", antilist,"./csvfiles/special_lists/",0,"?")
  const conceptmixerlist = await csv_to_list("conceptmixer", antilist,"./csvfiles/special_lists/",0,"?")
  
  
  const tokinatorlist = await csv_to_list("tokinator", antilist,"./csvfiles/templates/",0,"?")
  const styleslist = await csv_to_list("styles", antilist,"./csvfiles/templates/",0,"?")
  const stylessuffix = styleslist.map(it => it.toString().split('-subject-')[1]) //[item.split('-subject-')[1] for item in styleslist]
  const breakstylessuffix = stylessuffix.map(item => item.split(',')) //[item.split(',') for item in stylessuffix]
  let allstylessuffixlist = breakstylessuffix.flat()
  allstylessuffixlist = Array.from(new Set(allstylessuffixlist))

  const artistsuffix = await artist_descriptions_csv_to_list("artists_and_category")
  const breakartiststylessuffix = artistsuffix.map(item => item.split(','))
  let artiststylessuffixlist = breakartiststylessuffix.flat()
  artiststylessuffixlist = Array.from(new Set(artiststylessuffixlist))
  allstylessuffixlist = [...allstylessuffixlist, ...artiststylessuffixlist]
  
  let dynamictemplatesprefixlist = await csv_to_list("dynamic_templates_prefix", antilist,"./csvfiles/templates/",0,"?")
  const dynamictemplatessuffixlist = await csv_to_list("dynamic_templates_suffix", antilist,"./csvfiles/templates/",0,"?") // build_dynamic_prompt.py LINE 516

  // subjects
  let mainchooserlist: string[] = []
  let objectwildcardlist: string[] = []
  let locationwildcardlist: string[] = []
  let animalwildcardlist: string[] = []
  let hybridlist: string[] = []
  let hybridhumanlist: string[] = []
  let humanoidsubjectchooserlist: string[] = []
  let eventsubjectchooserlist: string[] = []
  let locationsubjectchooserlist: string[] = []
  let addontolocationinsidelist: string[] = []
  let addontolocationlist: string[] = []

  // load subjects stuff from config
  let generatevehicle = true
  let generateobject = true
  let generatefood = true
  let generatebuilding = true
  let generatespace = true
  let generateflora = true
  let generateoccult = true
  let generateconcept = true

  let generateanimal = true
  let generatebird = true
  let generatecat = true
  let generatedog = true
  let generateinsect = true
  let generatepokemon = true
  let generatemarinelife = true // build_dynamic_prompt.py LINE 548

  let generatemanwoman = true
  let generatemanwomanrelation = true
  let generatemanwomanmultiple = true
  let generatefictionalcharacter = true
  let generatenonfictionalcharacter = true
  let generatehumanoids = true
  let generatejob = true
  let generatefirstnames = true

  let generatelandscape = true
  let generatelocation = true
  let generatelocationfantasy = true
  let generatelocationscifi = true
  let generatelocationvideogame = true
  let generatelocationbiome = true
  let generatelocationcity = true

  let generateevent = true
  let generateconcepts = true
  let generatepoemline = true
  let generatesongline = true
  let generatecardname = true
  let generateepisodetitle = true

  let custominputprefixrepeats = 2
  let custominputprefixchance = 'uncommon'

  let imagetypechance = 'normal'
  let generateimagetype = true
  let imagetypequalitychance = 'rare'
  let generateimagetypequality = true
  let generateminilocationaddition = true
  let minilocationadditionchance = 'unique'
  let artmovementprefixchance = 'unique'
  let minivomitprefix1chance = 'rare'
  let minivomitprefix2chance = 'unique'
  let shotsizechance = 'uncommon'

  let subjectdescriptor1chance = 'common'
  let subjectdescriptor2chance = 'uncommon'
  let subjectbodytypechance = 'normal'
  let subjectculturechance = 'normal'
  let subjectconceptsuffixchance = 'unique'

  let subjectlandscapeinsideshotchance = 'unique'
  let subjectlandscapeaddonlocationchance = 'normal'
  let subjectlandscapeaddonlocationdescriptorchance = 'rare'
  let subjectlandscapeaddonlocationculturechance = 'rare'

  let objectadditionsrepeats = 2
  let objectadditionschance = 'uncommon'
  let humanadditionchance = 'rare'
  let overalladditionchance = 'extraordinary'

  let emojichance = 'legendary'
  let buildfacechance = 'legendary'
  let humanexpressionchance = 'rare'
  let joboractivitychance = 'normal'
  let humanvomitchance = 'rare'

  let custominputmidrepeats = 2
  let custominputmidchance = 'uncommon'
  let minivomitmidchance = 'unique'

  let outfitchance = 'normal'
  let posechance = 'uncommon'
  let hairchance = 'normal'
  let accessorychance = 'normal'
  let humanoidinsideshotchance = 'legendary'
  let humanoidbackgroundchance = 'uncommon'

  let landscapeminilocationchance = 'uncommon'
  let generalminilocationchance = 'rare'

  let timperiodchance = 'normal'
  let focuschance = 'normal'
  let directionchance = 'normal'
  let moodchance = 'normal'
  let minivomitsuffixchance = 'unique'
  let artmovementchance = 'normal'
  let lightingchance = 'normal'
  let photoadditionchance = 'common'
  let lenschance = 'normal'
  let colorschemechance = 'normal'
  let vomit1chance = 'uncommon'
  let vomit2chance= 'uncommon'
  let greatworkchance = 'novel'
  let poemlinechance = 'novel'
  let songlinechance = 'novel'
  let quality1chance = 'uncommon'
  let quality2chance = 'uncommon'

  let customstyle1chance = 'uncommon'
  let customstyle2chance = 'uncommon'

  let custominputsuffixrepeats = 2
  let custominputsuffixchance = 'uncommon'

  let artistsatbackchance = 'uncommon' // build_dynamic_prompt.py LINE 649

  for (const item of config) {
    // objects
    if (item[0] == 'subject_vehicle' && item[1] != 'on')
      generatevehicle = false
    if (item[0] == 'subject_object' && item[1] != 'on')
      generateobject = false
    if (item[0] == 'subject_food' && item[1] != 'on')
      generatefood = false
    if (item[0] == 'subject_building' && item[1] != 'on')
      generatebuilding = false
    if (item[0] == 'subject_space' && item[1] != 'on')
      generatespace = false
    if (item[0] == 'subject_flora' && item[1] != 'on')
      generateflora = false
    if (item[0] == 'subject_occult' && item[1] != 'on')
      generateoccult = false
    // animals
    if (item[0] == 'subject_animal' && item[1] != 'on')
      generateanimal = false
    if (item[0] == 'subject_bird' && item[1] != 'on')
      generatebird = false
    if (item[0] == 'subject_cat' && item[1] != 'on')
      generatecat = false
    if (item[0] == 'subject_dog' && item[1] != 'on')
      generatedog = false
    if (item[0] == 'subject_insect' && item[1] != 'on')
      generateinsect = false
    if (item[0] == 'subject_pokemon' && item[1] != 'on')
      generatepokemon = false
    if (item[0] == 'subject_marinelife' && item[1] != 'on')
      generatemarinelife = false
    // humanoids
    if (item[0] == 'subject_manwoman' && item[1] != 'on')
      generatemanwoman = false
    if (item[0] == 'subject_manwomanrelation' && item[1] != 'on')
      generatemanwomanrelation = false
    if (item[0] == 'subject_manwomanmultiple' && item[1] != 'on')
      generatemanwomanmultiple = false
    if (item[0] == 'subject_fictional' && item[1] != 'on')
      generatefictionalcharacter = false
    if (item[0] == 'subject_nonfictional' && item[1] != 'on')
      generatenonfictionalcharacter = false
    if (item[0] == 'subject_humanoid' && item[1] != 'on')
      generatehumanoids = false
    if (item[0] == 'subject_job' && item[1] != 'on')
      generatejob = false
    if (item[0] == 'subject_firstnames' && item[1] != 'on')
      generatefirstnames = false
    // landscape
    if (item[0] == 'subject_location' && item[1] != 'on')
      generatelocation = false
    if (item[0] == 'subject_location_fantasy' && item[1] != 'on')
      generatelocationfantasy = false
    if (item[0] == 'subject_location_scifi' && item[1] != 'on')
      generatelocationscifi = false
    if (item[0] == 'subject_location_videogame' && item[1] != 'on')
        generatelocationvideogame = false
    if (item[0] == 'subject_location_biome' && item[1] != 'on')
        generatelocationbiome = false
    if (item[0] == 'subject_location_city' && item[1] != 'on')
        generatelocationcity = false
    // concept
    if (item[0] == 'subject_event' && item[1] != 'on')
      generateevent = false
    if (item[0] == 'subject_concept' && item[1] != 'on')
      generateconcepts = false
    if (item[0] == 'subject_poemline' && item[1] != 'on')
      generatepoemline = false
    if (item[0] == 'subject_songline' && item[1] != 'on')
      generatesongline = false
    if (item[0] == 'subject_cardname' && item[1] != 'on')
      generatecardname = false
    if (item[0] == 'subject_episodetitle' && item[1] != 'on')
      generateepisodetitle = false
    
    // main list stuff
    if (item[0] == 'custominputprefixrepeats')
      custominputprefixrepeats = Math.floor(Number(item[1]))
    if (item[0] == 'custominputprefixchance') {
      custominputprefixchance = item[1]
      if(custominputprefixchance == 'never')
        generatecustominputprefix = false
    }
    if (item[0] == 'imagetypechance') {
      imagetypechance = item[1]
      if(imagetypechance == 'never')
        generateimagetype = false
    }
    if (item[0] == 'imagetypequalitychance') {
      imagetypequalitychance = item[1]
      if(imagetypequalitychance == 'never')
        generateimagetypequality = false
    }
    if (item[0] == 'minilocationadditionchance')
      minilocationadditionchance = item[1]
    if (item[0] == 'artmovementprefixchance')
      artmovementprefixchance = item[1]
    if (item[0] == 'minivomitprefix1chance')
      minivomitprefix1chance = item[1]
    if (item[0] == 'minivomitprefix2chance')
      minivomitprefix2chance = item[1]
    
    if (item[0] == 'shotsizechance')
      shotsizechance = item[1]

    if (item[0] == 'subjectdescriptor1chance')
      subjectdescriptor1chance = item[1]
    if (item[0] == 'subjectdescriptor2chance')
      subjectdescriptor2chance = item[1]
    if (item[0] == 'subjectbodytypechance')
      subjectbodytypechance = item[1]
    if (item[0] == 'subjectculturechance')
      subjectculturechance = item[1]
    if (item[0] == 'subjectconceptsuffixchance')
      subjectconceptsuffixchance = item[1]

    if (item[0] == 'subjectlandscapeinsideshotchance')
      subjectlandscapeinsideshotchance = item[1]
    if (item[0] == 'subjectlandscapeaddonlocationchance')
      subjectlandscapeaddonlocationchance = item[1]
    if (item[0] == 'subjectlandscapeaddonlocationdescriptorchance')
      subjectlandscapeaddonlocationdescriptorchance = item[1]
    if (item[0] == 'subjectlandscapeaddonlocationculturechance')
      subjectlandscapeaddonlocationculturechance = item[1]

    if (item[0] == 'objectadditionsrepeats')
      objectadditionsrepeats = Math.floor(Number(item[1]))
    if (item[0] == 'objectadditionschance')
      objectadditionschance = item[1]
    if (item[0] == 'humanadditionchance')
      humanadditionchance = item[1]
    if (item[0] == 'overalladditionchance')
      overalladditionchance = item[1]

    if (item[0] == 'emojichance') {
      emojichance = item[1]
      if (hardturnoffemojis)
        emojichance = 'never'
    }
    if (item[0] == 'buildfacechance')
      buildfacechance = item[1]
    if (item[0] == 'humanexpressionchance')
      humanexpressionchance = item[1]
    if (item[0] == 'humanvomitchance')
      humanvomitchance = item[1]
    if (item[0] == 'joboractivitychance')
      joboractivitychance = item[1]

    if (item[0] == 'custominputmidrepeats')
      custominputmidrepeats = Math.floor(Number(item[1]))
    if (item[0] == 'custominputmidchance')
      custominputmidchance = item[1]
    if (item[0] == 'minivomitmidchance')
      minivomitmidchance = item[1]
    
    if (item[0] == 'outfitchance')
      outfitchance = item[1]
    if (item[0] == 'posechance')
      posechance = item[1]
    if (item[0] == 'hairchance')
      hairchance = item[1]
    if (item[0] == 'accessorychance')
      accessorychance = item[1]
    if (item[0] == 'humanoidinsideshotchance')
      humanoidinsideshotchance = item[1]
    if (item[0] == 'humanoidbackgroundchance')
      humanoidbackgroundchance = item[1]

    if (item[0] == 'landscapeminilocationchance')
      landscapeminilocationchance = item[1]
    if (item[0] == 'generalminilocationchance')
      generalminilocationchance = item[1]

    if (item[0] == 'timperiodchance')
      timperiodchance = item[1]
    if (item[0] == 'focuschance')
      focuschance = item[1]
    if (item[0] == 'directionchance')
      directionchance = item[1]
    if (item[0] == 'moodchance')
      moodchance = item[1]
    if (item[0] == 'minivomitsuffixchance')
      minivomitsuffixchance = item[1]
    if (item[0] == 'artmovementchance')
      artmovementchance = item[1]
    if (item[0] == 'lightingchance')
      lightingchance = item[1]
    if (item[0] == 'photoadditionchance')
      photoadditionchance = item[1]
    if (item[0] == 'lenschance')
      lenschance = item[1]
    if (item[0] == 'colorschemechance')
      colorschemechance = item[1]
    if (item[0] == 'vomit1chance')
      vomit1chance = item[1]
    if (item[0] == 'vomit2chance')
      vomit2chance = item[1]
    if (item[0] == 'greatworkchance')
      greatworkchance = item[1]
    if (item[0] == 'poemlinechance')
      poemlinechance = item[1]
    if (item[0] == 'songlinechance')
      songlinechance = item[1]
    if (item[0] == 'quality1chance')
      quality1chance = item[1]
    if (item[0] == 'quality2chance')
      quality2chance = item[1]

    if (item[0] == 'customstyle1chance')
      customstyle1chance = item[1]
    if (item[0] == 'customstyle2chance')
      customstyle2chance = item[1]
    
    if (item[0] == 'custominputsuffixrepeats')
      custominputsuffixrepeats = Math.floor(Number(item[1]))
    if (item[0] == 'custominputsuffixchance')
      custominputsuffixchance = item[1]

    if (item[0] == 'artistsatbackchance')
      artistsatbackchance = item[1]
  } // build_dynamic_prompt.py LINE 866

  generatevehicle = Boolean(vehiclelist?.length) && generatevehicle
  generateobject = Boolean(objectlist?.length) && generateobject
  generatefood = Boolean(foodlist?.length) && generatefood
  generatebuilding = Boolean(buildinglist?.length) && generatebuilding
  generatespace = Boolean(spacelist?.length) && generatespace
  generateflora = Boolean(floralist?.length) && generateflora
  generateoccult = Boolean(occultlist?.length) && generateoccult
  generateobject = generatevehicle || generateobject || generatefood || generatebuilding || generatespace || generateflora || generateoccult
  

  if(generatevehicle) {
    objectwildcardlist.push("-vehicle-")
    hybridlist.push("-vehicle-")
    addontolocationlist.push("-vehicle-")
  }
  
  if(generateobject) {
    objectwildcardlist.push("-object-")
    hybridlist.push("-object-")
  }

  if(generatefood) {
    objectwildcardlist.push("-food-")
    hybridlist.push("-food-")
  }
  
  if(generatespace) {
    objectwildcardlist.push("-space-")
    hybridlist.push("-space-")
    addontolocationlist.push("-space-")
  }

  if(generatebuilding) {
    objectwildcardlist.push("-building-")
    hybridlist.push("-building-")
    addontolocationlist.push("-building-")
    addontolocationinsidelist.push("-building-")
  }
  
  if(generateflora) {
    objectwildcardlist.push("-flora-")
    hybridlist.push("-flora-")
    addontolocationlist.push("-flora-")
  }

  if(generateoccult) {
    objectwildcardlist.push("-occult-")
    hybridlist.push("-occult-")
    addontolocationlist.push("-occult-")
  }
  
  if(generateobject) {
    mainchooserlist.push("object")
  }

  if(generatelandscape)
    mainchooserlist.push("landscape")
  
  if(generatelocationfantasy)
    locationwildcardlist.push("-locationfantasy-")
  
  if(generatelocationscifi)
    locationwildcardlist.push("-locationscifi-")
  
  if(generatelocationvideogame)
    locationwildcardlist.push("-locationvideogame-")
  
  if(generatelocationbiome)
    locationwildcardlist.push("-locationbiome-")
  
  if(generatelocationcity)
    locationwildcardlist.push("-locationcity-")
  
  if(generatelocation)
    locationwildcardlist.push("-location-")

  if(generateanimal)
    animalwildcardlist.push("-animal-")

  if(generatebird)
    animalwildcardlist.push("-bird-")
  
  if(generatecat)
    animalwildcardlist.push("-cat-")

  if(generatedog)
    animalwildcardlist.push("-dog-")

  if(generateinsect)
    animalwildcardlist.push("-insect-")

  if(generatepokemon)
    animalwildcardlist.push("-pokemon-")
  
  if(generatemarinelife)
    animalwildcardlist.push("-marinelife-") // build_dynamic_prompt.py LINE 956

  generatefictionalcharacter = Boolean(fictionallist?.length) && generatefictionalcharacter
  generatenonfictionalcharacter = Boolean(nonfictionallist?.length) && generatenonfictionalcharacter
  generatehumanoids = Boolean(humanoidlist?.length) && generatehumanoids
  generatemanwoman = Boolean(manwomanlist?.length) && generatemanwoman
  generatemanwomanrelation = Boolean(manwomanrelationlist?.length) && generatemanwomanrelation
  generatemanwomanmultiple = Boolean(manwomanmultiplelist?.length) && generatemanwomanmultiple
  generatejob = Boolean(joblist?.length) && generatejob
  generatefirstnames = Boolean(firstnamelist?.length) && generatefirstnames
  const generatehumanoid = generatefictionalcharacter || generatenonfictionalcharacter || generatehumanoids || generatemanwoman || generatejob || generatemanwomanrelation || generatefirstnames || generatemanwomanmultiple


  if(generatefictionalcharacter) {
    humanoidsubjectchooserlist.push("fictional")
    hybridlist.push("-fictional-")
    hybridhumanlist.push("-fictional-")
  }

  if(generatefictionalcharacter) {
    humanoidsubjectchooserlist.push("non fictional")
    hybridlist.push("-nonfictional-")
    hybridhumanlist.push("-nonfictional-")
  }
  
  if(generatehumanoids) {
    humanoidsubjectchooserlist.push("humanoid")
    hybridlist.push("-humanoid-")
    hybridhumanlist.push("-humanoid-")
  }
  
  if(generatemanwoman)
    humanoidsubjectchooserlist.push("human")

  if(generatemanwomanrelation)
    humanoidsubjectchooserlist.push("manwomanrelation")
  
  if(generatemanwomanmultiple)
    humanoidsubjectchooserlist.push("manwomanmultiple")

  if(generatejob)
    humanoidsubjectchooserlist.push("job")
  
  if(generatehumanoid)
    mainchooserlist.push("humanoid")

  if(generatefirstnames)
    humanoidsubjectchooserlist.push("firstname")
  
  
  generateanimal = Boolean(animallist?.length) && generateanimal
  generatebird = Boolean(birdlist?.length) && generatebird
  generatecat = Boolean(catlist?.length) && generatecat
  generatedog = Boolean(doglist?.length) && generatedog
  generateinsect = Boolean(insectlist?.length) && generateinsect
  generatepokemon = Boolean(pokemonlist?.length) && generatepokemon
  generatemarinelife = Boolean(marinelifelist?.length) && generatemarinelife

  const generateanimaltotal = generateanimal || generatebird || generatecat || generatedog || generateinsect || generatepokemon || generatemarinelife // build_dynamic_prompt.py LINE 1011

  if(generateanimal)
    hybridlist.push("-animal-")
  if(generatebird)
    hybridlist.push("-bird-")
  if(generatecat)
    hybridlist.push("-cat-")
  if(generatedog)
    hybridlist.push("-dog-")
  if(generateinsect)
    hybridlist.push("-insect-")
  if(generatepokemon)
    hybridlist.push("-pokemon-")

  if(generatemarinelife)
    hybridlist.push("-marinelife-")

  if(generateanimaltotal)
    mainchooserlist.push("animal")

  generatelocation = Boolean(locationlist?.length) && generatelocation
  generatelocationfantasy = Boolean(locationfantasylist?.length) && generatelocationfantasy
  generatelocationscifi = Boolean(locationscifilist?.length) && generatelocationscifi
  generatelocationvideogame = Boolean(locationvideogamelist?.length) && generatelocationvideogame
  generatelocationbiome = Boolean(locationbiomelist?.length) && generatelocationbiome
  generatelocationcity = Boolean(locationcitylist?.length) && generatelocationcity
  generatelandscape = generatelocation || generatelocationfantasy || generatelocationscifi || generatelocationvideogame || generatelocationbiome || generatelocationcity

  if(generatelandscape) {
    addontolocationlist.push("-location-")
    addontolocationlist.push("-background-")
    addontolocationinsidelist.push("-location-")
    addontolocationinsidelist.push("-background-")
    locationsubjectchooserlist.push("landscape")
  }
  
  if(generatelocation)
    locationsubjectchooserlist.push("location")
  if(generatelocationfantasy)
    locationsubjectchooserlist.push("fantasy location")
  if(generatelocationscifi)
    locationsubjectchooserlist.push("sci-fi location")
  if(generatelocationvideogame)
    locationsubjectchooserlist.push("videogame location")
  if(generatelocationbiome)
    locationsubjectchooserlist.push("biome")
  if(generatelocationcity)
    locationsubjectchooserlist.push("city")
  
  generateevent = Boolean(eventlist?.length) && generateevent
  generateconcepts = Boolean(conceptprefixlist?.length) && Boolean(conceptsuffixlist?.length) && generateconcepts
  generatepoemline = Boolean(poemlinelist?.length) && generatepoemline 
  generatesongline = Boolean(songlinelist?.length) && generatesongline
  generatecardname = Boolean(cardnamelist?.length) && generatecardname
  generateepisodetitle = Boolean(episodetitlelist?.length) && generateepisodetitle
  
  generateconcept = generateevent || generateconcepts || generatepoemline || generatesongline // build_dynamic_prompt.py LINE 1069

  if(generateevent)
    eventsubjectchooserlist.push("event")
  
  if(generateconcepts)
    eventsubjectchooserlist.push("concept")

  if(generatepoemline)
    eventsubjectchooserlist.push("poemline")
  
  if(generatesongline)
    eventsubjectchooserlist.push("songline")
  
  if(generatecardname)
    eventsubjectchooserlist.push("cardname")

  if(generateepisodetitle)
    eventsubjectchooserlist.push("episodetitle")

  if(generateconcept)
      mainchooserlist.push("concept")

  // determine wether we have a special mode or not
  if(randint(1,Number(imagemodechance)) == 1 && (imagetype == "all" || imagetype == "all - anime") && giventypeofimage == "" && !onlyartists) {
    if(less_verbose)
      imagetypemodelist = imagetypemodelist.filter(it => it !== "dynamic templates mode")
    if(anime_mode) {
      imagetypemodelist = imagetypemodelist
        .filter(it => it !== "only templates mode")
        .filter(it => it !== "massive madness mode")
        .filter(it => it !== "fixed styles mode")
        .filter(it => it !== "unique art mode")
    }
    imagetype = randomChoice(imagetypemodelist)  // override imagetype with a random "mode" value
  }


  let specialmode = false
  let templatemode = false
  let artblastermode = false
  let qualityvomitmode = false
  let uniqueartmode = false
  let colorcannonmode = false
  let photofantasymode = false
  let massivemadnessmode = false
  let onlysubjectmode = false
  let stylesmode = false
  let thetokinatormode = false
  let dynamictemplatesmode = false
  let artifymode = false

  // determine wether we should go for a template or not. Not hooked up to insanitylevel
  if(imagetype == "only templates mode") {
    specialmode = true
    templatemode = true
    console.log("Running with a randomized template instead of a randomized prompt")
  }

  if(imagetype == "art blaster mode") {
    specialmode = true
    if(uncommon_dist(insanitylevel))
      artblastermode = true
    else if(Boolean(artistlist?.length)) {
      onlysubjectmode = true
      artifymode = true
    } else
      artblastermode = true
    console.log("Running in art blaster mode")
  }

  if(imagetype == "unique art mode") {
    specialmode = true
    uniqueartmode = true
    console.log("Running in unique art mode")
  }

  if(imagetype == "quality vomit mode") {
    specialmode = true
    qualityvomitmode = true
    console.log("Running in quality vomit mode")
  }

  if(imagetype == "color cannon mode") {
    specialmode = true
    colorcannonmode = true
    console.log("Running in color cannon mode")
  }

  if(imagetype == "photo fantasy mode") {
    specialmode = true
    photofantasymode = true
    console.log("Running in photo fantasy mode")
  }

  if(imagetype == "massive madness mode") {
    specialmode = true
    massivemadnessmode = true
    console.log("Running in massive madness mode")
    console.log("Are you ready for this?")
  }

  if(imagetype == "subject only mode") {
    specialmode = true
    onlysubjectmode = true
    console.log("Running in only subject mode")
  }

  if(imagetype == "fixed styles mode") {
    specialmode = true
    stylesmode = true
    console.log("Running with a randomized style instead of a randomized prompt")
  }

  if(imagetype == "the tokinator") {
    specialmode = true
    thetokinatormode = true
    // for performance, load the list here
    tokenlist = await csv_to_list_({csvfilename:"tokens",antilist,skipheader:true})
    console.log("Running with a completely random set of words")
    console.log("All safety And logic is turned off")
  }

  if(imagetype == "dynamic templates mode") {
    specialmode = true
    dynamictemplatesmode = true
    console.log("Running with dynamic templates mode")
  }

  // just for testing, you can't choose this. Artify runs through Art Blaster instead.
  if(imagetype == "artify mode") {
    specialmode = true
    onlysubjectmode = true
    artifymode = true
    console.log("Running with artify mode")
  }

  // main stuff
  let generatetype = !specialmode
  let generatesubject = !templatemode
  if(thetokinatormode)
    generatesubject = false

  // normals
  generateartist = Boolean(artistlist?.length) && !specialmode
  if(thetokinatormode)
    generateartist = Boolean(artistlist?.length)
  let generateoutfit = Boolean(outfitlist?.length) && !templatemode
  let generatebodytype = Boolean(bodytypelist?.length) && !templatemode
  let generateaccessorie = Boolean(accessorielist?.length) && !specialmode
  let generateartmovement = Boolean(artmovementlist?.length) && !specialmode
  let generatecamera = Boolean(cameralist?.length) && !specialmode
  let generatecolorscheme = Boolean(colorschemelist?.length) && !specialmode
  let generatedescriptors = Boolean(descriptorlist?.length) && !templatemode
  let generatedirection = Boolean(directionlist?.length) && !specialmode
  let generatefocus = Boolean(focuslist?.length) && !specialmode
  let generatehairstyle = Boolean(hairstylelist?.length) && !templatemode
  let generatelens = Boolean(lenslist?.length) && !specialmode
  let generatelighting = Boolean(lightinglist?.length) && !specialmode
  let generatemood = Boolean(moodlist?.length) && !specialmode
  let generatepose = Boolean(poselist?.length) && !templatemode
  let generatevomit = Boolean(vomitlist?.length) && !specialmode && add_vomit
  let generatequality = Boolean(qualitylist?.length) && !specialmode && add_quality
  let generateshot = Boolean(shotsizelist?.length) && !specialmode
  let generatetimeperiod = Boolean(timeperiodlist?.length) && !specialmode
  let generateemoji = Boolean(emojilist?.length) && !templatemode
  let generateface = Boolean(buildfacelist?.length) && !specialmode
  let generatehumanexpression = Boolean(humanexpressionlist?.length) && !specialmode
  let generatehumanvomit = Boolean(humanvomitlist?.length) && !specialmode

  // specials:
  let generatebackground = Boolean(backgroundtypelist?.length) && !specialmode
  let generateinsideshot = Boolean(insideshotlist?.length) && !specialmode
  let generatephotoaddition = Boolean(photoadditionlist?.length) && !specialmode
  generatehairstyle = Boolean(buildhairlist?.length) && !templatemode
  generateoutfit = Boolean(buildoutfitlist?.length) && !templatemode
  let generateobjectaddition = Boolean(objectadditionslist?.length) && !templatemode
  let generatehumanaddition = Boolean(humanadditionlist?.length) && !templatemode
  let generateanimaladdition = Boolean(animaladditionlist?.length) && !templatemode
  let generateaccessories = Boolean(buildaccessorielist?.length) && !templatemode
  let generategreatwork = Boolean(greatworklist?.length) && !specialmode
  generatepoemline = Boolean(poemlinelist?.length) && !specialmode
  generatesongline = Boolean(songlinelist?.length) && !specialmode
  generatecardname = Boolean(cardnamelist?.length) && !specialmode
  generateepisodetitle = Boolean(episodetitlelist?.length) && !specialmode
  
  generateminilocationaddition = Boolean(minilocationadditionslist?.length) && !specialmode
  let generateminivomit = Boolean(minivomitlist?.length) && !specialmode && add_vomit
  generateimagetypequality = Boolean(imagetypequalitylist?.length) && !specialmode && generateimagetypequality 
  let generateoveralladdition = Boolean(overalladditionlist?.length) && !specialmode
  generateimagetype = Boolean(imagetypelist?.length) && !specialmode && generateimagetype


  // Smart subject logic
  let givensubjectlist: string[] = []
  
  if(givensubject != "" && smartsubject == true) {
    givensubject = givensubject.toLowerCase()
  
    // Remove any list that has a matching word in the list
    // Remove any list/logic with keywords, such as:
    // wearing, bodytype, pose, location, hair, background

    // use function to split up the words
    let givensubjectlist = split_prompt_to_words(givensubject)

    // Check only for the lists that make sense?
    
    // outfit
    let foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => outfitlist.map(it => it.toString().toLowerCase()).includes(it))
    let keywordslist = ["wearing","outfit", "dressed"]
    let keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it) //any(word.lower() in givensubject.lower() for word in keywordslist)
    if(foundinlist || keywordsinstring)
      generateoutfit = false
    
    // bodytype
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => bodytypelist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["bodytype","body type","model"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatebodytype = false

    // hair
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => hairstylelist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["hair","hairstyle"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatehairstyle = false
    
    // descriptorlist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => descriptorlist.map(it => it.toString().toLowerCase()).includes(it))
    let foundinlist2 = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => culturelist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist || foundinlist2)
      generatedescriptors = false

    // background
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => locationlist.map(it => it.toString().toLowerCase()).includes(it))
    foundinlist2 = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => buildinglist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["location","background", "inside", "at the", "in a"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || foundinlist2 || keywordsinstring) {
      generatebackground = false
      generateinsideshot = false
    }

    // accessorielist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => accessorielist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
      generateaccessorie = false

    // lenslist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => lenslist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
      generatelens = false

    // lightinglist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => lightinglist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["lighting"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatelighting = false

    // mood
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => moodlist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["mood"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatemood = false


    // poselist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => poselist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["pose", "posing"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatepose = false

    // qualitylist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => qualitylist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["quality"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generatequality = false

    // shotsize
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => shotsizelist.map(it => it.toString().toLowerCase()).includes(it))
    keywordslist = ["shot"]
    keywordsinstring = keywordslist.map(it => it.toLowerCase()).some(it => givensubject.toLowerCase() === it)
    if(foundinlist || keywordsinstring)
      generateshot = false

    // timeperiodlist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => timeperiodlist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
      generatetimeperiod = false

    // vomit
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => vomitlist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
        generatevomit = false

    // directionlist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => directionlist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
        generatedirection = false

    // focus
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => focuslist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
        generatefocus = false

    // artmovementlist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => artmovementlist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
        generateartmovement = false
    
    // camera
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => cameralist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
        generatecamera = false

    // colorschemelist
    foundinlist = givensubjectlist
      .map(it => it.toLowerCase())
      .some(it => colorschemelist.map(it => it.toString().toLowerCase()).includes(it))
    if(foundinlist)
      generatecolorscheme = false
  }

  // given subject subject override :p
  let subjectingivensubject = false
  let givensubjectpromptlist: string[] = []
  if(givensubjectlist.map(it => it.toLowerCase()).includes("subject") && smartsubject == true) {
    givensubjectpromptlist = givensubject.split("subject")
    subjectingivensubject = true
  }

  let completeprompt = ""
  
  let promptstocompound = Number(promptcompounderlevel)
  let compoundcounter = 0 // build_dynamic_prompt.py LINE 1395

  while (compoundcounter < promptstocompound) {
    let isphoto = 0
    let othertype = 0
    let humanspecial = 0
    let animaladdedsomething = 0
    let isweighted = 0
    let amountofimagetypes = 0
    let hybridorswap = ""
    let artistmode = "normal"
    let insideshot = 0
    let buildingfullmode = false
    let subjectchooser = ""
    let mainchooser = ""

    let artistbylist: string[] = []

    let chosenstylesuffix = ''
  
    //completeprompt += prefixprompt

    completeprompt += ", " // build_dynamic_prompt.py LINE 1413

    if(templatemode) {
      const templatelist = (await csv_to_list("templates", antilist,"./csvfiles/templates/",1,";",true)) as string[][]

            
      // templateenvironments = [templateenvironment[1] for templateenvironment in templatelist]
      // templateenvironmentsources = [templateenvironmentsource[2] for templateenvironmentsource in templatelist]
      // templatesubjecttypes = [templatesubjecttype[3] for templatesubjecttype in templatelist]

      const targettemplateenvironment = "all"
      const templateenvironmentsources = "all"

      // takes the prompt based on filters:
      // targettemplateenvironment: either civitai model or website
      // templateenvironmentsources: either
      const templateprompts = templatelist // [templateprompt[0] for templateprompt in templatelist if(  ) ]
        .filter(templateprompt => (templateprompt[1] == targettemplateenvironment || targettemplateenvironment =="all") && (templateprompt[2] == templateenvironmentsources || templateenvironmentsources == "all") && (templateprompt[3] == forcesubject || forcesubject == "all"))
        .map(prompts => prompts[0])

      const templatepromptcreator = // [templateprompt[1] for templateprompt in templatelist if ]
        templatelist.filter(templateprompt => (templateprompt[1] == targettemplateenvironment || targettemplateenvironment =="all") && (templateprompt[2] == templateenvironmentsources || templateenvironmentsources == "all") && (templateprompt[3] == forcesubject || forcesubject == "all"))
        .map(prompts => prompts[1])
      const templatesubjects= //[templateprompt[4] for templateprompt in templatelist if(  )]
        templatelist.filter(templateprompt => (templateprompt[1] == targettemplateenvironment || targettemplateenvironment =="all") && (templateprompt[2] == templateenvironmentsources || templateenvironmentsources == "all") && (templateprompt[3] == forcesubject || forcesubject == "all"))
        .map(prompts => prompts[4])
      
      // choose the template
      const chosentemplate = randomChoice(templateprompts)
      const templateindex = templateprompts.indexOf(chosentemplate)

      console.log("Processing a prompt that was inspired from: " + templatepromptcreator[templateindex])

      // if there is a subject override, then replace the subject with that
      if(givensubject=="")
        completeprompt += chosentemplate.replace("-subject-",templatesubjects[templateindex] )
      else if(givensubject != "" && !subjectingivensubject)
        completeprompt += chosentemplate.replace("-subject-",givensubject )
      else if(givensubject != "" && subjectingivensubject)
        completeprompt += chosentemplate.replace("-subject-", givensubjectpromptlist[0] + " " + templatesubjects[templateindex] + " " + givensubjectpromptlist[1])
    } // build_dynamic_prompt.py LINE 1445

    // custom prefix list
    for (let i = 0; i < custominputprefixrepeats; i++) {
      if(chance_roll(insanitylevel, custominputprefixchance) && generatecustominputprefix)
        completeprompt += randomChoice(custominputprefixlist) + ", "
    }


    if(insanitylevel == 0)
      insanitylevel =  randint(1, 10)  // 10 = add everything, 1 is add almost nothing
    let insanitylevel3 = Math.floor((insanitylevel/3) + 1.20)

    // print("Setting insanity level to " + str(insanitylevel))

    // main chooser: 0 object, 1 animal, 2 humanoid, 3 landscape, 4 event/concept
    //mainchooserlist = ["object","animal","humanoid", "landscape", "concept"]

    // ["popular", "3D",	"abstract",	"angular", "anime"	,"architecture",	"art nouveau",	"art deco",	"baroque",	"bauhaus", 	"cartoon",	"character",	"children's illustration", 	"cityscape", 	"clean",	"cloudscape",	"collage",	"colorful",	"comics",	"cubism",	"dark",	"detailed", 	"digital",	"expressionism",	"fantasy",	"fashion",	"fauvism",	"figurativism",	"gore",	"graffiti",	"graphic design",	"high contrast",	"horror",	"impressionism",	"installation",	"landscape",	"light",	"line drawing",	"low contrast",	"luminism",	"magical realism",	"manga",	"melanin",	"messy",	"monochromatic",	"nature",	"photography",	"pop art",	"portrait",	"primitivism",	"psychedelic",	"realism",	"renaissance",	"romanticism",	"scene",	"sci-fi",	"sculpture",	"seascape",	"space",	"stained glass",	"still life",	"storybook realism",	"street art",	"streetscape",	"surrealism",	"symbolism",	"textile",	"ukiyo-e",	"vibrant",	"watercolor",	"whimsical"]

    // Some new logic, lets base the main chooser list on the chosen art category, to make it more cohorent
    // first for humanoids
    let artiststylelistforchecking = ["popular", "3D",	"anime",	"art nouveau",	"art deco",	"character", "fantasy",	"fashion", "manga", "photography","portrait","sci-fi"]
    if((artiststylelistforchecking.includes(artiststyleselector)
        || artiststylelistforchecking.includes(artists))
        && (forcesubject == "all" || forcesubject == "")
    ) {
      // remove the shizzle based on chance?
      // we want it to be MORE diverce when the insanity level raises
      // in this case, raise the chance for a humanoid, gets more wierd when going above 5

      if(randint(0,6) > Math.max(2,insanitylevel -2) && "concept" in mainchooserlist)
        mainchooserlist =  mainchooserlist.filter(it => it !== "concept")
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "landscape" in mainchooserlist)
        mainchooserlist =  mainchooserlist.filter(it => it !== "landscape")
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "object" in mainchooserlist)
        mainchooserlist =  mainchooserlist.filter(it => it !== "object")
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "animal" in mainchooserlist)
        mainchooserlist =  mainchooserlist.filter(it => it !== "animal")
    } // build_dynamic_prompt.py LINE 1485

    // second for landscapes
    // Some new logic, lets base the main chooser list on the chosen art category, to make it more cohorent
    artiststylelistforchecking = ["architecture","bauhaus", "cityscape", "cinema", "cloudscape","impressionism",	"installation",	"landscape","magical realism",	"nature", "romanticism","seascape",	"space",	"streetscape"]

    if((artiststyleselector in artiststylelistforchecking
        || artists in artiststylelistforchecking)
        && (forcesubject == "all" || forcesubject == "")
    ) {
      // remove the shizzle based on chance?
      // we want it to be MORE diverce when the insanity level raises
      // in this case, raise the chance for a landscape, gets more wierd when going above 5
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "concept" in mainchooserlist)
        arrayRemove(mainchooserlist, "concept") // mainchooserlist.remove("concept")
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "animal" in mainchooserlist)
        arrayRemove(mainchooserlist, "animal")
      if(randint(0,6) > Math.max(2,insanitylevel -2) && "object" in mainchooserlist)
        arrayRemove(mainchooserlist, "object")
      if(randint(0,8) > Math.max(2,insanitylevel -2) && "humanoid" in mainchooserlist)
        arrayRemove(mainchooserlist, "humanoid")
    }

    //focus in animemode on mostly humans
    if(anime_mode && (forcesubject == "all" || forcesubject == "")) {
      if(randint(0,11) > Math.max(2,insanitylevel -2) && "concept" in mainchooserlist)
        arrayRemove(mainchooserlist, "concept")
      if(randint(0,11) > Math.max(2,insanitylevel -2) && "landscape" in mainchooserlist)
        arrayRemove(mainchooserlist, "landscape")
      if(randint(0,11) > Math.max(2,insanitylevel -2) && "object" in mainchooserlist)
        arrayRemove(mainchooserlist, "object")
      if(randint(0,8) > Math.max(2,insanitylevel -2) && "animal" in mainchooserlist)
        arrayRemove(mainchooserlist, "animal")
    }


    // choose the main subject type
    mainchooser = randomChoice(mainchooserlist)
    
    if(forcesubject != "" && forcesubject != "all")
      mainchooser = forcesubject    
    // 0 object, 1 animal, 2 animal as human, 3 ManWoman, 4 Job, 5 fictional, 6 non fictional, 7 humanoid, 8 landscape, 9 event
    if(mainchooser == "object")
      subjectchooser = "object"
    if(mainchooser == "animal" && (randint(0,5) == 5 || anime_mode))
      // sometimes interpret the animal as a human
      // for anime_mode this is always true
      animalashuman = true
    if(mainchooser == "humanoid") {
      //humanoidsubjectchooserlist = ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "firstname"]
      // Lets put generic humans as a more 'normal' value. Manwoman relation as the least picked.
      // balanced around 5, to have more normal man/woman
      // lower values even more stable
      // Upper values are still quite random
      const humanoidsubjectchooserlistbackup = humanoidsubjectchooserlist.slice() // make a backup of the list
      if(randint(0,20) > Math.max(2,insanitylevel -2) && "manwomanrelation" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "manwomanrelation")
      if(randint(0,30) > Math.max(2,insanitylevel -2) && "manwomanmultiple" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "manwomanmultiple")
      if(randint(0,7) > Math.max(2,insanitylevel -2) && "firstname" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "firstname")
      if(randint(0,5) > Math.max(2,insanitylevel -2) && "job" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "job")
      if(randint(0,5) > Math.max(2,insanitylevel -2) && "fictional" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "fictional")
      if(randint(0,5) > Math.max(2,insanitylevel -2) && "non fictional" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "non fictional")
      if(randint(0,5) > Math.max(2,insanitylevel -2) && "humanoid" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "humanoid")
      // more random stuff on higher levels
      if(randint(0,4) > Math.max(2,insanitylevel -2) && "human" in humanoidsubjectchooserlist)
        arrayRemove(humanoidsubjectchooserlist, "human")

      // if we accidently remove everything, then restore the backup list
      if(!Boolean(humanoidsubjectchooserlist?.length))
        humanoidsubjectchooserlist = humanoidsubjectchooserlistbackup
                  
      subjectchooser = randomChoice(humanoidsubjectchooserlist)

      if(subtypehumanoid != "all") {
        if(subtypehumanoid == "generic humans")
          subjectchooser = "human"
        else if(subtypehumanoid == "generic human relations")
          subjectchooser = "manwomanrelation"
        else if(subtypehumanoid == "multiple humans")
          subjectchooser = "manwomanmultiple"
        else if(subtypehumanoid == "celebrities e.a.")
          subjectchooser = "non fictional"
        else if(subtypehumanoid == "fictional characters")
          subjectchooser = "fictional"
        else if(subtypehumanoid == "humanoids")
          subjectchooser = "humanoid"
        else if(subtypehumanoid == "based on job or title")
          subjectchooser = "job"
        else if(subtypehumanoid == "based on first name")
          subjectchooser = "firstname"
        else
          subjectchooser = subtypehumanoid
      }
    }// build_dynamic_prompt.py LINE 1582

    if(mainchooser == "landscape")
      subjectchooser = randomChoice(locationsubjectchooserlist)

    if(mainchooser == "concept") {
      //eventsubjectchooserlist = ["event", "concept", "poemline", "songline"]
      subjectchooser = randomChoice(eventsubjectchooserlist)
      if(subtypeconcept != "all") {
        if(subtypeconcept == "event")
          subjectchooser = "event"
        else if(subtypeconcept == "the X of Y concepts")
          subjectchooser = "concept"
        else if(subtypeconcept == "lines from poems")
          subjectchooser = "poemline"
        else if(subtypeconcept == "lines from songs")
          subjectchooser = "songline"
        else if(subtypeconcept == "names from card based games")
          subjectchooser = "cardname"
        else if(subtypeconcept == "episode titles from tv shows")
          subjectchooser = "episodetitle"
        else if(subtypeconcept == "concept mixer")
          subjectchooser = "conceptmixer"
        else
          subjectchooser = subtypeconcept
      }
    }

    // After we chose the subject, lets set all things ready for He/She/It etc
    
    if(!less_verbose && (subjectchooser in ["manwomanmultiple"]) && givensubject != '' && subtypehumanoid != "multiple humans") {
      heshelist = ["they"]
      hisherlist = ["their"]
      himherlist = ["them"]
      // on rare occasions do "one of them"
      if(randint(0,20) == 0) {
        heshelist = ["one of them"]
        hisherlist = ["one of their"]
        himherlist = ["one of them"]
      }
    } else if(!less_verbose && subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation","firstname","manwomanmultiple"]) {
      if(gender == "male") {
        heshelist = ["he"]
        hisherlist = ["his"]
        himherlist = ["him"]
      }
      if(gender == "female") {
        heshelist = ["she"]
        hisherlist = ["her"]
        himherlist = ["her"]
      }
    }
    if(!less_verbose && subjectchooser in ["manwomanmultiple"] && givensubject == "") {
      heshelist = ["they"]
      hisherlist = ["their"]
      himherlist = ["them"]
      // on rare occasions do "one of them"
      if(randint(0,20) == 0) {
        heshelist = ["one of them"]
        hisherlist = ["one of their"]
        himherlist = ["one of them"]
      }
    } // build_dynamic_prompt.py LINE 1635


    // special modes        

    // start art blaster here
    if(artblastermode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(artistlist?.length))
          completeprompt += "-artist-, "
        if(uncommon_dist(insanitylevel) && Boolean(artmovementlist?.length))
          completeprompt += "-artmovement-, "
        if(unique_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
        if(unique_dist(insanitylevel) && Boolean(imagetypelist?.length))
          completeprompt += "-imagetype-, "
        if(unique_dist(insanitylevel) && Boolean(colorschemelist?.length))
          completeprompt += "-colorscheme-, "
        if(uncommon_dist(insanitylevel) && Boolean(artistlist?.length))
          completeprompt += "-artiststyle-, "
        step = step + 1
      }
    }


    // start unique art here
    if(uniqueartmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(othertypelist?.length))
          completeprompt += "-othertype-, "
        if(uncommon_dist(insanitylevel) && Boolean(artmovementlist?.length))
          completeprompt += "-artmovement-, "
        if(uncommon_dist(insanitylevel) && Boolean(colorschemelist?.length))
          completeprompt += "-colorscheme-, "
        if(rare_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
        if(rare_dist(insanitylevel) && Boolean(lightinglist?.length))
          completeprompt += "-lighting-, "
        if(unique_dist(insanitylevel) && Boolean(imagetypelist?.length))
          completeprompt += "-imagetype-, "
        if(unique_dist(insanitylevel) && Boolean(qualitylist?.length))
          completeprompt += "-quality-, "
        if(unique_dist(insanitylevel) && Boolean(artistlist?.length))
          completeprompt += "-artistdescription-, "
        
        step = step + 1
      }
    }

    // start quality vomit here
    if(qualityvomitmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
        if(uncommon_dist(insanitylevel) && Boolean(flufferlist?.length))
          completeprompt += "-fluff-, "
        if(uncommon_dist(insanitylevel) && Boolean(qualitylist?.length))
          completeprompt += "-quality-, "
        if(unique_dist(insanitylevel) && Boolean(minivomitlist?.length))
          completeprompt += "-minivomit-, "
        if(unique_dist(insanitylevel) && Boolean(artmovementlist?.length))
          completeprompt += "-artmovement-, "
        if(unique_dist(insanitylevel) && Boolean(colorschemelist?.length))
          completeprompt += "-colorscheme-, "
        step = step + 1
      }
    }

    // start mood color here
    if(colorcannonmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(moodlist?.length))
            completeprompt += "-mood-, "
        if(uncommon_dist(insanitylevel) && Boolean(colorschemelist?.length))
            completeprompt += "-colorscheme-, "
        if(rare_dist(insanitylevel) && Boolean(vomitlist?.length))
            completeprompt += "-vomit-, "
        if(unique_dist(insanitylevel) && Boolean(artmovementlist?.length))
            completeprompt += "-artmovement-, "
        if(unique_dist(insanitylevel) && Boolean(lightinglist?.length))
            completeprompt += "-lighting-, "
        if(unique_dist(insanitylevel) && Boolean(allstylessuffixlist?.length))
            completeprompt += "-allstylessuffix-, "
        step = step + 1 
      }
    }

    // start photo fantasy here
    if(photofantasymode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      if(common_dist(insanitylevel)) {
        if(uncommon_dist(insanitylevel))
          completeprompt += "-imagetypequality- "
        completeprompt += " photograph, "
      }
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(lightinglist?.length))
            completeprompt += "-photoaddition-, "
        if(uncommon_dist(insanitylevel) && Boolean(lightinglist?.length))
            completeprompt += "-lighting-, "
        if(uncommon_dist(insanitylevel) && Boolean(cameralist?.length))
            completeprompt += "-camera-, "
        if(rare_dist(insanitylevel) && Boolean(lenslist?.length))
            completeprompt += "-lens-, "
        if(unique_dist(insanitylevel) && Boolean(moodlist?.length))
            completeprompt += "-mood-, "
        if(unique_dist(insanitylevel) && Boolean(colorschemelist?.length))
            completeprompt += "-colorscheme-, "
        step = step + 1
      } 
    }

    // start massive madness here
    if(massivemadnessmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(rare_dist(insanitylevel) && Boolean(artistlist?.length))
          completeprompt += "-artist-, "
        if(rare_dist(insanitylevel) && Boolean(descriptorlist?.length))
          completeprompt += "-descriptor-, "
        if(rare_dist(insanitylevel) && Boolean(moodlist?.length))
          completeprompt += "-mood-, "
        if(rare_dist(insanitylevel) && Boolean(colorschemelist?.length))
          completeprompt += "-colorscheme-, "
        if(rare_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
        if(rare_dist(insanitylevel) && Boolean(artmovementlist?.length))
          completeprompt += "-artmovement-, "
        if(rare_dist(insanitylevel) && Boolean(lightinglist?.length))
          completeprompt += "-lighting-, "
        if(rare_dist(insanitylevel) && Boolean(minilocationadditionslist?.length))
          completeprompt += "-minilocationaddition-, "
        if(rare_dist(insanitylevel) && Boolean(materiallist?.length))
          completeprompt += "-material-, "
        if(rare_dist(insanitylevel) && Boolean(conceptsuffixlist?.length))
          completeprompt += "-conceptsuffix-, "
        if(rare_dist(insanitylevel) && Boolean(qualitylist?.length))
          completeprompt += "-quality-, "
        if(rare_dist(insanitylevel) && Boolean(cameralist?.length))
          completeprompt += "-camera-, "
        if(rare_dist(insanitylevel) && Boolean(lenslist?.length))
          completeprompt += "-lens-, "
        if(rare_dist(insanitylevel) && Boolean(imagetypelist?.length))
          completeprompt += "-imagetype-, "
        step = step + 1
      }
    } // build_dynamic_prompt.py LINE 1782

    // start styles mode here
    if(stylesmode) {
      const chosenstyle = randomChoice(styleslist)
      const chosenstyleprefix = chosenstyle.split("-subject-")[0]
      chosenstylesuffix = chosenstyle.split("-subject-")[1]
      completeprompt += chosenstyleprefix
    }

    if(dynamictemplatesmode) {
      if(artists == "none")
        dynamictemplatesprefixlist = dynamictemplatesprefixlist.filter(it => !it.toString().toLowerCase().includes("-artist-"))// [sentence for sentence in dynamictemplatesprefixlist if "-artist-" not in sentence.lower()]
      const chosenstyleprefix = randomChoice(dynamictemplatesprefixlist)
      completeprompt += chosenstyleprefix
      if(chosenstyleprefix[chosenstyleprefix.length - 1] == ".")
        completeprompt += " OR(Capturing a; Describing a;Portraying a;Featuring a)"
      else
        completeprompt += " OR(with a;capturing a; describing a;portraying a;of a;featuring a)"
    }


    // start artist part


    let artistsplacement = "front"
    // remove the artistsatbackchange to be depended on the insanitylevel, we would like this to be a set chance
    if(randint(0, 2) == 0 && !onlyartists) {
      const artistlocations = ["back", "middle"]
      artistsplacement = randomChoice(artistlocations)
    }

    if(artists != "none" && artistsplacement == "front" && generateartist) {
      doartistnormal = true
      if(artists == "greg mode") {
        artistbylist = ["art by", "designed by", "stylized by", "by"]
        completeprompt += randomChoice(artistbylist) + " -gregmode-, "
        doartistnormal = false
      }
      // in case we have ALL, we can also do a specific artist mode per chosen subject. sometimes
      else if(originalartistchoice == "all" && randint(0,3) == 0) {
        if(mainchooser in ["humanoid", "animal"]){
          artistbylist = ["art by", "designed by", "stylized by", "by"]
          completeprompt += randomChoice(artistbylist) + " OR(-portraitartist-;-characterartist-), OR(-portraitartist-;-characterartist-) OR(;and OR(-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-);uncommon), "
          doartistnormal = false
        }

        else if(mainchooser in ["landscape"]) {
          artistbylist = ["art by", "designed by", "stylized by", "by"]
          completeprompt += randomChoice(artistbylist) + " OR(-landscapeartist-;-digitalartist-), OR(-landscapeartist-;-graphicdesignartist-) OR(;and OR(-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-);uncommon), "
          doartistnormal = false
        }

        else if(subjectchooser in ["building"]) {
          artistbylist = ["art by", "designed by", "stylized by", "by"]
          completeprompt += randomChoice(artistbylist) + " OR(-landscapeartist-;-architectartist-), OR(-landscapeartist-;-architectartist-) OR(;and OR(-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-);uncommon), "
          doartistnormal = false
        }

        // else sometimes to something like this?
        else if(randint(0,5) == 0) {
          artistbylist = ["art by", "designed by", "stylized by", "by"]
          completeprompt += randomChoice(artistbylist) + " OR(-portraitartist-;-characterartist-;-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-), OR(-portraitartist-;-characterartist-;-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-) and OR(-portraitartist-;-characterartist-;-fantasyartist-;-scifiartist-;-photographyartist-;-digitalartist-;-graphicdesignartist-)"
          doartistnormal = false
        }
      }



      if(doartistnormal) {
        // take 1-3 artists, weighted to 1-2
        let step = randint(0, 1)
        let minstep = step
        let end = randint(1, insanitylevel3)


        // determine artist mode:
        // normal
        // hybrid |
        // switching A:B:X
        // adding at step x  a:X
        // stopping at step x ::X
        // enhancing from step  x




        const modeselector = randint(0,10)
        if (modeselector < 5 && end - step >= 2) {
          const artistmodeslist = ["hybrid", "stopping", "adding", "switching", "enhancing"]
          artistmode = artistmodeslist[modeselector]
          if(advancedprompting == false)
            artistmode = "normal"
          if (artistmode in ["hybrid","switching"] && end - step == 1)
            artistmode = "normal"
        }
        
        if(onlyartists && artistmode == "enhancing")
          artistmode = "normal"
        // if there are not enough artists in the list, then just go normal
        if(artistlist.length < 3)
          artistmode = "normal"
        if(onlyartists && step == end)
          step = step - 1

        if (artistmode in ["hybrid", "stopping", "adding","switching"])
          completeprompt += " ["
            
        while (step < end) {
          if(normal_dist(insanitylevel) && remove_weights == false)
            isweighted = 1
          
          if (isweighted == 1)
            completeprompt += " ("

          //completeprompt = add_from_csv(completeprompt, "artists", 0, "art by ","")
          if(step == minstep) {
            // sometimes do this
            if(giventypeofimage=="" && imagetype == "all" && randint(0, 1) == 0) {
              if(artiststyleselectormode == "normal")
                completeprompt += artiststyleselector + " art "
              else
                completeprompt += "-artiststyle- art "
            }
            artistbylist = ["art by", "designed by", "stylized by", "by"]
          }
          else
            artistbylist = [""]
          completeprompt += randomChoice(artistbylist) + " -artist-"
          
          if (isweighted == 1)
            completeprompt += ":" + (1 + (randint(-3,3)/10)).toString() + ")"       
          
          if (artistmode in ["hybrid"] && !(end - step == 1))
            completeprompt += "|"
          if (artistmode in ["switching"] && !(end - step == 1))
            completeprompt += ":"
          
          if (!(["hybrid", "switching"].includes(artistmode)) && !(end - step > 1))
            completeprompt += ","
          else if (!(["hybrid", "switching"].includes(artistmode)) && !(end - step == 1))
            completeprompt += " and "
          
          isweighted = 0
          
          step = step + 1
        }

        if (artistmode in ["stopping"]) {
          completeprompt += "::"
          completeprompt += randint(1,19).toString()
        }
        
        if (artistmode in ["switching","adding"])
          completeprompt += ":" + randint(1,18)
        if (artistmode in ["hybrid", "stopping","adding", "switching"])
          completeprompt += "] "
      }


      if(onlyartists) {
        //Parse or statements
        completeprompt = parse_custom_functions(completeprompt, insanitylevel)

        // replace artist wildcards
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-artist-", artistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-gregmode-", gregmodelist, false, false)

        completeprompt = replacewildcard(completeprompt, insanitylevel, "-fantasyartist-", fantasyartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-popularartist-", popularartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-romanticismartist-", romanticismartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-photographyartist-", photographyartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-portraitartist-", portraitartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-characterartist-", characterartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-landscapeartist-", landscapeartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-scifiartist-", scifiartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-graphicdesignartist-", graphicdesignartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-digitalartist-", digitalartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-architectartist-", architectartistlist, false, false)
        completeprompt = replacewildcard(completeprompt, insanitylevel, "-cinemaartist-", cinemaartistlist, false, false)
            
        // clean it up
        completeprompt = cleanup(completeprompt, advancedprompting, insanitylevel)

        console.log("only generated these artists:" + completeprompt)
        return completeprompt
      }


      completeprompt += ", "

      
      // sometimes do this as well
      if(giventypeofimage=="" && imagetype == "all" && randint(0, 2) == 0)
        completeprompt += "-artiststyle- art, "


      if (artistmode in ["enhancing"])
        completeprompt += " ["
    } // build_dynamic_prompt.py LINE 1969
    

    // start tokinator here
    if(thetokinatormode) {
      let tokinatorsubtype = ["personification", "human form", "object", "landscape", "OR(creature;beast;animal;myth;concept;world;planet)", "building", "location", "shape", "being", "-token-"]
      if(anime_mode && gender == "male")
        tokinatorsubtype = ["(1boy, solo)"]
      if(anime_mode && gender == "female")
        tokinatorsubtype = ["(1girl, solo)"]
      if(chance_roll(insanitylevel,"normal")) {
        if(chance_roll(insanitylevel,"normal") && remove_weights == false)
          completeprompt += "(OR(;-imagetypequality-;uncommon) OR(-imagetype-;-othertype-;rare):1.3) "
        else
          completeprompt += "OR(;-imagetypequality-;uncommon) OR(-imagetype-;-othertype-;rare) "
      }
      completeprompt += randomChoice(tokinatorlist)
      completeprompt = completeprompt.replace("-tokensubtype-", randomChoice(tokinatorsubtype))

      if(givensubject.includes("subject") && smartsubject)
        givensubject = givensubject.replace("subject", "-token-")

      if(givensubject == "" && overrideoutfit == "")
        completeprompt = completeprompt.replace("-subject-", "-token-")
      else if(givensubject == "" && overrideoutfit != "" &&  !completeprompt.includes("-outfit-"))
        completeprompt = completeprompt.replace("-subject-", "-token- wearing a OR(-token-;;normal) -outfit-")
      else if(givensubject != "" && overrideoutfit != "" &&  !completeprompt.includes("-outfit-"))
        completeprompt = completeprompt.replace("-subject-", givensubject + " wearing a OR(-token-;;normal) -outfit-")
      else
        completeprompt = completeprompt.replace("-subject-", givensubject)
      
      if(overrideoutfit == "")
        completeprompt = completeprompt.replace("-outfit-", "-token-")
      else
        completeprompt = completeprompt.replace("-outfit-", overrideoutfit)
    } // build_dynamic_prompt.py LINE 2002

        


    // start image type
    // @ts-ignore
    if(giventypeofimage == "" && (imagetype == "none" || giventypeofimage == "none") )
      generatetype = false
    if(giventypeofimage=="" && generatetype) {
      if(imagetype != "all" && imagetype != "all - force multiple" && imagetype != "only other types" && imagetype != "all - anime")
        completeprompt += " " + imagetype + ", "
      else if(imagetype == "all - force multiple" || unique_dist(insanitylevel) && !anime_mode)
        amountofimagetypes = randint(2,3)
      else if(imagetype == "only other types") {
        if(amountofimagetypes < 2 && randint(0,2) == 0) {
          partlystylemode = true
          console.log("Ohhh! Adding some secret sauce to this prompt")
          const chosenstyle = randomChoice(styleslist)
          const chosenstyleprefix = chosenstyle.split("-subject-")[0]
          chosenstylesuffix = chosenstyle.split("-subject-")[1]

          completeprompt += " " + chosenstyleprefix + ", "
        } else {
          othertype = 1
          completeprompt += randomChoice(othertypelist)
        }
      }
      
      if((imagetype == "all" || imagetype == "all - anime") && chance_roll(insanitylevel, imagetypechance) && amountofimagetypes <= 1)
        amountofimagetypes = 1

      // on lower insanity levels, almost force this
      if((imagetype == "all" || imagetype == "all - anime") && insanitylevel <= 3 && amountofimagetypes <= 1 && randint(0,1)== 0)
        amountofimagetypes = 1

      if((imagetype == "all" || imagetype == "all - anime") && insanitylevel <= 2 && amountofimagetypes <= 1)
        amountofimagetypes = 1

      for (let i = 0;i < amountofimagetypes;i++) {
        // one in 6 images is a complex/other type
        if((chance_roll(insanitylevel, imagetypequalitychance) || originalartistchoice == "greg mode") && generateimagetypequality)
          completeprompt += "-imagetypequality- "
      
        if(imagetype == "all - anime" && !anime_mode)
          completeprompt += " anime"
        if(randint(0,4) < 4 && insanitylevel > 3 )
          // woops, never to this as wildcards. We need to know as early as possible wether something is a photo. Lets put it back!
          completeprompt += " " + randomChoice(imagetypelist) + ", "
        else if(randint(0,1) == 0 && insanitylevel <= 3)
          completeprompt += " " + randomChoice(imagetypelist) + ", "
        else if(!anime_mode) {
          if(amountofimagetypes < 2 && randint(0,1) == 0) {
            partlystylemode = true
            console.log("Ohhh! Adding some secret sauce to this prompt")
            const chosenstyle = randomChoice(styleslist)
            chosenstyleprefix = chosenstyle.split("-subject-")[0]
            chosenstylesuffix = chosenstyle.split("-subject-")[1]

            completeprompt += " " + chosenstyleprefix + ", "
          } else {
            othertype = 1
            completeprompt += " " + randomChoice(othertypelist) + ", "
          }
        }
      }
      
      if(othertype==1)
        completeprompt += " of a "
      else
        completeprompt += ", "
    } else if (generatetype) {
      othertype = 1
      completeprompt += giventypeofimage + " of a "
    } // build_dynamic_prompt.py LINE 2074


    //// do less insane stuff while working for superprompter
    if(superprompter)
      insanitylevel = Math.max(1, insanitylevel-4)
    ////// here we can do some other stuff to spice things up
    if(chance_roll(insanitylevel, minilocationadditionchance) && generateminilocationaddition)
      completeprompt += " -minilocationaddition-, "
    
    if(chance_roll(insanitylevel, artmovementprefixchance) && generateartmovement) {
      generateartmovement = false
      completeprompt += " -artmovement-, "
    }
    
    if(chance_roll(insanitylevel, minivomitprefix1chance) && generateminivomit)
      completeprompt += " -minivomit-, "
    
    if(chance_roll(insanitylevel, minivomitprefix2chance) && generateminivomit)
      completeprompt += " -minivomit-, " // build_dynamic_prompt.py LINE 2092

    // start shot size

    if(mainchooser in ["object", "animal", "humanoid", "concept"] && othertype == 0 && !completeprompt.includes('portrait') && generateshot && chance_roll(insanitylevel,shotsizechance))
      completeprompt += "-shotsize- of a "
    else if(completeprompt.includes('portrait') && generateshot && !partlystylemode)
      completeprompt += " , close up of a "
    else if(mainchooser in ["landscape"] && generateshot && !partlystylemode)
      completeprompt += " landscape of a "
    else if(generateshot)
      completeprompt += ", "

    let genjoboractivity = false
    // start subject building

    // divider between subject and everything else
    completeprompt += " @@@ " // build_dynamic_prompt.py LINE 2111
            
  }

}