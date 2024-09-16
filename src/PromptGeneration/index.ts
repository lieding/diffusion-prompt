import { csv_to_list, csv_to_list_ } from "./helpers/csvUtil";
import {
  arrayRemove,
  artist_category_by_category_csv_to_list,
  artist_category_csv_to_list, artist_descriptions_csv_to_list, chance_roll, common_dist, extraordinary_dist, legendary_dist, load_all_artist_and_category, load_config_csv,
  normal_dist, novel_dist, randint, randomChoice, rare_dist, SeededRandom, shuffle, uncommon_dist, unique_dist
} from "./helpers/general";
import { customizedLogger } from "./helpers/logger";
import { OneButtonPresets } from "./helpers/presets";
import { translate_main_subject } from "./helpers/subjectUtils";
import { answerBySuperprompt, loadSuperpromptV1Model } from "./models/superprompter-v1";

const OBPresets = new OneButtonPresets();

function split_prompt_to_words(text: string) {
  // first get all the words

  // Use a regular expression to replace non-alphabetic characters with spaces
  text = text.replace(/[^a-zA-Z,-]/g, ' ') //completeprompt.replaceAll(r'[^a-zA-Z,-]', ' ', text)

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

function replaceMatch(match: RegExpMatchArray) {
  // Extract the first word from the match
  const words = match[0].slice(1, -1).split('|');
  return words[0];
}

function cleanup(completeprompt: string, advancedprompting: boolean, insanitylevel = 5) {
  // This part is turned off, will bring it back later as an option
    
  // first, move LoRA's to the back dynamically

  // Find all occurrences of text between < and > using regex
  // allLoRA = re.findall(r"<[^>]+>", completeprompt)

  // Remove the extracted matches from completeprompt
  // completeprompt = completeprompt.replaceAll(r"<[^>]+>", "", completeprompt)


  // if we are not using advanced prompting, remove any hybrid stuff:
  if(!advancedprompting) {
    const hybridPattern = /\[\w+\|\w+\]/g;
    // Replace the matched pattern with the first word in the group
    completeprompt = completeprompt.replace(hybridPattern, (match) => replaceMatch(match.match(hybridPattern)!));

    // Doesnt work if there are multiple words, so then just get rid of things as is :D
    completeprompt = completeprompt.replaceAll("[", " ")
    completeprompt = completeprompt.replaceAll("]", " ")
    completeprompt = completeprompt.replaceAll("|", " ")
  }

  // sometimes if there are not enough artist, we get left we things formed as (:1.2)
  completeprompt = completeprompt.replace(/\(\:\d+\.\d+\)/g, '')

  // lets also remove some wierd stuff on lower insanitylevels
  if(insanitylevel < 7) {
    completeprompt = completeprompt.replaceAll("DayGlo", " ")
    completeprompt = completeprompt.replaceAll("fluorescent", " ")
  }

  // all cleanup steps moved here
  completeprompt = completeprompt.replace(/\[ /g, '[')
  completeprompt = completeprompt.replace(/\[,/g, '[',)
  completeprompt = completeprompt.replace(/ \]/g, ']')
  completeprompt = completeprompt.replace(/ \|/g, '|')
  //completeprompt = completeprompt.replaceAll(r' \"', '\"', completeprompt)
  //completeprompt = completeprompt.replaceAll(r'\" ', '\"', completeprompt)
  completeprompt = completeprompt.replace(/\( /g, '(')
  completeprompt = completeprompt.replace(/ \(/g, '(')
  completeprompt = completeprompt.replace(/\) /g, ')')
  completeprompt = completeprompt.replace(/ \)/g, ')')

  completeprompt = completeprompt.replaceAll(' :', ':')
  completeprompt = completeprompt.replaceAll(',::', '::')
  completeprompt = completeprompt.replaceAll(',:', ':')

  completeprompt = completeprompt.replaceAll(',,', ', ')
  completeprompt = completeprompt.replaceAll(',,', ', ')
  completeprompt = completeprompt.replaceAll(',,,', ', ')
  completeprompt = completeprompt.replaceAll(', ,', ',')
  completeprompt = completeprompt.replaceAll(' , ', ', ')
  completeprompt = completeprompt.replaceAll(' ,', ',')
  completeprompt = completeprompt.replaceAll(' ,', ',')
  completeprompt = completeprompt.replaceAll(' ,', ',')
  completeprompt = completeprompt.replace(/,\(/g, ', (')



  while (completeprompt.includes("  "))
    completeprompt = completeprompt.replaceAll('  ', ' ')
  completeprompt = completeprompt.replaceAll('a The', 'The')
  completeprompt = completeprompt.replaceAll('the the', 'the')
  completeprompt = completeprompt.replaceAll(', ,', ',')
  completeprompt = completeprompt.replaceAll(',,', ',')

  completeprompt = completeprompt.replaceAll(', of a', ' of a')
  completeprompt = completeprompt.replaceAll('of a,', 'of a')
  completeprompt = completeprompt.replaceAll('of a of a', 'of a')
  completeprompt = completeprompt.replaceAll(' a a ', ' a ')

  // a / an
  completeprompt = completeprompt.replaceAll(' a a', ' an a')
  completeprompt = completeprompt.replaceAll(' a e', ' an e')
  completeprompt = completeprompt.replaceAll(' a i', ' an i')
  completeprompt = completeprompt.replaceAll(' a u', ' an u')
  completeprompt = completeprompt.replaceAll(' a o', ' an o')


  completeprompt = completeprompt.replaceAll('art art', 'art')
  completeprompt = completeprompt.replaceAll('Art art', 'art')
  completeprompt = completeprompt.replaceAll('lighting lighting', 'lighting')
  completeprompt = completeprompt.replaceAll('Lighting lighting', 'lighting')
  completeprompt = completeprompt.replaceAll('light lighting', 'light')
  completeprompt = completeprompt.replaceAll('-artiststyle- art,', '')
  completeprompt = completeprompt.replaceAll('-artiststyle- art', '')
  completeprompt = completeprompt.replaceAll('-artiststyle-', '')
  completeprompt = completeprompt.replaceAll('-artistmedium-', '')
  completeprompt = completeprompt.replaceAll('-artistdescription-', '')
  completeprompt = completeprompt.replaceAll('- art ', '')

  completeprompt = completeprompt.replaceAll('anime anime', 'anime')
  completeprompt = completeprompt.replaceAll('anime, anime', 'anime')

  completeprompt = completeprompt.replaceAll('shot shot', 'shot')
  

  completeprompt = completeprompt.replaceAll('a his', 'his')
  completeprompt = completeprompt.replaceAll('a her', 'her')
  completeprompt = completeprompt.replaceAll('they is', 'they are')
  completeprompt = completeprompt.replaceAll('they has', 'they have')

  // some space tricks
  completeprompt = completeprompt.replaceAll('- shaped', '-shaped')
  completeprompt = completeprompt.replaceAll('echa- ', 'echa-')
  completeprompt = completeprompt.replaceAll('style -', 'style-')
  completeprompt = completeprompt.replaceAll(', as a', ' as a')


  //small fix for multisubject thing
  completeprompt = completeprompt.replaceAll('a 2', '2')
  completeprompt = completeprompt.replaceAll('a 3', '3')
  completeprompt = completeprompt.replaceAll('a 4', '4')
  completeprompt = completeprompt.replaceAll('a 5', '5')


  // clean up some hacky multiples with adding a s to the end
  completeprompt = completeprompt.replaceAll('fs ', 'ves ')
  completeprompt = completeprompt.replaceAll('fs,', 'ves,')
  completeprompt = completeprompt.replaceAll('sss ', 'ss ')
  completeprompt = completeprompt.replaceAll('sss,', 'ss,')
  completeprompt = completeprompt.replaceAll(' Mans', ' Men,')
  completeprompt = completeprompt.replaceAll(' mans', ' men')
  completeprompt = completeprompt.replaceAll(' Womans,', ' Women')
  completeprompt = completeprompt.replaceAll(' womans,', ' women,')
  completeprompt = completeprompt.replace(/\(Mans/g, '(Men,')
  completeprompt = completeprompt.replace(/\(mans/g, '(men')
  completeprompt = completeprompt.replace(/\(Womans/g, '(Women')
  completeprompt = completeprompt.replace(/\(womans/g, '(women')

  completeprompt = completeprompt.replaceAll('-sameothersubject-', 'it')
  completeprompt = completeprompt.replaceAll('-samehumansubject-', 'the person')

  
  completeprompt = completeprompt.replace(/(?<!\()\s?\(/g, ' (')
  completeprompt = completeprompt.replace(/\)(?![\s)])/g, ') ')

  // Move the extracted LoRA's to the end of completeprompt
  //completeprompt += " " + " ".join(allLoRA)   

  completeprompt = completeprompt.replaceAll(' . ', '. ')
  completeprompt = completeprompt.replaceAll(', . ', '. ')
  completeprompt = completeprompt.replaceAll(',. ', '. ')
  completeprompt = completeprompt.replaceAll('., ', '. ')
  completeprompt = completeprompt.replaceAll('. . ', '. ')

  completeprompt = completeprompt.replaceAll(", ", '')

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
    completeprompt = completeprompt.replaceAll(completematch, or_replacement)
  }
  return completeprompt
}

async function artify_prompt(insanitylevel = 5, prompt = "", artists = "all", amountofartists = "1", mode = "standard", seed = -1) {
  let intamountofartists = 0
  if(amountofartists=="random")
    intamountofartists = randint(1,Math.floor((insanitylevel/3) + 1.20))
  else    
    intamountofartists = Math.floor(Number(amountofartists) ?? 1)

  // set seed
  // For use in ComfyUI (might bring to Automatic1111 as well)
  // lets do it when its larger than 0
  // Otherwise, just do nothing and it will keep on working based on an earlier set seed
  //if(seed > 0)
  //  random.seed(seed)
  const randInst = new SeededRandom(seed);

  // first build up a complete anti list. Those values are removing during list building
  // this uses the antivalues string AND the antilist.csv
  let emptylist: string[] = []
  let antilist = await csv_to_list("antilist", emptylist , "/userfiles/",1)
  
  // clean up antivalue list:
  antilist = antilist.map(it => it.toString().trim().toLowerCase()) // [s.strip().lower() for s in antilist]

    // build artists list
  if (artists == "wild")
    artists = "all (wild)"

  // we want to create more cohorence, so we are adding all (wild) mode for the old logic
  
  let artisttypes = ["popular", "3D",	"abstract",	"angular", "anime"	,"architecture",	"art nouveau",	"art deco",	"baroque",	"bauhaus", 	"cartoon",	"character",	"children's illustration", 	"cityscape", "cinema",	"clean",	"cloudscape",	"collage",	"colorful",	"comics",	"cubism",	"dark",	"detailed", 	"digital",	"expressionism",	"fantasy",	"fashion",	"fauvism",	"figurativism",	"graffiti",	"graphic design",	"high contrast",	"horror",	"impressionism",	"installation",	"landscape",	"light",	"line drawing",	"low contrast",	"luminism",	"magical realism",	"manga",	"melanin",	"messy",	"monochromatic",	"nature",	"photography",	"pop art",	"portrait",	"primitivism",	"psychedelic",	"realism",	"renaissance",	"romanticism",	"scene",	"sci-fi",	"sculpture",	"seascape",	"space",	"stained glass",	"still life",	"storybook realism",	"street art",	"streetscape",	"surrealism",	"symbolism",	"textile",	"ukiyo-e",	"vibrant",	"watercolor",	"whimsical"]
  let artiststyleselector = ""
  let artiststyleselectormode = "normal"
  artiststyleselector = artisttypes[randInst.randomRange(0, artisttypes.length - 1)]

  let artistlist: string[] = []
  // create artist list to use in the code, maybe based on category  or personal lists
  if(artists != "all (wild)" && artists != "all" && artists != "none" && artists.startsWith("personal_artists") == false && artists.startsWith("personal artists") == false && artists in artisttypes)
    artistlist = await artist_category_csv_to_list("artists_and_category",artists)
  else if(artists.startsWith("personal_artists") || artists.startsWith("personal artists")) {
    artists = artists.replaceAll(" ", "_") // add underscores back in
    artistlist = (await csv_to_list(artists,antilist,"/userfiles/")) as string[]
  }
  else if(artists != "none")
    artistlist = (await csv_to_list("artists",antilist)) as string[]
  

  // load up the styles list for the other modes
  let styleslist = await csv_to_list("styles", antilist,"/csvfiles/templates/",0,"?")
  let stylessuffix = styleslist.map(it => it.toString().split('-subject-')[1]) // [item.split('-subject-')[1] for item in styleslist]
  let breakstylessuffix = stylessuffix.map(it => it.split(',')) // [item.split(',') for item in stylessuffix]
  let allstylessuffixlist = breakstylessuffix.flat(10)
  allstylessuffixlist = Array.from(new Set(allstylessuffixlist))

  let artistsuffix = await artist_descriptions_csv_to_list("artists_and_category")
  let breakartiststylessuffix = artistsuffix.map(it => it.split(',')) // [item.split(',') for item in artistsuffix]
  let artiststylessuffixlist = breakartiststylessuffix.flat(10)
  artiststylessuffixlist = Array.from(new Set(artiststylessuffixlist))
  allstylessuffixlist = [...allstylessuffixlist, ...artiststylessuffixlist]

  let completeprompt = ""
  if(common_dist(insanitylevel))
    completeprompt += "-artiststyle- "
  completeprompt += "art by "
  //Lets go effing artify this MF'er
      
  for (let i = 0;i < intamountofartists;i++) {
    if(intamountofartists > 1 && i == intamountofartists - 2)
      completeprompt += "-artist- and "
    else
      completeprompt += "-artist-, "
  }
  
  if(uncommon_dist(insanitylevel))
    completeprompt += "-artistmedium-, " 
          
  // now add the prompt in
  completeprompt += prompt

  if(mode.toLowerCase() == "remix") {
    for (let i = 0;i < intamountofartists;i++) {
      const item = artistsuffix[randInst.randomRange(0, artistsuffix.length - 1)]
      completeprompt += ", " + artistsuffix.splice(artistsuffix.indexOf(item), 1)[0]
    }
  }

  else if(mode.toLowerCase() == "super remix turbo") {
    for (let i = 0;i < intamountofartists * 4;i++) {
      const it = allstylessuffixlist[randInst.randomRange(0, allstylessuffixlist.length - 1)]
      completeprompt += ", " + allstylessuffixlist.splice(allstylessuffixlist.indexOf(it), 1)[0]
    }
  }

  else {
    // else just go standard
    for (let i = 0;i < intamountofartists;i++)
      completeprompt += ", -artistdescription-"
  }
  
  while (completeprompt.includes("-artist-"))
    completeprompt = await replacewildcard(completeprompt,5,"-artist-", artistlist,false,false,artiststyleselector)

  return completeprompt
}

async function enhance_positive(positive_prompt = "", amountofwords = 3) {
  const wordcombilist = await csv_to_list_({csvfilename:"wordcombis", directory:"/csvfiles/special_lists/",delimiter:"?", antilist:[]})

  // do a trick for artists, replace with their tags instead
  const { artistlist, categorylist } = await load_all_artist_and_category()
  // lower them
  const artist_names = artistlist.map(it => it.trim().toLowerCase())

  // note, should we find a trick for some shorthands of artists??
  const artistshorthands = await csv_to_list_({csvfilename:"artistshorthands",directory:"/csvfiles/special_lists/",delimiter:"?", antilist:[]})
  for (const shorthand of artistshorthands) {
    const parts = shorthand.toString().split(';')
    if (positive_prompt.includes(parts[0]))
      positive_prompt = positive_prompt.toLowerCase().replaceAll(parts[0].toLowerCase(), parts[1].toLowerCase())
  }

  for (const i in artistlist) {
    const artist_name = artistlist[i]
    const category = categorylist[i]
    positive_prompt = positive_prompt.toLowerCase().replaceAll(artist_name, category)
  }

  let allwords = split_prompt_to_words(positive_prompt)
  allwords = allwords.map(it => it.trim().toLowerCase()) // lower them

  let newwordlist: string[] = []
  let addwords = ""
  let wordsfound = 0
  
  //lower all!

  for (const combiset of wordcombilist.map(it => it.toString())) {
    const combiwords = new Set(combiset.split(', '))
    for (const combiword of combiwords) {
      for (const word of allwords) {
        if(word.toLowerCase() == combiword.toLowerCase()) {
          wordsfound += 1
          let combiwords2 = Array.from(new Set(combiset.split(', ')))
          // remove and only take one
          combiwords2 = combiwords2.filter(it => !allwords.includes(it)) //[word for word in combiwords2 if word not in allwords]
          //for combiword2 in combiwords2:
          if(combiwords2.length)
            newwordlist.push(randomChoice(combiwords2))
        }
      }
    }
  }
  
  newwordlist = newwordlist.filter(it => !allwords.includes(it)) // [word for word in newwordlist if word not in allwords]
  newwordlist = Array.from(new Set(newwordlist)) // make unique
  
  
  for (let i = 0;i < amountofwords;i++) {
    if(newwordlist.length > 0) {
      const word = newwordlist.splice(randint(0, newwordlist.length), 1)[0]
      addwords += ", " + word
      //print(addwords)
    }
  }
  

  return addwords
}

async function replacewildcard(
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
    completeprompt = completeprompt.replace(wildcard, "")
  else {
    while (completeprompt.includes(wildcard)) {
      let replacementvalue = ''
      if(unique_dist(insanitylevel) && activatehybridorswap && listname.length>2 && advancedprompting) {
        const hybridorswaplist = ["hybrid", "swap"]
        let hybridorswap = randomChoice(hybridorswaplist)
        replacementvalue = randomChoice(listname)
        arrayRemove(listname, replacementvalue)
        let hybridorswapreplacementvalue = "[" + replacementvalue
        
        if(hybridorswap == "hybrid") {
          replacementvalue = randomChoice(listname)
          arrayRemove(listname, replacementvalue)
          hybridorswapreplacementvalue += "|" + replacementvalue + "] "
        }
        if(hybridorswap == "swap") {
          replacementvalue = randomChoice(listname)
          arrayRemove(listname, replacementvalue)
          hybridorswapreplacementvalue += ":" + replacementvalue + ":" + randint(1,20) +  "] "
        }
        
        completeprompt = completeprompt.replaceAll(wildcard, hybridorswapreplacementvalue)
      }
      
      //if list is not empty
      if(Boolean(listname?.length)) {
        replacementvalue = randomChoice(listname)
        if(!["-heshe-", "-himher-","-hisher-"].includes(wildcard))
          arrayRemove(listname, replacementvalue)
      } else
        replacementvalue = ""

      // override for artist and artiststyle, only for first artist
      if(wildcard == "-artist-" && (completeprompt.includes("-artiststyle-") || completeprompt.includes("-artistmedium-") || completeprompt.includes("-artistdescription-"))) {
        let artiststyles = []
        let artiststyle: string[] = []
        let chosenartiststyle = ""
        let artistscomplete = await artist_category_by_category_csv_to_list("artists_and_category",replacementvalue)
        artiststyles = artistscomplete[0]
        let artistmediums = artistscomplete[1]
        let artistdescriptions = artistscomplete[2]
        artiststyle = artiststyles[0].split(",").map(x => x.trim())

        artiststyle = artiststyle.filter(x => x?.length) // remove empty values

        if(artiststyleselector in artiststyle)
          arrayRemove(artiststyle, artiststyleselector)

        // Sorry folks, this only works when you directly select it as a style
        if("nudity" in artiststyle)
          arrayRemove(artiststyle, "nudity")

        // keep on looping until we have no more wildcards or no more styles to choose from
        // leftovers will be removed in the cleaning step
        while (Boolean(artiststyle.length) && completeprompt.includes("-artiststyle-")) {
          chosenartiststyle = randomChoice(artiststyle)
          completeprompt = completeprompt.replace("-artiststyle-",chosenartiststyle)
          arrayRemove(artiststyle, chosenartiststyle)
        }

        if(completeprompt.includes("-artistmedium-")) {
          if(!completeprompt.toLowerCase().includes(artistmediums[0].toLowerCase()))
            completeprompt = completeprompt.replace("-artistmedium-",artistmediums[0])
        }

        if(completeprompt.includes("-artistdescription-"))
          completeprompt = completeprompt.replace("-artistdescription-",artistdescriptions[0])
        
        while (Boolean(artiststyle.length) && completeprompt.includes("-artiststyle-")) {
          chosenartiststyle = randomChoice(artiststyle)
          completeprompt = completeprompt.replace("-artiststyle-",chosenartiststyle)
          arrayRemove(artiststyle, chosenartiststyle)
        }
      }

      
      
      // Sneaky overrides for "same" wildcards
      // Are overwritten with their first parent
      if(wildcard == "-outfit-" || wildcard == "-minioutfit-")
        completeprompt = completeprompt.replace("-sameoutfit-", replacementvalue)

      let replacementvalueforoverrides = ''
      // Why do it in this detail?? Because we can:
      // Check if "from" exists in the string. For example Chun Li from Streetfighter, becomes Chun li
      if (replacementvalue.includes('from')) {
        // Find the index of "from" in the string
        const from_index = replacementvalue.indexOf("from")

        // Remove everything from and including "from"
        replacementvalueforoverrides = replacementvalue.slice(0, from_index).trim()
      } else
        replacementvalueforoverrides = replacementvalue

      if(wildcard in [
        "-human-"
        ,"-humanoid-"
        , "-manwoman-"
        , "-manwomanrelation-"
        , "-manwomanmultiple-"
        ] && completeprompt.includes("-samehumansubject-")
      ) {
        if(completeprompt.indexOf(wildcard) < completeprompt.indexOf("-samehumansubject-"))
          completeprompt = completeprompt.replaceAll("-samehumansubject-", "the " + replacementvalueforoverrides)
      }
      
      if(wildcard in [
        "-fictional-"
        , "-nonfictional-"
        , "-firstname-"
        , "-oppositefictional-"
        , "-oppositenonfictional-"
      ] && completeprompt.includes("-samehumansubject-" )) {
        if(completeprompt.indexOf(wildcard) < completeprompt.indexOf("-samehumansubject-"))
          completeprompt = completeprompt.replaceAll("-samehumansubject-", replacementvalueforoverrides)
      }
      
      // job is here, to prevent issue with a job outfit being replace. So doing it later solves that issue
      if(wildcard in ["-job-"] && completeprompt.includes("-samehumansubject-")) {
        if(completeprompt.indexOf(wildcard) < completeprompt.indexOf("-samehumansubject-"))
          completeprompt = completeprompt.replaceAll("-samehumansubject-", "the " + replacementvalueforoverrides)
      }
      
      
      // This one last, since then it is the only subject we have left
      if(["-malefemale-"].includes(wildcard)
          && completeprompt.includes("-samehumansubject-")
      ) {
        if(completeprompt.indexOf(wildcard) < completeprompt.indexOf("-samehumansubject-"))
          completeprompt = completeprompt.replaceAll("-samehumansubject-", "the " + replacementvalueforoverrides)
      }

      if(wildcard in [
        "-animal-"                         
        , "-object-"
        , "-vehicle-"
        , "-food-"
        , "-objecttotal-" 
        , "-space-"
        , "-flora-"
        , "-location-"
        , "-building-"]
        &&  completeprompt.includes("-sameothersubject-")
      ) {
        if(completeprompt.indexOf(wildcard) < completeprompt.indexOf("-sameothersubject-"))
          completeprompt = completeprompt.replaceAll("-sameothersubject-", "the " + replacementvalueforoverrides)
      }

      completeprompt = completeprompt.replace(wildcard, replacementvalue)
    }
  }

  return completeprompt
}

async function replace_user_wildcards(completeprompt: string) {
  for (let i = 0;i < 10; i++) {
    const user_wildcards_list = Array.from(completeprompt.match(/-[\w_]*-/g) ?? [])
    for (const user_wildcard of user_wildcards_list) {
      const user_wildcard_clean = user_wildcard.replaceAll("-", '')
      const wordlist = await csv_to_list_({csvfilename:user_wildcard_clean, directory:"/userfiles/wildcards/", antilist: []})
      if(wordlist?.length)
        completeprompt = completeprompt.replace(user_wildcard, randomChoice(wordlist))
    }
  }

  return completeprompt
}

function check_completeprompt_include (completeprompt: string) {
  const arr = [
    "-color-",
    "-material-",
    "-animal-",
    "-object-",
    "-fictional-",
    "-nonfictional-",
    "-conceptsuffix-",
    "-building-",
    "-vehicle-",
    "-outfit-",
    "-location-",
    "-conceptprefix-",
    "-descriptor-",
    "-food-",
    "-haircolor-",
    "-hairstyle-",
    "-job-",
    "-culture-",
    "-accessory-",
    "-humanoid-",
    "-manwoman-",
    "-human-",
    "-colorscheme-",
    "-mood-",
    "-genderdescription-",
    "-artmovement-",
    "-malefemale-",
    "-objecttotal-",
    "-outfitprinttotal-",
    "-bodytype-",
    "-minilocation-",
    "-minilocationaddition-",
    "-pose-",
    "-season-",
    "-minioutfit-",
    "-elaborateoutfit-",
    "-minivomit-",
    "-vomit-",
    "-rpgclass-",
    "-subjectfromfile-",
    "-outfitfromfile-",
    "-brand-",
    "-space-",
    "-artist-",
    "-imagetype-",
    "-othertype-",
    "-quality-",
    "-lighting-",
    "-camera-",
    "-lens-",
    "-imagetypequality-",
    "-poemline-",
    "-songline-",
    "-greatwork-",
    "-fantasyartist-", 
    "-popularartist-", 
    "-romanticismartist-", 
    "-photographyartist-",
    "-emoji-",
    "-timeperiod-",
    "-shotsize-",
    "-musicgenre-",
    "-animaladdition-",
    "-addontolocationinside-",
    "-addontolocation-",
    "-objectaddition-",
    "-humanaddition-",
    "-overalladdition-",
    "-focus-",
    "-direction-",
    "-styletilora-",
    "-manwomanrelation-",
    "-manwomanmultiple-",
    "-waterlocation-",
    "-container-",
    "-firstname-",
    "-flora-",
    "-print-",
    "-miniactivity-",
    "-pattern-",
    "-animalsuffixaddition-",
    "-chair-",
    "-cardname-",
    "-covering-",
    "-heshe-",
    "-hisher-",
    "-himher-",
    "-outfitdescriptor-",
    "-hairdescriptor-",
    "-hairvomit-",
    "-humandescriptor-",
    "-facepart-",
    "-buildfacepart-",
    "-outfitvomit-",
    "-locationdescriptor-",
    "-basicbitchdescriptor-",
    "-animaldescriptor-",
    "-humanexpression-",
    "-humanvomit-",
    "-eyecolor-",
    "-fashiondesigner-",
    "-colorcombination-",
    "-materialcombination-",
    "-oppositefictional-",
    "-oppositenonfictional-",
    "-photoaddition-",
    "-age-",
    "-agecalculator-",
    "-gregmode-",
    "-portraitartist-",
    "-characterartist-",
    "-landscapeartist-",
    "-scifiartist-",
    "-graphicdesignartist-",
    "-digitalartist-",
    "-architectartist-",
    "-cinemaartist-",
    "-element-",
    "-setting-",
    "-charactertype-",
    "-objectstohold-",
    "-episodetitle-",
    "-token-",
    "-allstylessuffix-",
    "-fluff-",
    "-event-",
    "-background-",
    "-occult-",
    "-locationfantasy-",
    "-locationscifi-",
    "-locationvideogame-",
    "-locationbiome-",
    "-locationcity-",
    "-bird-",
    "-cat-",
    "-dog-",
    "-insect-",
    "-pokemon-",
    "-pokemontype-",
    "-marinelife-"
  ];
  return arr.some(x => completeprompt.includes(x));  
}

async function remove_superprompt_bias(superpromptresult = "", insanitylevel = 5, override_outfit = "") {
  if(superpromptresult.includes(" green eye")) {
    let eyecolorslist = await csv_to_list("eyecolors")
    eyecolorslist = eyecolorslist.filter(x => !x.toString().startsWith('-')) // [x for x in eyecolorslist if not x.startswith('-')]
    const neweyecolor = " " + randomChoice(eyecolorslist).toLowerCase() + " eye"
    //print(neweyecolor)
    superpromptresult = superpromptresult.replaceAll(" green eye", neweyecolor)
  }

  //  white gown  or white dress
  if(superpromptresult.includes(" white gown") 
      || superpromptresult.includes(" white dress")
      || superpromptresult.includes(" black suit")
  ) {
    let colorcombinationslist = await csv_to_list("colorcombinations")
    colorcombinationslist = colorcombinationslist.filter(it => !it.toString().startsWith('-')) // [x for x in colorcombinationslist if not x.startswith('-')]
    let colorslist = await csv_to_list("colors")
    colorslist = colorslist.filter(it => !it.toString().startsWith('-')) // [x for x in colorslist if not x.startswith('-')]
    
    let newcolordress = ""
    let newcolorgown = ""
    let newcolorsuit = ''
    if(normal_dist(insanitylevel)) {
      newcolordress = " " + randomChoice(colorcombinationslist).toLowerCase() + " dress"
      newcolorgown = " " + randomChoice(colorcombinationslist).toLowerCase() + " gown"
      newcolorsuit = " " + randomChoice(colorcombinationslist).toLowerCase() + " suit"
    } else {
      newcolordress = " " + randomChoice(colorslist).toLowerCase() + " dress"
      newcolorgown = " " + randomChoice(colorslist).toLowerCase() + " gown"
      newcolorsuit = " " + randomChoice(colorcombinationslist).toLowerCase() + " suit"
    }
    
        //print(newcolordress)                
    //print(newcolorgown)                
    //print(newcolorsuit)
    superpromptresult = superpromptresult.replaceAll(" white dress", newcolordress)
    superpromptresult = superpromptresult.replaceAll(" white gown", newcolorgown)
    superpromptresult = superpromptresult.replaceAll(" black suit", newcolorsuit)
  }

  if(superpromptresult.includes(" gown") 
    || superpromptresult.includes(" dress") 
    || superpromptresult.includes(" suit")
    && !override_outfit.includes("gown") 
    && !override_outfit.includes("dress")
    && !override_outfit.includes("suit ")
    && !superpromptresult.includes(" dressed")
    && !superpromptresult.includes(" suited")
  ) {
    let newoutfit = ''
    if(override_outfit == "") {
      let outfitslist = await csv_to_list("outfits")
      outfitslist = outfitslist.filter(it => !it.toString().startsWith('-')) // [x for x in outfitslist if not x.startswith('-')]
      newoutfit = " " + randomChoice(outfitslist).toLowerCase()
    } else
      newoutfit = " " + override_outfit
    superpromptresult = superpromptresult.replaceAll(" dress", newoutfit)
    superpromptresult = superpromptresult.replaceAll(" gown", newoutfit)
    superpromptresult = superpromptresult.replaceAll(" suit", newoutfit)
  }

  if(superpromptresult.includes(" sleek ")) {
    let descriptorslist = await csv_to_list("descriptors")
    descriptorslist = descriptorslist.filter(it => !it.toString().startsWith('-')) //[x for x in descriptorslist if not x.startswith('-')]
    const newdescriptor = " " + randomChoice(descriptorslist).toLowerCase() + " "
    //print(newdescriptor)

    superpromptresult = superpromptresult.replaceAll(" sleek ", newdescriptor)
  }

  //// lush green (meadow), sun shines down
  // A graceful woman with long, flowing hair stands on a lush green lawn, her arms spread wide as she kneels gently in the breeze. The sun shines down on her
  if(superpromptresult.includes("lush green meadow")) {
    let backgroundlist = await csv_to_list("backgrounds")
    backgroundlist = backgroundlist.filter(it => !it.toString().startsWith('-')) // [x for x in backgroundlist if not x.startswith('-')]
    const newbackground = randomChoice(backgroundlist).toLowerCase()
    //print(newbackground)

    superpromptresult = superpromptresult.replaceAll("lush green meadow", newbackground)
  }

  if(superpromptresult.includes("long, flowing hair")) {
    let hairstylelist = await csv_to_list("hairstyles2")
    hairstylelist = hairstylelist.filter(it => !it.toString().startsWith('-')) // [x for x in hairstylelist if not x.startswith('-')]
    const newhairstyle = randomChoice(hairstylelist).toLowerCase()
    //print(newhairstyle)

    superpromptresult = superpromptresult.replaceAll("long, flowing hair", newhairstyle)
  }
  
  return superpromptresult
}

function removeCharacters(input: string, charsToRemove: string): string {
  // Create a regular expression from the characters to remove, escaping special characters if needed
  const charsToRemoveRegex = new RegExp(`[${charsToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
  
  // Replace all occurrences of the characters with an empty string
  return input.replace(charsToRemoveRegex, '');
}

async function one_button_superprompt(insanitylevel = 5, prompt = "", seed = -1, override_subject = "" , override_outfit = "", chosensubject ="", gender = "", restofprompt = "", superpromptstyle = "", setnewtokens = 0, remove_bias = true) {
  if(seed <= 0)
    seed = randint(1,1000000)
  
  let done = false
  const load_model_promise = loadSuperpromptV1Model()

  const superprompterstyleslist = await csv_to_list("superprompter_styles")
  const descriptorlist = await csv_to_list("descriptors")
  const devmessagessuperpromptlist = await csv_to_list("devmessages_superprompt")

  let usestyle = false
  if(superpromptstyle != "" && superpromptstyle != "all")
    usestyle = true

  restofprompt = restofprompt.toLowerCase()
  let question = ""

  // first, move LoRA's to the back dynamically

  // Find all occurrences of text between < and > using regex
  let allLoRA = Array.from(prompt.match(/<[^>]+>/g) ?? [])

  // Remove the extracted matches from completeprompt
  prompt = prompt.replace(/<[^>]+>/g, "")
  override_subject = override_subject.replace(/<[^>]+>/g, "")
  
  const temperature_lookup: Record<number, number> = {
    1: 0.01,
    2: 0.1,
    3: 0.3,
    4: 0.5,
    5: 0.6,
    6: 0.7,
    7: 1.0,
    8: 2.5,
    9: 5.0,
    10: 10.0
  }

  const max_new_tokens_lookup: Record<number, number> = {
    1: 45,
    2: 45,
    3: 50,
    4: 55,
    5: 60,
    6: 70,
    7: 90,
    8: 100,
    9: 150,
    10: 255
  }

  const top_p_lookup: Record<number, number> = {
    1: 0.1,
    2: 1.0,
    3: 1.3,
    4: 1.5,
    5: 1.6,
    6: 1.75,
    7: 2.0,
    8: 3.0,
    9: 5.0,
    10: 15.0
  }

  const chosensubject_lookup: Record<string, string> = {
    "humanoid": "fantasy character",
    "manwomanrelation": "person",
    "manwomanmultiple": "people",
    "firstname": "",
    "job": "person",
    "fictional": "fictional character",
    "non fictional": "person",
    "human": "person",
    "animal": "animal",
    "animal as human": "human creature",
    "landscape": "landscape",
    "concept": "concept",
    "event": "concept",
    //"concept": "concept",
    "poemline": "concept",
    "songline": "concept",
    "cardname": "concept",
    "episodetitle": "concept",
    "generic objects": "object",
    "vehicles": "vehicle",
    "food": "food",
    "building": "building",
    "space": "space",
    "flora": "nature",
  }
  // for insanitylevel in range(1,11):
  let j = 0
  let temperature = temperature_lookup[insanitylevel] ?? 0.5
  let max_new_tokens = 512
  if(setnewtokens < 1)
    max_new_tokens = max_new_tokens_lookup[insanitylevel] ?? 70
  else
    max_new_tokens = setnewtokens
  let top_p = top_p_lookup[insanitylevel] ?? 1.6
  let subject_to_generate = chosensubject_lookup[chosensubject] ?? ""

  const translation_table_remove_stuff = '.,:()<>|[]"" '
  const translation_table_remove_numbers = '0123456789:()<>|[]""'

    // check if its matching all words from the override:
  let possible_words_to_check = [...override_subject.toLowerCase().split(' '), ...override_outfit.toLowerCase().split(' ')]
  //console.log(possible_words_to_check)
  const words_to_check: string[] = []
  const words_to_remove = ['subject', 'solo', '1girl', '1boy']
  for (let word of possible_words_to_check) {
    word = removeCharacters(word, translation_table_remove_stuff)
    //console.log(word)
    if (!words_to_remove.includes(word)) {
      if ((!word.startsWith("-") && !word.endsWith("-")) && (!word.startsWith("_") && !word.endsWith("_")))
        words_to_check.push(word)
    } 
  }

  //console.log(words_to_check)
  if (!["humanoid","firstname","job","fictional","non fictional","human"].includes(chosensubject))
      gender = ""
  if(superpromptstyle == "" || superpromptstyle == "all") {
    if (restofprompt.includes("fantasy") || restofprompt.includes("d&d") || restofprompt.includes("dungeons and dragons") || restofprompt.includes("dungeons and dragons"))
      superpromptstyle = "fantasy style"
    else if (restofprompt.includes("sci-fi") || restofprompt.includes("scifi") || restofprompt.includes("science fiction"))
      superpromptstyle = randomChoice(["sci-fi style","futuristic"])
    else if (restofprompt.includes("cyberpunk"))
      superpromptstyle = "cyberpunk"
    else if (restofprompt.includes("horror"))
      superpromptstyle = "horror themed"
    else if (restofprompt.includes("evil"))
      superpromptstyle = "evil"
    else if (restofprompt.includes("cinestill") || restofprompt.includes("movie still") || restofprompt.includes("cinematic") || restofprompt.includes("epic"))
      superpromptstyle = randomChoice(["cinematic","epic"])
    else if (restofprompt.includes("fashion"))
      superpromptstyle = randomChoice(["elegant","glamourous"])
    else if (restofprompt.includes("cute") || restofprompt.includes("adorable") || restofprompt.includes("kawaii"))
      superpromptstyle = randomChoice(["cute","adorable", "kawaii"])
    else
      superpromptstyle = randomChoice(superprompterstyleslist)
  }

  if(words_to_check)
    question += "Make sure the subject is used: " + words_to_check.join(', ') + " \n"

  let imagetype = ""
  if (restofprompt.includes("portrait"))
    imagetype = "a portrait"
  else if (restofprompt.includes("painting"))
    imagetype = "a painting"
  else if (restofprompt.includes("digital art"))
    imagetype = "a digital artwork"
  else if (restofprompt.includes("concept"))
    imagetype = "concept art"
  else if (restofprompt.includes("pixel"))
    imagetype = "pixel art"
  else if (restofprompt.includes("game"))
    imagetype = "video game artwork"
  
  if (imagetype != "" && (normal_dist(insanitylevel) || usestyle))
    question += "Expand the following " + gender + " " + subject_to_generate + " prompt to describe " + superpromptstyle + " " + imagetype + ": "
  else if (imagetype != "")
    question += "Expand the following " + gender + " " + subject_to_generate + " prompt to describe " + imagetype + ": "
  else if(normal_dist(insanitylevel) || usestyle)
    question += "Expand the following " + gender + " " + subject_to_generate + " prompt to make it more " + superpromptstyle
  else
    question += "Expand the following " + gender + " " + subject_to_generate + " prompt to add more detail: "



  prompt = removeCharacters(prompt, translation_table_remove_numbers)

  let superpromptresult = ''

  while (!done) {
    //console.log(seed)
    //console.log(temperature)
    //console.log(top_p)
    //console.log(question)
    //console.log("chosen subject: " + chosensubject)
    
    await load_model_promise
    superpromptresult = await answerBySuperprompt(question + prompt, max_new_tokens, 2.0, temperature, top_p, 10, seed)

    //console.log("orignal: " + prompt)
    //console.log("insanitylevel: " + str(insanitylevel))
    //console.log("")
    //console.log("complete superprompt: " + superpromptresult)
    //console.log("")

    // Find the indices of the nearest period and comma
    const period_index = superpromptresult.lastIndexOf('.')
    const comma_index = superpromptresult.lastIndexOf(',')

    // Determine the index to cut off the string
    const cut_off_index = Math.max(period_index, comma_index)

    // Cut off the string at the determined index
    if (cut_off_index != -1)  // If either period or comma exists
      superpromptresult = superpromptresult.slice(0, cut_off_index + 1)  // Include the period or comma
    else
      superpromptresult = superpromptresult  // If neither period nor comma exists, keep the entire text

    // piercing green eyes problem
    // basically, the model has some biasses, lets get rid of it, OBP style!
    if(common_dist(insanitylevel) && remove_bias) // but not always
        superpromptresult = await remove_superprompt_bias(superpromptresult=superpromptresult, insanitylevel=insanitylevel, override_outfit=override_outfit)
        
    
    //console.log(words_to_check)
    // Iterate through each word and check if it exists in the other string
    let i = 0
    for (const word of words_to_check) {
      if (!superpromptresult.toLowerCase().includes(word)  && word != "subject")
        i += 1
    }
            
    
    if(i == 0 || j == 20 || insanitylevel >= 9)
      done = true
    // slowly converge and change
    else {
      seed += 100
      j += 1
      if(temperature < 0.5)
        temperature += 0.05 + Number((1 / randint(15,25)).toFixed(2))
      else
        temperature -= 0.1

      if(top_p < 1.0)
        top_p += 0.2 + Number((1 / randint(25,35)).toFixed(2))
      else
        top_p -= 0.3
      max_new_tokens += 3
      console.log("")
      console.log(randomChoice(devmessagessuperpromptlist) + "... Retrying...")
      console.log("")
    }
  }
          
      

  superpromptresult += " " + allLoRA.join(" ")

  return superpromptresult
}


// builds a prompt dynamically
// insanity level controls randomness of propmt 0-10
// forcesubject van be used to force a certain type of subject
// Set artistmode to none, to exclude artists

export async function build_dynamic_prompt(
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
    const random_preset = randomChoice(random_preset_keys);
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
  let antilist = (await csv_to_list("antilist", emptylist, "/userfiles/", 1)) as string[];
  
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

  const accessorielist = await csv_to_list("accessories",antilist,"/csvfiles/",0,"?",false,false,gender)
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
  const hairvomitlist = await csv_to_list("hairvomit",antilist,"/csvfiles/",0,"?",false,false)
  
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
        vomitlist[i] = vomit.toString().replaceAll(key, value);
      }
    });
  } // build_dynamic_prompt.py LINE273

  const foodlist = await csv_to_list("foods", antilist)
  const genderdescriptionlist = await csv_to_list_({csvfilename:"genderdescription",antilist,skipheader:true,gender})
  const minilocationlist = await csv_to_list("minilocations", antilist)
  const minioutfitlist = await csv_to_list("minioutfits",antilist,"/csvfiles/",0,"?",false,false,gender)
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
    artistlist = await csv_to_list(artists,antilist,"/userfiles/")
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
  const gregmodelist = (await csv_to_list("gregmode", antilist)) as string[]


  // add any other custom lists
  const stylestiloralist = await csv_to_list("styles_ti_lora",antilist,"/userfiles/")
  const generatestyle = Boolean(stylestiloralist?.length)

  const custominputprefixlist = await csv_to_list("custom_input_prefix",antilist,"/userfiles/")
  let generatecustominputprefix = Boolean(custominputprefixlist?.length)

  const custominputmidlist = await csv_to_list("custom_input_mid",antilist,"/userfiles/")
  const generatecustominputmid = Boolean(custominputmidlist?.length)

  const custominputsuffixlist = await csv_to_list("custom_input_suffix",antilist,"/userfiles/")
  const generatecustominputsuffix = Boolean(custominputsuffixlist?.length)

  const customsubjectslist = await csv_to_list("custom_subjects",antilist,"/userfiles/")
  const customoutfitslist = await csv_to_list("custom_outfits",antilist,"/userfiles/")

  // special lists
  const backgroundtypelist = await csv_to_list("backgroundtypes", antilist,"/csvfiles/special_lists/",0,"?")
  const insideshotlist = await csv_to_list("insideshots", antilist,"/csvfiles/special_lists/",0,"?")
  const photoadditionlist = await csv_to_list("photoadditions", antilist,"/csvfiles/special_lists/",0,"?")
  let buildhairlist = [], buildoutfitlist = [], humanadditionlist = [], objectadditionslist = [],
    buildfacelist = [], buildaccessorielist = [], humanactivitylist = [], humanexpressionlist = [];
  if(less_verbose) {
    buildhairlist = await csv_to_list("buildhair_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    buildoutfitlist = await csv_to_list("buildoutfit_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    humanadditionlist = await csv_to_list("humanadditions_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    objectadditionslist = await csv_to_list("objectadditions_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    buildfacelist = await csv_to_list("buildface_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    buildaccessorielist = await csv_to_list("buildaccessorie_less_verbose", antilist,"/csvfiles/special_lists/",0,"?")
    humanactivitylist = await csv_to_list("human_activities_less_verbose",antilist,"/csvfiles/",0,"?",false,false)
    humanexpressionlist = await csv_to_list("humanexpressions_less_verbose",antilist,"/csvfiles/",0,"?",false,false)
  } else {
    buildhairlist = await csv_to_list("buildhair", antilist,"/csvfiles/special_lists/",0,"?")
    buildoutfitlist = await csv_to_list("buildoutfit", antilist,"/csvfiles/special_lists/",0,"?")
    humanadditionlist = await csv_to_list("humanadditions", antilist,"/csvfiles/special_lists/",0,"?")
    objectadditionslist = await csv_to_list("objectadditions", antilist,"/csvfiles/special_lists/",0,"?")
    buildfacelist = await csv_to_list("buildface", antilist,"/csvfiles/special_lists/",0,"?")
    buildaccessorielist = await csv_to_list("buildaccessorie", antilist,"/csvfiles/special_lists/",0,"?")
    humanactivitylist = await csv_to_list("human_activities",antilist,"/csvfiles/",0,"?",false,false)
    humanexpressionlist = await csv_to_list("humanexpressions",antilist,"/csvfiles/",0,"?",false,false)
  }

  humanactivitylist = [...humanactivitylist, ...humanactivitycheatinglist]

  const animaladditionlist = await csv_to_list("animaladditions", antilist,"/csvfiles/special_lists/",0,"?")
  
  const minilocationadditionslist = await csv_to_list("minilocationadditions", antilist,"/csvfiles/special_lists/",0,"?")
  const overalladditionlist = await csv_to_list("overalladditions", antilist,"/csvfiles/special_lists/",0,"?")
  let imagetypemodelist = await csv_to_list("imagetypemodes", antilist,"/csvfiles/special_lists/",0,"?")
  const miniactivitylist = await csv_to_list("miniactivity", antilist,"/csvfiles/special_lists/",0,"?")
  const animalsuffixadditionlist = await csv_to_list("animalsuffixadditions", antilist,"/csvfiles/special_lists/",0,"?")
  const buildfacepartlist = await csv_to_list("buildfaceparts", antilist,"/csvfiles/special_lists/",0,"?")
  const conceptmixerlist = await csv_to_list("conceptmixer", antilist,"/csvfiles/special_lists/",0,"?")
  
  
  const tokinatorlist = await csv_to_list("tokinator", antilist,"/csvfiles/templates/",0,"?")
  const styleslist = await csv_to_list("styles", antilist,"/csvfiles/templates/",0,"?")
  const stylessuffix = styleslist.map(it => it.toString().split('-subject-')[1]) //[item.split('-subject-')[1] for item in styleslist]
  const breakstylessuffix = stylessuffix.map(item => item.split(',')) //[item.split(',') for item in stylessuffix]
  let allstylessuffixlist = breakstylessuffix.flat()
  allstylessuffixlist = Array.from(new Set(allstylessuffixlist))

  const artistsuffix = await artist_descriptions_csv_to_list("artists_and_category")
  const breakartiststylessuffix = artistsuffix.map(item => item.split(','))
  let artiststylessuffixlist = breakartiststylessuffix.flat()
  artiststylessuffixlist = Array.from(new Set(artiststylessuffixlist))
  allstylessuffixlist = [...allstylessuffixlist, ...artiststylessuffixlist]
  
  let dynamictemplatesprefixlist = await csv_to_list("dynamic_templates_prefix", antilist,"/csvfiles/templates/",0,"?")
  let dynamictemplatessuffixlist = await csv_to_list("dynamic_templates_suffix", antilist,"/csvfiles/templates/",0,"?") // build_dynamic_prompt.py LINE 516

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

  let subjectchooser = ""
  let mainchooser = ""

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
    mainchooser = ''
    subjectchooser = ''

    let artistbylist: string[] = []

    let chosenstylesuffix = ''
    let chosenstyleprefix = ''
  
    //completeprompt += prefixprompt

    completeprompt += ", " // build_dynamic_prompt.py LINE 1413

    if(templatemode) {
      const templatelist = (await csv_to_list("templates", antilist,"/csvfiles/templates/",1,";",true)) as string[][]

            
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
        completeprompt += chosentemplate.replaceAll("-subject-",templatesubjects[templateindex] )
      else if(givensubject != "" && !subjectingivensubject)
        completeprompt += chosentemplate.replaceAll("-subject-",givensubject )
      else if(givensubject != "" && subjectingivensubject)
        completeprompt += chosentemplate.replaceAll("-subject-", givensubjectpromptlist[0] + " " + templatesubjects[templateindex] + " " + givensubjectpromptlist[1])
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
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-artist-", artistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-gregmode-", gregmodelist, false, false)

        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-fantasyartist-", fantasyartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-popularartist-", popularartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-romanticismartist-", romanticismartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-photographyartist-", photographyartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-portraitartist-", portraitartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-characterartist-", characterartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-landscapeartist-", landscapeartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-scifiartist-", scifiartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-graphicdesignartist-", graphicdesignartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-digitalartist-", digitalartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-architectartist-", architectartistlist, false, false)
        completeprompt = await replacewildcard(completeprompt, insanitylevel, "-cinemaartist-", cinemaartistlist, false, false)
            
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
          completeprompt += "(OR(;-imagetypequality-;uncommon) OR(-imagetype-;-othertype-;rare)1.3) "
        else
          completeprompt += "OR(;-imagetypequality-;uncommon) OR(-imagetype-;-othertype-;rare) "
      }
      completeprompt += randomChoice(tokinatorlist)
      completeprompt = completeprompt.replaceAll("-tokensubtype-", randomChoice(tokinatorsubtype))

      if(givensubject.includes("subject") && smartsubject)
        givensubject = givensubject.replaceAll("subject", "-token-")

      if(givensubject == "" && overrideoutfit == "")
        completeprompt = completeprompt.replaceAll("-subject-", "-token-")
      else if(givensubject == "" && overrideoutfit != "" &&  !completeprompt.includes("-outfit-"))
        completeprompt = completeprompt.replaceAll("-subject-", "-token- wearing a OR(-token-;;normal) -outfit-")
      else if(givensubject != "" && overrideoutfit != "" &&  !completeprompt.includes("-outfit-"))
        completeprompt = completeprompt.replaceAll("-subject-", givensubject + " wearing a OR(-token-;;normal) -outfit-")
      else
        completeprompt = completeprompt.replaceAll("-subject-", givensubject)
      
      if(overrideoutfit == "")
        completeprompt = completeprompt.replaceAll("-outfit-", "-token-")
      else
        completeprompt = completeprompt.replaceAll("-outfit-", overrideoutfit)
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
    let genjoboractivitylocation = ''

    if(generatesubject) {
      // start with descriptive qualities
            
      // outfit in front mode?
      // outfitmode = 0 = NO
      // outfitmode = 1 IN FRONT
      // outfitmode = 2 IS NORMAL
      if(overrideoutfit!="")
          outfitmode = 2
      if(animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple", "firstname"] && chance_roll(insanitylevel, outfitchance) && generateoutfit && humanspecial != 1) {
        if(randint(0,10)==0)
          outfitmode = 1
        else
          outfitmode = 2
      }
      
      if(outfitmode == 1) {
        completeprompt += "OR(wearing;dressed in;in;normal) OR(;OR(;a very;rare) -outfitdescriptor-;normal) OR(;-color-;uncommon) OR(;-culture-;uncommon) OR(;-material-;rare) -outfit-, "
        if(extraordinary_dist(insanitylevel))
          completeprompt += " -outfitvomit-, "
      }
      


      if(subjectingivensubject)
        completeprompt += " " + givensubjectpromptlist[0] + " "

      // Once in a very rare while, we get a ... full of ...s
      if(novel_dist(insanitylevel) && (animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation","firstname"])) {
        buildingfullmode = true
        insideshot = 1
        heshelist = ["they"]
        hisherlist = ["their"]
        himherlist = ["them"]
        completeprompt += "a OR(-building-;-location-;-waterlocation-;-container-;-background-;rare) full of "
      } // build_dynamic_prompt.py LINE 2146

      // Sometimes the descriptors are at the back, in more natural language. Lets determine.
      let descriptorsintheback = randint(0,2)
      if(descriptorsintheback < 2) {
        // Common to have 1 description, uncommon to have 2
        if(chance_roll(insanitylevel, subjectdescriptor1chance) && generatedescriptors) {
          if(animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"]) {
            if(anime_mode && randint(0,2) < 2)
              completeprompt += "-basicbitchdescriptor- "
            else
              completeprompt += "-humandescriptor- "
          }
          else if(mainchooser == "landscape")
            completeprompt += "-locationdescriptor- "
          else if(mainchooser == "animal")
            completeprompt += "-animaldescriptor- "
          else
            completeprompt += "-descriptor- "
        }

        if(chance_roll(insanitylevel, subjectdescriptor2chance) && generatedescriptors) {
          if(animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"]) {
            if(anime_mode && randint(0,2) < 2)
              completeprompt += "-basicbitchdescriptor- "
            else
              completeprompt += "-humandescriptor- "
          }
          else if(mainchooser == "landscape")
            completeprompt += "-locationdescriptor- "
          else if(mainchooser == "animal")
            completeprompt += "-animaldescriptor- "
          else
            completeprompt += "-descriptor- "
        }
      }
      
      // color, for animals, landscape, objects and concepts
      if(mainchooser in ["animal", "object", "landscape", "concept"] && unique_dist(insanitylevel))
        completeprompt += " OR(-color-;-colorcombination-) "
      
      // age, very rare to add.
      if(subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"] && extraordinary_dist(insanitylevel))
        completeprompt += randint(20,99) + " OR(y.o.;year old) "

      if((animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"]) && chance_roll(insanitylevel, subjectbodytypechance) && generatebodytype)
        completeprompt += "-bodytype- "

      if((animalashuman || subjectchooser in ["object","human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"]) && chance_roll(insanitylevel, subjectculturechance) && generatedescriptors)
        completeprompt += "-culture- "

      if(mainchooser == "object"){
        // first add a wildcard that can be used to create prompt strenght
        completeprompt += " -objectstrengthstart-"
        // if we have an overwrite, then make sure we only take the override
        if(subtypeobject != "all") {
          if(subtypeobject == "generic objects")
            objectwildcardlist = ["-object-"]
          if(subtypeobject == "vehicles")
              objectwildcardlist = ["-vehicle-"]
          if(subtypeobject == "food")
              objectwildcardlist = ["-food-"]
          if(subtypeobject == "buildings")
              objectwildcardlist = ["-building-"]
          if(subtypeobject == "space")
              objectwildcardlist = ["-space-"]
          if(subtypeobject == "flora")
              objectwildcardlist = ["-flora-"]
          // not varied enough
          //if(subtypeobject == "occult")
          //    objectwildcardlist = ["-occult-"]
          subjectchooser = subtypeobject
        }

        // if we have a given subject, we should skip making an actual subject
        // unless we have "subject" in the given subject
        

        if(givensubject == "" || (subjectingivensubject && givensubject != "")) {
          if(rare_dist(insanitylevel) && advancedprompting) {
            const hybridorswaplist = ["hybrid", "swap"]
            hybridorswap = randomChoice(hybridorswaplist)
            completeprompt += "["
          }

          const chosenobjectwildcard = randomChoice(objectwildcardlist)

          completeprompt += chosenobjectwildcard + " "

          if(hybridorswap == "hybrid") {
            if(uncommon_dist(insanitylevel))
              completeprompt += "|" + randomChoice(objectwildcardlist) + "] "
            else {
              completeprompt += "|" 
              completeprompt += chosenobjectwildcard + " "
              completeprompt += "] "
            }
          }
          if(hybridorswap == "swap") {
            if(uncommon_dist(insanitylevel))
              completeprompt += ":" + randomChoice(objectwildcardlist) + ":" + randint(1,5) +  "] "
            else {
              completeprompt += ":"
              completeprompt += chosenobjectwildcard + " "
              completeprompt += ":" + randint(1,5) +  "] "
            }
          }
        } else
          completeprompt += " " + givensubject + " "
        
        hybridorswap = ""
      }

      if(mainchooser == "animal") {
        // first add a wildcard that can be used to create prompt strenght
        completeprompt += " -objectstrengthstart-"
        if(anime_mode 
            &&  !givensubject.includes("1girl")
            &&  !givensubject.includes("1boy")
        ) {
          const anthrolist = ["anthro", "anthrophomorphic", "furry"]
      
              
          if(gender=="male")
            completeprompt += randomChoice(anthrolist) + ", 1boy, solo, "
          else
            completeprompt += randomChoice(anthrolist) + ", 1girl, solo, "
        }
        
        // if we have a given subject, we should skip making an actual subject
        if(givensubject == "" || (subjectingivensubject && givensubject != "")) {
          if(subtypeanimal != "all") {
            if(subtypeanimal=="generic animal")
              animalwildcardlist = ["-animal-"]
            else if(subtypeanimal=="bird")
                animalwildcardlist = ["-bird-"]
            else if(subtypeanimal=="cat")
                animalwildcardlist = ["-cat-"]
            else if(subtypeanimal=="dog")
                animalwildcardlist = ["-dog-"]
            else if(subtypeanimal=="insect")
                animalwildcardlist = ["-insect-"]
            else if(subtypeanimal=="pokemon")
                animalwildcardlist = ["-pokemon-"]
            else if(subtypeanimal=="marine life")
                animalwildcardlist = ["-marinelife-"]
          }

          
          const chosenanimalwildcard = randomChoice(animalwildcardlist)

          if(rare_dist(insanitylevel) && advancedprompting) {
            const hybridorswaplist = ["hybrid", "swap"]
            hybridorswap = randomChoice(hybridorswaplist)
            completeprompt += "["
          }
              
          if(unique_dist(insanitylevel) && generateanimaladdition)
              animaladdedsomething = 1
              completeprompt += "-animaladdition- " + chosenanimalwildcard + " "
          if(animaladdedsomething != 1)
              completeprompt += chosenanimalwildcard + " "

          

          if(hybridorswap == "hybrid")
              if(uncommon_dist(insanitylevel))
                  completeprompt += "|" + randomChoice(hybridlist) + "] "
              else
                  completeprompt += "| " + chosenanimalwildcard +  " ] "
          if(hybridorswap == "swap")
              if(uncommon_dist(insanitylevel))
                  completeprompt += ":" + randomChoice(hybridlist) + ":" + randint(1,5) +  "] "
              else
                  completeprompt += ":" + chosenanimalwildcard +  ":" + randint(1,5) +  "] "
        } else
          completeprompt += " " + givensubject + " "
        
        hybridorswap = ""
      }

      // move job or activity logic here. We want to place it at 2 different places maybe
      
      if((animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation", "manwomanmultiple","firstname"])  && chance_roll(insanitylevel, joboractivitychance) && humanspecial != 1 && generatesubject) {
        genjoboractivity = true
        const genjoboractivitylocationslist = ["front","middle", "middle","back","back", "back"]
        genjoboractivitylocation = randomChoice(genjoboractivitylocationslist)
      }


      if(genjoboractivity && genjoboractivitylocation == "front")
        completeprompt += "-job- " // build_dynamic_prompt.py LINE 2323
          
      
      // if we have a given subject, we should skip making an actual subject
      if(mainchooser == "humanoid") {
        // first add a wildcard that can be used to create prompt strenght
        completeprompt += " -objectstrengthstart-"
        
        if(anime_mode 
            &&  !givensubject.includes("1girl")
            &&  !givensubject.includes("1boy")
        ) {
          if(subjectchooser != "manwomanmultiple") {
            if(gender=="male")
              completeprompt += "1boy, solo, "
            else
              completeprompt += "1girl, solo, "
          } else {
            if(gender=="male")
              completeprompt += "multipleboys, "
            else
              completeprompt += "multiplegirls, "
          }
        }
        
        if(givensubject == "" || (subjectingivensubject && givensubject != "")) {
          if(subjectchooser == "human"&& !anime_mode)
            completeprompt += "-manwoman-"
          
          if(subjectchooser == "manwomanrelation")
            completeprompt += "-manwomanrelation-"

          if(subjectchooser == "manwomanmultiple")
            completeprompt += "-manwomanmultiple-"

          if(subjectchooser == "job") {
            if(!anime_mode)
              completeprompt += "-malefemale- "
            completeprompt += "-job-"
          }

          if(subjectchooser == "fictional") {
            if(rare_dist(insanitylevel) && advancedprompting && !buildingfullmode) {
              const hybridorswaplist = ["hybrid", "swap"]
              hybridorswap = randomChoice(hybridorswaplist)
              completeprompt += "["
            }
          
            // Sometimes, we do a gender swap. Much fun!
            if(novel_dist(insanitylevel))
              completeprompt += gender + " version of -oppositefictional-"
            else
              completeprompt += "-fictional-"

            if(hybridorswap == "hybrid")
                completeprompt += "|" + randomChoice(hybridhumanlist) + " ] "
            if(hybridorswap == "swap")
                completeprompt += ":" + randomChoice(hybridhumanlist) + ":" + randint(1,5) +  "] "
            hybridorswap = ""
          }

          if(subjectchooser == "non fictional") {
            if(rare_dist(insanitylevel) && advancedprompting && !buildingfullmode) {
              const hybridorswaplist = ["hybrid", "swap"]
              hybridorswap = randomChoice(hybridorswaplist)
              completeprompt += "["
            }
            // Sometimes, we do a gender swap. Much fun!
            if(novel_dist(insanitylevel))
              completeprompt += gender + " version of -oppositenonfictional-"
            else
              completeprompt += "-nonfictional-"

            if(hybridorswap == "hybrid")
                completeprompt += "|" + randomChoice(hybridhumanlist) + "] "
            if(hybridorswap == "swap")
                completeprompt += ":" + randomChoice(hybridhumanlist) + ":" + randint(1,5) +  "] "
            hybridorswap = ""
          }

          if(subjectchooser == "humanoid") {
            if(gender != "all")
              completeprompt += "-malefemale- "
            if(rare_dist(insanitylevel) && advancedprompting && !buildingfullmode) {
              const hybridorswaplist = ["hybrid", "swap"]
              hybridorswap = randomChoice(hybridorswaplist)
              completeprompt += "["
            }
            
            completeprompt += "-humanoid-"

            if(hybridorswap == "hybrid")
              completeprompt += "|" + randomChoice(hybridhumanlist) + "] "
            if(hybridorswap == "swap")
              completeprompt += ":" + randomChoice(hybridhumanlist) + ":" + randint(1,5) +  "] "
            hybridorswap = ""
          }

          if(subjectchooser == "firstname") {
            if(rare_dist(insanitylevel) && advancedprompting && !buildingfullmode) {
              const hybridorswaplist = ["hybrid", "swap"]
              hybridorswap = randomChoice(hybridorswaplist)
              completeprompt += "["
            }
          
            completeprompt += "-firstname-"

            if(hybridorswap == "hybrid")
                completeprompt += "|" + "-firstname-" + "] "
            if(hybridorswap == "swap")
                completeprompt += ":" + "-firstname-" + ":" + randint(1,5) +  "] "
            hybridorswap = ""
          }

          if(buildingfullmode)
            completeprompt += "s"

          completeprompt += " "
        } else {
          if(subjectchooser == "manwomanmultiple" && subtypehumanoid != "multiple humans" && !["1girl", "1boy", "solo"].includes(givensubject)) {
            if(randint(0,1) == 1)
              completeprompt +=  " " + givensubject + " and a -manwomanmultiple- "
            else
              completeprompt +=  " a OR(group;couple;crowd;bunch) of " + givensubject + " "
          }
          else
            completeprompt += " " + givensubject + " " 
        }
      } // build_dynamic_subject.py LINE 2436

      
      // sometimes add a suffix for more fun!
      if( (mainchooser == "humanoid" || mainchooser == "animal" || mainchooser == "object") && chance_roll(insanitylevel, subjectconceptsuffixchance))
        completeprompt += " of -conceptsuffix- "

      if(mainchooser == "humanoid" || mainchooser == "animal" || mainchooser == "object")
        // completion of strenght end
        completeprompt += "-objectstrengthend-"
      
      if(mainchooser == 'animal' && legendary_dist(insanitylevel)) {
        animaladdedsomething = 1
        completeprompt += " -animalsuffixaddition- "
      }
      
      
      if(mainchooser == "landscape") {
        // first add a wildcard that can be used to create prompt strenght
        completeprompt += " -objectstrengthstart-"
        
        // if we have a given subject, we should skip making an actual subject
        if(givensubject == "" || (subjectingivensubject && givensubject != "")) {
          if(rare_dist(insanitylevel) && advancedprompting) {
            const hybridorswaplist = ["hybrid", "swap"]
            hybridorswap = randomChoice(hybridorswaplist)
            completeprompt += "["
          }
        
          if(subtypelocation != "all") {
            if(subtypelocation=="location")
              locationwildcardlist = ["-location-"]
            else if(subtypelocation=="fantasy location")
              locationwildcardlist = ["-locationfantasy-"]
            else if(subtypelocation=="videogame location")
              locationwildcardlist = ["-locationvideogame-"]
            else if(subtypelocation=="sci-fi location")
              locationwildcardlist = ["-locationscifi-"]
            else if(subtypelocation=="biome")
              locationwildcardlist = ["-locationbiome-"]
            else if(subtypelocation=="city")
              locationwildcardlist = ["-locationcity-"]
          }

          
          const chosenlocationwildcard = randomChoice(locationwildcardlist)
          completeprompt += chosenlocationwildcard + " "

          if(hybridorswap == "hybrid")
              completeprompt += "|" + chosenlocationwildcard  + "] "
          if(hybridorswap == "swap")
              completeprompt += ":" + chosenlocationwildcard + ":" + randint(1,5) +  "] "
        } else
          completeprompt += " " + givensubject + " " 
        
        hybridorswap = ""

        // completion of strenght end
        completeprompt += "-objectstrengthend-"

        // shots from inside can create cool effects in landscapes
        if(chance_roll(Math.max(1,insanitylevel-2), subjectlandscapeaddonlocationchance) && insideshot == 0) {
          insideshot = 1
          // lets cheat a bit here, we can do something cool I saw on reddit
          // @ts-ignore
          if(mainchooser == "humanoid" && legendary_dist(insanitylevel))
            completeprompt += " looking at a -addontolocationinside- "
          // @ts-ignore
          else if(mainchooser == "humanoid" && legendary_dist(insanitylevel))
            completeprompt += " facing a -addontolocationinside- "
          else if(legendary_dist(insanitylevel))
            completeprompt += " in the distance there is a -addontolocationinside- "
          else
            completeprompt += " from inside of a -addontolocationinside- "
        }

        if(chance_roll(insanitylevel, subjectlandscapeaddonlocationchance) && insideshot == 0) {
          completeprompt += " and "
          if(chance_roll(insanitylevel, subjectlandscapeaddonlocationdescriptorchance))
            completeprompt += "-locationdescriptor- " 
          if(chance_roll(insanitylevel, subjectlandscapeaddonlocationculturechance))
            completeprompt += "-culture- "

          //addontolocation = [locationlist,buildinglist, vehiclelist]
          if(randint(0,1) == 1)
            completeprompt += "-addontolocation- "
          else
            completeprompt += "-background- "
        }
      }


      if(mainchooser == "concept") {
        // first add a wildcard that can be used to create prompt strenght
        completeprompt += " -objectstrengthstart- "
        if(subjectchooser == "conceptmixer") {
          let chosenconceptmixerprelist = randomChoice(conceptmixerlist)
          let chosenconceptmixerlist = chosenconceptmixerprelist.split("@")
          let chosenconceptmixer = [chosenconceptmixerlist[0]].join('')
          let chosenconceptmixersubject = [chosenconceptmixerlist[1]].join('')

          // if there is a subject override, then replace the subject with that
          if(givensubject=="")
            chosenconceptmixer = chosenconceptmixer.replaceAll("-subject-",chosenconceptmixersubject )
          else if(givensubject != "" && !subjectingivensubject)
            chosenconceptmixer = chosenconceptmixer.replaceAll("-subject-",givensubject )
          
          if(overrideoutfit != "" && (chosenconceptmixer.includes("-outfit-") || chosenconceptmixer.includes("-minioutfit-"))) {
            chosenconceptmixer = chosenconceptmixer.replaceAll("-outfit-",overrideoutfit )
            chosenconceptmixer = chosenconceptmixer.replaceAll("-minioutfit-",overrideoutfit )
            outfitmode = 1 // We dont want another outfit in this case
          }
          
          completeprompt += chosenconceptmixer
        } else if(givensubject == "" || (subjectingivensubject && givensubject != "")) {
          if(subjectchooser == "event")
            completeprompt += "  \"-event-\"  "
        
          if(subjectchooser == "concept")
            completeprompt += "  \"The -conceptprefix- of -conceptsuffix-\"  "

          if(subjectchooser == "poemline")
            completeprompt += "  \"-poemline-\"  "

          if(subjectchooser == "songline")
            completeprompt += "  \"-songline-\"  "

          if(subjectchooser == "cardname") 
            completeprompt += "  \"-cardname-\" "

          if(subjectchooser == "episodetitle")
            completeprompt += "  \"-episodetitle-\"  "
        }

        // making subject override work with X and Y concepts, much fun!
        else if(givensubject != "" && subjectchooser == "concept" && !subjectingivensubject) {
          if(randint(0,3) == 0)
            completeprompt += " \"The -conceptprefix- of " + givensubject + "\" "
          else
            completeprompt += " \"The " + givensubject + " of -conceptsuffix-\" "
        } else
          completeprompt += " " + givensubject + " " 

        // completion of strenght end
        completeprompt += " -objectstrengthend-"
      } // build_dynamic_prompt.py LINE 2573

      if(subjectingivensubject)
        completeprompt += " " + givensubjectpromptlist[1] + " "
      
      if(genjoboractivity && genjoboractivitylocation == "middle") {
        const joboractivitylist = [joblist,humanactivitylist]
        completeprompt += randomChoice(randomChoice(joboractivitylist)) + ", "
      }
      
      if(descriptorsintheback == 2) {
        // Common to have 1 description, uncommon to have 2
        if(chance_roll(insanitylevel, subjectdescriptor1chance) && generatedescriptors) {
          if(animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple", "firstname"]) {
            if(less_verbose) {
              if(anime_mode && randint(0,2) < 2)
                completeprompt += ", -basicbitchdescriptor- "
              else
                completeprompt += ", -humandescriptor- "
            }
            else if(randint(0,3) > 0)
              completeprompt += ", OR(;-heshe- is;normal) OR(;very;rare) -humandescriptor- "
            else if(subjectchooser == "manwomanmultiple")
              completeprompt += ", the -samehumansubject- are OR(;very;rare) -humandescriptor-"
            else
              completeprompt += ", OR(the -manwoman-;-samehumansubject-) is OR(;very;rare) -humandescriptor-"
          }
          else if(mainchooser == "landscape") {
            if(less_verbose)
              completeprompt += ", -locationdescriptor- "
            else
              completeprompt += ", OR(;-heshe- is;normal) OR(;very;rare) -locationdescriptor- "
          }
          else if(mainchooser == "animal") {
            if(less_verbose)
              completeprompt += ", -animaldescriptor- "
            else
              completeprompt += ", OR(;-heshe- is;normal) OR(;very;rare) -animaldescriptor- "
          }
          else {
            if(less_verbose)
              completeprompt += ", -descriptor- "
            else
              completeprompt += ", OR(;-heshe- is;normal) OR(;very;rare) -descriptor- "
          }

          if(chance_roll(insanitylevel, subjectdescriptor2chance) && generatedescriptors) {
            if(animalashuman || subjectchooser in ["human", "job", "fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple","firstname"]) {
              if(less_verbose)
                completeprompt += ", -humandescriptor- "
              else
                completeprompt += " and -humandescriptor- "
            }
            else if(mainchooser == "landscape") {
              if(less_verbose)
                completeprompt += ", -locationdescriptor- "
              else
                completeprompt += " and -locationdescriptor- "
            }
            else if(mainchooser == "animal") {
              if(less_verbose)
                completeprompt += ", -animaldescriptor- "
              else
                completeprompt += " and -animaldescriptor- "
            }
            else {
              if(less_verbose)
                completeprompt += ", -descriptor- "
              else
                completeprompt += " and -descriptor- "
            }
          }
        }  
            
        completeprompt += ", "
      } // build_dynamic_prompt.py LINE 2634

    } // build_dynamic_prompt.py LINE 2634


    //// set the insanitylevel back
    if(superprompter)
      insanitylevel = originalinsanitylevel

    if(!thetokinatormode) {
      // object additions
      for (let i = 0; i < objectadditionsrepeats; i++) {
        if(mainchooser == "object" && chance_roll(insanitylevel, objectadditionschance) && generateobjectaddition)
          completeprompt += ", -objectaddition- , "
      }
  
  
      // riding an animal, holding an object or driving a vehicle, rare
      if((animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple","firstname"]) && chance_roll(insanitylevel, humanadditionchance) && generatehumanaddition) {
        humanspecial = 1
        completeprompt += "-humanaddition- "
      }
          
      completeprompt += ", "

      // unique additions for all types:
      if(chance_roll(insanitylevel, overalladditionchance) && generateoveralladdition)
        completeprompt += "-overalladdition- "


      // SD understands emoji's. Can be used to manipulate facial expressions.
      // emoji, legendary
      if((animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple","firstname"]) && chance_roll(insanitylevel, emojichance) && generateemoji)
          completeprompt += "-emoji-, "

      // human expressions
      if((animalashuman || subjectchooser in ["animal as human,","human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple","firstname"]) && chance_roll(insanitylevel, humanexpressionchance) && generatehumanexpression)
        completeprompt += "-humanexpression-, "
          

      // cosplaying
      //if(subjectchooser in ["animal as human", "non fictional", "humanoid"] and rare_dist(insanitylevel) and humanspecial != 1)
      //    completeprompt += "cosplaying as " + randomChoice(fictionallist) + ", "

      // Job 
      // either go job or activity, not both

      if(genjoboractivity && genjoboractivitylocation == "back") {
        if(randint(0,1)==0)
          completeprompt +=  ", " + randomChoice(humanactivitylist)+ ", "
        else
          completeprompt +=  ", OR(,; as a;rare) -job-, "
      }

      // add face builder sometimes on generic humans
      if(subjectchooser in ["human", "humanoid", "manwomanrelation","firstname"] && chance_roll(insanitylevel, buildfacechance) && generateface)
        completeprompt += randomChoice(buildfacelist) + ", "

      // custom mid list
      for (let i = 0; i < custominputmidrepeats; i++) {
        if(chance_roll(insanitylevel, custominputmidchance) && generatecustominputmid)
          completeprompt += randomChoice(custominputmidlist) + ", "
      }
      
      // add in some more mini vomits
      if(chance_roll(insanitylevel, minivomitmidchance) && generateminivomit)
        completeprompt += " -minivomit-, "
      
      // outfit builder
      
      if(outfitmode == 2) {
        completeprompt += " " + randomChoice(buildoutfitlist) + ", "
        if(extraordinary_dist(insanitylevel))
          completeprompt += " -outfitvomit-, "
      } else if(outfitmode == 2 && overrideoutfit != "" && imagetype != "only templates mode") {
        completeprompt += " " + randomChoice(buildoutfitlist) + ", "
        if(extraordinary_dist(insanitylevel))
          completeprompt += " -outfitvomit-, "
      }
      
      if((animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple", "firstname"])  && chance_roll(insanitylevel, posechance) && humanspecial != 1 && generatepose)
        completeprompt += randomChoice(poselist) + ", "
      
      if(subjectchooser in ["human","job","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple", "firstname"] && chance_roll(insanitylevel, hairchance) && generatehairstyle) {
        completeprompt += randomChoice(buildhairlist) + ", "
        if(unique_dist(insanitylevel))
          completeprompt += " -hairvomit-, "
      }

      if((animalashuman || subjectchooser in ["human","fictional", "non fictional", "humanoid", "manwomanrelation","manwomanmultiple", "firstname"]) && chance_roll(insanitylevel, accessorychance) && generateaccessorie && generateaccessories)
        completeprompt += randomChoice(buildaccessorielist) + ", "

      if(chance_roll(insanitylevel, humanoidinsideshotchance) && !["landscape", "concept"].includes(subjectchooser) && generateinsideshot) {
        insideshot = 1
        completeprompt += randomChoice(insideshotlist) + ", "
      }
      
      if(!["landscape", "concept"].includes(subjectchooser) && subjectchooser && humanspecial != 1 && insideshot == 0 && chance_roll(insanitylevel, humanoidbackgroundchance) && generatebackground)
        completeprompt += randomChoice(backgroundtypelist) + ", "

      // minilocation bit
      if(subjectchooser in ["landscape"] && chance_roll(insanitylevel, landscapeminilocationchance) && generateminilocationaddition)
        completeprompt += " -minilocationaddition-, "
          
      if(chance_roll(insanitylevel, generalminilocationchance) && generateminilocationaddition)
        completeprompt += " -minilocationaddition-, "


      // divider between subject and everything else
      completeprompt += " @@@ "
      

      // Add more quality while in greg mode lol
      if(originalartistchoice == "greg mode" && generatequality)
        completeprompt += "-quality-, "

      // landscapes it is nice to always have a time period
      if(chance_roll(insanitylevel, timperiodchance) || subjectchooser=="landscape") {
        if(generatetimeperiod)
          completeprompt += "-timeperiod-, "
      }

      if(!["landscape"].includes(mainchooser) && chance_roll(insanitylevel, focuschance) && generatefocus)
        completeprompt += "-focus-, "
    } // build_dynalic_prompt.py LINE 2756

    // artists in the middle, can happen as well:

    if(artists != "none" && artistsplacement == "middle" && generateartist) {
      completeprompt += ", "
      doartistnormal = true
      if(artists == "greg mode") {
        artistbylist = ["art by", "designed by", "stylized by", "by"]
        completeprompt += randomChoice(artistbylist) + " -gregmode-, "
        doartistnormal = false

        // in case we have ALL, we can also do a specific artist mode per chosen subject. sometimes
      }
      else if(originalartistchoice == "all" && randint(0,3) == 0) {
        if(mainchooser in ["humanoid", "animal"]) {
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
      }
      
      if(doartistnormal) {
        // sometimes do this as well, but now in the front of the artists
        if(giventypeofimage=="" && imagetype == "all" && randint(0, 2) == 0)
          completeprompt += "-artiststyle- art, "

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

        
        const modeselector = randint(0,10)
        if (modeselector < 4 && end - step >= 2) {
          const artistmodeslist = ["hybrid", "stopping", "adding", "switching"]
          artistmode = artistmodeslist[modeselector]
          if(!advancedprompting)
            artistmode = "normal"
          if (artistmode in ["hybrid","switching"] && end - step == 1)
            artistmode = "normal"
        }
        // if there are not enough artists in the list, then just go normal
        if(artistlist.length < 3)
          artistmode = "normal"
        
        if (artistmode in ["hybrid", "stopping", "adding","switching"])
          completeprompt += " ["
            
        while (step < end) {
          if(normal_dist(insanitylevel) && !remove_weights)
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
          
          if (artistmode in ["hybrid"] && end - step != 1)
            completeprompt += "|"
          if (artistmode in ["switching"] && end - step != 1)
            completeprompt += ":"
      
          if (!["hybrid", "switching"].includes(artistmode) && end - step != 1)
            completeprompt += ","
          
          isweighted = 0
          
          step = step + 1
        }

        if (artistmode in ["stopping"]) {
          completeprompt += "::"
          completeprompt += randint(1,19)
        }
        
        if (artistmode in ["switching","adding"])
          completeprompt += ":" + randint(1,18)
        if (artistmode in ["hybrid", "stopping","adding", "switching"])
          completeprompt += "] "
        
        completeprompt += ", "
        // end of the artist stuff
      } // build_dynamic_prompt.py LINE 2786
    } // build_dynamic_prompt.py LINE 2868

    if(!thetokinatormode) {
      // todo
      let descriptivemode = false
      // if we have artists, maybe go in artists descriptor mode
      if(!anime_mode && !less_verbose && !templatemode && !specialmode && completeprompt.includes("-artist-") && uncommon_dist(Math.max(8 - insanitylevel,3))) {
        for (let i = 0; i < randint(1,3); i++) {
          // print("adding artist stuff")
          completeprompt += ", -artistdescription-"
          descriptivemode = true
        }
        completeprompt += ", "
      }

      // if not, we could go in random styles descriptor mode
      else if(!anime_mode && !less_verbose && !templatemode && !specialmode && legendary_dist(10 - insanitylevel)) {
        for (let i = 0; i < randint(1, Math.max(7,insanitylevel + 2)); i++) {
          // print("adding random crap")
          completeprompt += ", -allstylessuffix-"
          descriptivemode = true
        }
        completeprompt += ", "
      }

      // and on high levels, DO EVERYTHING :D
      if(!descriptivemode || rare_dist(insanitylevel)) {
        // Add more quality while in greg mode lol
        if(originalartistchoice == "greg mode" && generatequality)
          completeprompt += "-quality-, "

        // others
        if(chance_roll(Math.max(1,insanitylevel -1), directionchance) && generatedirection)
          completeprompt += "-direction-, "

        if(chance_roll(insanitylevel, moodchance) && generatemood)
          completeprompt += "-mood-, " 

        // add in some more mini vomits
        if(chance_roll(insanitylevel, minivomitsuffixchance) && generateminivomit)
          completeprompt += " -minivomit-, "

        if(chance_roll(insanitylevel, artmovementchance) && generateartmovement)
          completeprompt += "-artmovement-, "  
        
        if(chance_roll(insanitylevel, lightingchance) && generatelighting)
          completeprompt += "-lighting-, "  

        // determine wether we have a photo or not
        if(completeprompt.toLowerCase().includes("photo"))
          isphoto = 1
            
        if(chance_roll(insanitylevel, photoadditionchance) && isphoto == 1 && generatephotoaddition)
          completeprompt += randomChoice(photoadditionlist) + ", "
                
        if(isphoto == 1 && generatecamera)
          completeprompt += "-camera-, "  

        if(chance_roll(insanitylevel, lenschance) || isphoto == 1) {
          if(generatelens)
            completeprompt += "-lens-, "
        }

        if(chance_roll(insanitylevel, colorschemechance) && generatecolorscheme)
          completeprompt += "-colorscheme-, "

        // vomit some cool/wierd things into the prompt
        if(chance_roll(insanitylevel, vomit1chance) && generatevomit) {
          completeprompt += "-vomit-, "
          if(chance_roll(insanitylevel, vomit2chance))
            completeprompt += "-vomit-, "
        }

        // human specfic vomit
        if(mainchooser == "humanoid" && chance_roll(insanitylevel, humanvomitchance) && generatehumanvomit) {
          completeprompt += "-humanvomit-, "
          if(chance_roll(insanitylevel, humanvomitchance))
            completeprompt += "-humanvomit-, "
        }

        //adding a great work of art, like starry night has cool effects. But this should happen only very rarely.
        if(chance_roll(insanitylevel, greatworkchance) && generategreatwork)
          completeprompt += " in the style of -greatwork-, "

        //adding a poemline. But this should happen only very rarely.
        if(chance_roll(insanitylevel, poemlinechance) && generatepoemline)
          completeprompt += " \"-poemline-\", "

        //adding a songline. But this should happen only very rarely.
        if(chance_roll(insanitylevel, songlinechance) && generatesongline)
          completeprompt += " \"-songline-\", "

        // everyone loves the adding quality. The better models don't need this, but lets add it anyway
        if((chance_roll(insanitylevel, quality1chance) || originalartistchoice == "greg mode") && generatequality) {
          completeprompt += "-quality-, "
          if((chance_roll(insanitylevel, quality2chance) || originalartistchoice == "greg mode"))
            completeprompt += "-quality-, "
        }
      } // build_dynamic_prompt.py LINE 2960
    } // build_dynamic_prompt.py LINE 2960

    // start second part of art blaster here
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
        step = step + 1
      }
    } 
    
    // start second part of unique art here
    if(uniqueartmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(artmovementlist?.length))
          completeprompt += "-artmovement-, "
        if(uncommon_dist(insanitylevel) && Boolean(colorschemelist?.length))
          completeprompt += "-colorscheme-, "
        if(rare_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
        if(rare_dist(insanitylevel) && Boolean(lightinglist?.length))
          completeprompt += "-lighting-, "
        if(unique_dist(insanitylevel) && Boolean(qualitylist?.length))
          completeprompt += "-quality-, "
        if(unique_dist(insanitylevel) && Boolean(artistlist?.length))
          completeprompt += "-artist-, "
        if(novel_dist(insanitylevel) && Boolean(greatworklist?.length))
          completeprompt += "in style of -greatwork-, "
        if(novel_dist(insanitylevel) && Boolean(poemlinelist?.length))
          completeprompt += "\"-poemline-\", "
        if(novel_dist(insanitylevel) && Boolean(songlinelist?.length))
          completeprompt += "\"-songline-\", "
        
        step = step + 1 
      }
    } // build_dynamic_prompt.py LINE 3005
        
    // start second part of quality vomit here
    if(qualityvomitmode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
        if(uncommon_dist(insanitylevel) && Boolean(vomitlist?.length))
          completeprompt += "-vomit-, "
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

    // start second part of mood color here
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
        step = step + 1
      } 
    }


    // start second part of photo fantasy here
    if(photofantasymode) {
      let step = 0
      let end = randint(1, insanitylevel) + 1
      while (step < end) {
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

    // start second part of massive madness here
    if(massivemadnessmode) {
      completeprompt += ", "
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
        step = step + 1 
      }
    }

    // start styles mode here
    if(stylesmode)
      completeprompt += chosenstylesuffix

    let templatesmodechance = 0
    if(uncommon_dist(insanitylevel) && !anime_mode) // not for anime models!
      templatesmodechance = 1

    if(dynamictemplatesmode && templatesmodechance == 1) {
      for (let i = 0;i < randint(1,Math.max(2,insanitylevel));i++)
        completeprompt += ", -allstylessuffix-"
    } // build_dynamic_prompt.py LINE 3102

    if(dynamictemplatesmode && common_dist(insanitylevel) && templatesmodechance == 0) {
      if(completeprompt.includes("-artist-") || artists == "none") {
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artist-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artist-" not in sentence.lower()]
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artiststyle-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artiststyle-" not in sentence.lower()]
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artistdescription-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artistdescription-" not in sentence.lower()]
      }
      if(completeprompt.includes("-lighting-")) {
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-lighting-")) // [sentence for sentence in dynamictemplatessuffixlist if "-lighting-" not in sentence.lower()]
      }
      if(completeprompt.includes("-shotsize-"))
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-shotsize-")) // [sentence for sentence in dynamictemplatessuffixlist if "-shotsize-" not in sentence.lower()]
      if(completeprompt.includes("-artmovement-"))
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artmovement-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artmovement-" not in sentence.lower()]
      if(completeprompt.includes("-imagetype-") || completeprompt.includes("-othertype-")) {
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-imagetype-")) // [sentence for sentence in dynamictemplatessuffixlist if "-imagetype-" not in sentence.lower()]
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-othertype-")) // [sentence for sentence in dynamictemplatessuffixlist if "-othertype-" not in sentence.lower()]
      }
      if(completeprompt.includes("-colorcombination-") || completeprompt.includes("-colorscheme")) {
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-colorcombination-")) // [sentence for sentence in dynamictemplatessuffixlist if "-colorcombination-" not in sentence.lower()]
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-colorscheme-")) // [sentence for sentence in dynamictemplatessuffixlist if "-colorscheme-" not in sentence.lower()]
      }
      if(completeprompt.includes("-mood-") || completeprompt.includes("-humanexpression")) {
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-mood-")) // [sentence for sentence in dynamictemplatessuffixlist if "-mood-" not in sentence.lower()]
        dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-humanexpression-")) // [sentence for sentence in dynamictemplatessuffixlist if "-humanexpression-" not in sentence.lower()]
      }
      chosenstylesuffix = randomChoice(dynamictemplatessuffixlist)
      completeprompt += ". " + chosenstylesuffix
    
      if(normal_dist(insanitylevel)) {
        if(completeprompt.includes("-artist-"))
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artist-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artist-" not in sentence.lower()]
        if(completeprompt.includes("-lighting-"))
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-lighting-")) // [sentence for sentence in dynamictemplatessuffixlist if "-lighting-" not in sentence.lower()]
        if(completeprompt.includes("-shotsize-"))
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-shotsize-")) // [sentence for sentence in dynamictemplatessuffixlist if "-shotsize-" not in sentence.lower()]
        if(completeprompt.includes("-artmovement-"))
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-artmovement-")) // [sentence for sentence in dynamictemplatessuffixlist if "-artmovement-" not in sentence.lower()]
        if(completeprompt.includes("-imagetype-") || completeprompt.includes("-othertype-")) {
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-imagetype-")) // [sentence for sentence in dynamictemplatessuffixlist if "-imagetype-" not in sentence.lower()]
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-othertype-")) // [sentence for sentence in dynamictemplatessuffixlist if "-othertype-" not in sentence.lower()]
        }
        if(completeprompt.includes("-colorcombination-") || completeprompt.includes("-colorscheme")) {
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-colorcombination-")) // [sentence for sentence in dynamictemplatessuffixlist if "-colorcombination-" not in sentence.lower()]
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-colorscheme-")) // [sentence for sentence in dynamictemplatessuffixlist if "-colorscheme-" not in sentence.lower()]
        }
        if(completeprompt.includes("-mood-") || completeprompt.includes("-humanexpression")) {
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-mood-")) // [sentence for sentence in dynamictemplatessuffixlist if "-mood-" not in sentence.lower()]
          dynamictemplatessuffixlist = dynamictemplatessuffixlist.filter(it => !it.toString().toLowerCase().includes("-humanexpression-")) // [sentence for sentence in dynamictemplatessuffixlist if "-humanexpression-" not in sentence.lower()]
        }
        chosenstylesuffix = randomChoice(dynamictemplatessuffixlist)
        completeprompt += " " + chosenstylesuffix
      }
    } // build_dynamic_prompt.py LINE 3148

    // custom style list
    if(chance_roll(insanitylevel, customstyle1chance) && generatestyle) {
      completeprompt += "-styletilora-, "
      if(chance_roll(insanitylevel, customstyle2chance))
        completeprompt += "-styletilora-, "
    }

    // custom suffix list
    for (let i = 0;i < custominputsuffixrepeats;i++) {
      if(chance_roll(insanitylevel, custominputsuffixchance) && generatecustominputsuffix)
        completeprompt += randomChoice(custominputsuffixlist) + ", "
    }

    if (["enhancing"].includes(artistmode))
      completeprompt += "::" + randint(1,17) + "] "

    if(artists != "none" && artistsplacement == "back" && generateartist) {
      completeprompt += ", "
      doartistnormal = true
      if(artists == "greg mode") {
        artistbylist = ["art by", "designed by", "stylized by", "by"]
        completeprompt += randomChoice(artistbylist) + " -gregmode- ,"
        doartistnormal = false
      }
      // in case we have ALL, we can also do a specific artist mode per chosen subject. sometimes
      else if(originalartistchoice == "all" && randint(0,3) == 0) {
        if(mainchooser in ["humanoid", "animal"]) {
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
        
        const modeselector = randint(0,10)
        if (modeselector < 4 && end - step >= 2) {
          const artistmodeslist = ["hybrid", "stopping", "adding", "switching"]
          artistmode = artistmodeslist[modeselector]
          if(advancedprompting == false)
            artistmode = "normal"
          if (artistmode in ["hybrid","switching"] && end - step == 1)
            artistmode = "normal"
        }
        // if there are not enough artists in the list, then just go normal
        if(artistlist.length < 3)
          artistmode = "normal"
        
        if (artistmode in ["hybrid", "stopping", "adding","switching"])
          completeprompt += " ["
            
        while (step < end) {
          if(normal_dist(insanitylevel) && !remove_weights)
            isweighted = 1
        
          if (isweighted == 1)
            completeprompt += " ("
    
          //completeprompt = add_from_csv(completeprompt, "artists", 0, "art by ","")
          if(step == minstep) {
            // sometimes do this
            if(giventypeofimage == "" && imagetype == "all" && randint(0, 1) == 0) {
              if(artiststyleselectormode == "normal")
                completeprompt += artiststyleselector + " art "
              else
                completeprompt += "-artiststyle- art "
            }
            artistbylist = ["art by", "designed by", "stylized by", "by"]
          } else
            artistbylist = [""]
          completeprompt += randomChoice(artistbylist) + " -artist-"
          
          if (isweighted == 1)
            completeprompt += ":" + (1 + (randint(-3,3)/10)).toString() + ")"       
          
          if (artistmode in ["hybrid"] && !(end - step == 1))
            completeprompt += "|"
          if (artistmode in ["switching"] && !(end - step == 1))
            completeprompt += ":"
    
          if (!["hybrid", "switching"].includes(artistmode) && !(end - step == 1))
            completeprompt += ","
          
          isweighted = 0
          
          step = step + 1
    
        } // build_dynamic_prompt.py LINE 3260
    
        if (artistmode in ["stopping"]) {
          completeprompt += "::"
          completeprompt += randint(1,19)
        }
        
        if (artistmode in ["switching","adding"])
          completeprompt += ":" + randint(1,18)
        if (artistmode in ["hybrid", "stopping","adding", "switching"])
          completeprompt += "] "
      }
    } // build_dynamic_prompt.py LINE 3270
    // end of the artist stuff

    if(partlystylemode) {
      // add a part of the style to the back
      const chosenstylesuffixlist = chosenstylesuffix.split(",")
      for (let i = 0;i < chosenstylesuffixlist.length;i++) {
        if(randint(3, 10) < insanitylevel)
          chosenstylesuffixlist.splice(randint(0, chosenstylesuffixlist.length - 1), 1)
      }
      const chosenstylesuffixcomplete = chosenstylesuffixlist.join(", ")
      

      completeprompt += ", " + chosenstylesuffixcomplete
    }
      
    if(artifymode) {
      const amountofartists = "random"
      let mode = ''
      if(unique_dist(insanitylevel))
        mode = "super remix turbo"
      else if(legendary_dist(insanitylevel))
        mode = "remix"
      else
        mode = "standard"
      completeprompt = await artify_prompt(insanitylevel, completeprompt, artists, amountofartists, mode, seed)
    }
    
    completeprompt += " -tempnewwords- "
    completeprompt += ", "

    completeprompt = prefixprompt + ", " + completeprompt
    completeprompt += suffixprompt

    // and then up the compounding stuff
    compoundcounter += 1
    
    // Here comes all the seperator stuff for prompt compounding
    if(compoundcounter < promptstocompound) {
      if(seperator == "comma")
        completeprompt += " \n , "
      else
        completeprompt += " \n " + seperator + " "
    } // build_dynamic_prompt.py LINE 3309

  } // build_dynamic_prompt.py LINE 3309

  //end of the while loop, now clean up the prompt

  customizedLogger('99-1', completeprompt);

  // In front and the back?
  if(!dynamictemplatesmode)
    completeprompt = parse_custom_functions(completeprompt, insanitylevel)

  customizedLogger('99-2', completeprompt);
  
  // Sometimes change he/she to the actual subject
  // Doesnt work if someone puts in a manual subject
  if(mainchooser == "humanoid" && (givensubject == "" || (subjectingivensubject && givensubject != "")) && subjectchooser != "manwomanmultiple") {
    let samehumanreplacementlist = ["-heshe-","-heshe-","-heshe-","-heshe-","-heshe-", "-samehumansubject-", "-samehumansubject-", "-samehumansubject-", "-samehumansubject-", "-samehumansubject-"]
    shuffle(samehumanreplacementlist)

    customizedLogger('99-3-1', completeprompt);
    
    // Convert completeprompt to a list to allow character-wise manipulation
    const completeprompt_list = completeprompt.split("")
    // Iterate over the characters in completeprompt_list
    for (let i = 0;i < (completeprompt_list.length - "-heshe-".length + 1);i++) {
      if (completeprompt_list.slice(i, i + "-heshe-".length).join('') == "-heshe-") {
        // Replace -heshe- with a value from the shuffled list
        const replacement = samehumanreplacementlist.pop()
        completeprompt_list.splice(i, "-heshe-".length, ...(replacement?.split('') ?? []))
      }
    }
    // Convert the list back to a string
    completeprompt = completeprompt_list.join("")
  }

  customizedLogger('99-2', completeprompt);
  
  // Sometimes change he/she to the actual subject
  if((mainchooser in  ["animal", "object"]) && (givensubject == "" || (subjectingivensubject && givensubject != ""))) {
    let sameobjectreplacementlist = ["-heshe-","-heshe-","-heshe-","-heshe-","-heshe-", "-sameothersubject-", "-sameothersubject-", "-sameothersubject-", "-sameothersubject-", "-sameothersubject-"]
    shuffle(sameobjectreplacementlist)

    customizedLogger('99-4-1', completeprompt);

    // Convert completeprompt to a list to allow character-wise manipulation
    let completeprompt_list = completeprompt.split("")

    // Iterate over the characters in completeprompt_list
    for (let i = 0;i < (completeprompt_list.length - "-heshe-".length + 1);i++) {
      if (completeprompt_list.slice(i, i + "-heshe-".length).join('') == "-heshe-") {
        // Replace -heshe- with a value from the shuffled list
        const replacement = sameobjectreplacementlist.pop()
        completeprompt_list.splice(i, "-heshe-".length, ...(replacement?.split('') ?? []))
      }
    }
    // Convert the list back to a string
    completeprompt = completeprompt_list.join('')
  }

  customizedLogger('99-3', completeprompt);

  // hair descriptor
  if(rare_dist(insanitylevel)) // Use base hair descriptor, until we are not.
    completeprompt = completeprompt.replaceAll("-hairdescriptor-", "-descriptor-")
  
  // human descriptor
  if(rare_dist(insanitylevel)) // Use base human descriptor, until we are not.
    completeprompt = completeprompt.replaceAll("-humandescriptor-", "-descriptor-")
  
  // location descriptor
  if(rare_dist(insanitylevel)) // Use base location descriptor, until we are not.
    completeprompt = completeprompt.replaceAll("-locationdescriptor-", "-descriptor-")
  
  // animeal descriptor
  if(rare_dist(insanitylevel)) // Use base animal descriptor, until we are not.
    completeprompt = completeprompt.replaceAll("-animaldescriptor-", "-descriptor-")


  // sometimes, culture becomes traditional!
  if(unique_dist(insanitylevel))
    completeprompt = completeprompt.replaceAll("-culture-", "traditional -culture-")


  // first some manual stuff for outfit

  if(unique_dist(insanitylevel)) // sometimes, its just nice to have descriptor and a normal "outfit". We use mini outfits for this!
    completeprompt = completeprompt.replace("-outfit-", "-minioutfit-")
  if(rare_dist(insanitylevel)) // Use base outfit descriptor, until we are not.
    completeprompt = completeprompt.replaceAll("-outfitdescriptor-", "-descriptor-")

  customizedLogger('100-1', completeprompt);
  
  // if -outfit- is in the override, we want a consistent result
  if(overrideoutfit.includes("-outfit-")) {
    if(chance_roll(insanitylevel, "common"))
      overrideoutfit = overrideoutfit.replaceAll("-outfit-", randomChoice(outfitlist))
    else
      overrideoutfit = overrideoutfit.replaceAll("-outfit-", randomChoice(minioutfitlist))
  }

  if(overrideoutfit != "") {
    completeprompt = completeprompt.replaceAll("-sameoutfit-", overrideoutfit)
    completeprompt = completeprompt.replace("-outfit-", overrideoutfit)
    completeprompt = completeprompt.replace("-minioutfit-", overrideoutfit)
    completeprompt = completeprompt.replaceAll("-overrideoutfit-", overrideoutfit)
  }

  if(givensubject != "" && subjectingivensubject == false) {
    completeprompt = completeprompt.replaceAll("-samehumansubject-", givensubject)
    completeprompt = completeprompt.replaceAll("-sameothersubject-", givensubject)
  } // build_dynamic_prompt.py 3402

  customizedLogger('101-1', completeprompt);


  // If we don't have an override outfit, then remove this part
  completeprompt = completeprompt.replaceAll("-overrideoutfit-", "")

  // sometimes replace one descriptor with a artmovement, only on high insanitylevels
  if(insanitylevel > 7 && unique_dist(insanitylevel))
    completeprompt = completeprompt.replace("-descriptor-", "-artmovement-")

  // On low insanity levels (lower than 5) ,a chance refer to the basic bitch list on some occasions
  if(randint(0,insanitylevel) == 0 && insanitylevel < 5) {
    completeprompt = completeprompt.replaceAll("-locationdescriptor-", "-basicbitchdescriptor-")
    completeprompt = completeprompt.replaceAll("-humandescriptor-", "-basicbitchdescriptor-")
    completeprompt = completeprompt.replaceAll("-outfitdescriptor-", "-basicbitchdescriptor-")
    completeprompt = completeprompt.replaceAll("-descriptor-", "-basicbitchdescriptor-")
    completeprompt = completeprompt.replaceAll("-animaldescriptor-", "-basicbitchdescriptor-")
  }

  // we now have color combinations, which are stronger than just color. So lets change them while we are at it.
  if(randint(0, Math.max(0, insanitylevel - 2)) <= 0) {
    completeprompt = completeprompt.replaceAll("-color- and -color-", "-colorcombination-") // any color and color becomes a color combination

    let colorreplacementlist = ["-color-","-color-","-color-","-colorcombination-","-colorcombination-", "-colorcombination-", "-colorcombination-", "-colorcombination-", "-colorcombination-", "-colorcombination-"]
    shuffle(colorreplacementlist)
    
    // Convert completeprompt to a list to allow character-wise manipulation
    const completeprompt_list = completeprompt.split('')
    // Iterate over the characters in completeprompt_list            
    for (let i = 0;i < (completeprompt_list.length - "-color-".length + 1);i++) {
      if (completeprompt_list.slice(i, i + "-color-".length).join('') == "-color-") {
        // Replace -color- with a value from the shuffled list
        const replacement = colorreplacementlist.pop()
        completeprompt_list.splice(i, "-color-".length, ...(replacement?.split('') ?? []))
      }
    }

    // Convert the list back to a string
    completeprompt = completeprompt_list.join('')
  }

  customizedLogger('102-1', completeprompt);

  // we now have material combinations, which are stronger than just one material. So lets change them while we are at it.
  if(randint(0, Math.max(0, insanitylevel - 4)) <= 0) {
    completeprompt = completeprompt.replaceAll("-material- and -material-", "-materialcombination-") // any color and color becomes a color combination

    let materialreplacementlist = ["-material-","-material-","-material-","-materialcombination-","-materialcombination-", "-materialcombination-", "-materialcombination-", "-materialcombination-", "-materialcombination-", "-materialcombination-"]
    shuffle(materialreplacementlist)
    
    // Convert completeprompt to a list to allow character-wise manipulation
    const completeprompt_list = completeprompt.split('')
    // Iterate over the characters in completeprompt_list
    for (let i = 0;i < (completeprompt_list.length - "-material-".length + 1);i++) {
      if (completeprompt_list.slice(i, i + "-material-".length).join('') == "-material-") {
        // Replace -material- with a value from the shuffled list
        const replacement = materialreplacementlist.pop()
        completeprompt_list.splice(i, "-material-".length, ...(replacement?.split('') ?? []))
      }
    }

    // Convert the list back to a string
    completeprompt = completeprompt_list.join('')
  } // build_dynamic_prompt.py LINE 3458

  customizedLogger('102-2', completeprompt);

  while (check_completeprompt_include(completeprompt)) {
    const allwildcardslistnohybrid = [
      "-color-","-object-", "-animal-", "-fictional-","-nonfictional-","-building-","-vehicle-","-location-","-conceptprefix-","-food-","-haircolor-","-hairstyle-","-job-", "-accessory-", "-humanoid-", "-manwoman-", "-human-", "-colorscheme-", "-mood-", "-genderdescription-", "-artmovement-", "-malefemale-", "-bodytype-", "-minilocation-", "-minilocationaddition-", "-pose-", "-season-", "-minioutfit-", "-elaborateoutfit-", "-minivomit-", "-vomit-", "-rpgclass-", "-subjectfromfile-","-outfitfromfile-", "-brand-", "-space-", "-artist-", "-imagetype-", "-othertype-", "-quality-", "-lighting-", "-camera-", "-lens-","-imagetypequality-", "-poemline-", "-songline-", "-greatwork-", "-fantasyartist-", "-popularartist-", "-romanticismartist-", "-photographyartist-", "-emoji-", "-timeperiod-", "-shotsize-", "-musicgenre-", "-animaladdition-", "-addontolocationinside-", "-addontolocation-", "-objectaddition-", "-humanaddition-", "-overalladdition-", "-focus-", "-direction-", "-styletilora-", "-manwomanrelation-", "-waterlocation-", "-container-", "-firstname-", "-flora-", "-print-", "-miniactivity-", "-pattern-", "-animalsuffixaddition-", "-chair-", "-cardname-", "-covering-", "-heshe-", "-hisher-", "-himher-", "-outfitdescriptor-", "-hairdescriptor-", "-hairvomit-", "-humandescriptor-", "-manwomanmultiple-", "-facepart-", "-buildfacepart-", "-outfitvomit-", "-locationdescriptor-", "-basicbitchdescriptor-", "-animaldescriptor-", "-humanexpression-", "-humanvomit-", "-eyecolor-", "-fashiondesigner-", "-colorcombination-", "-materialcombination-", "-oppositefictional-", "-oppositenonfictional-", "-photoaddition-", "-age-", "-agecalculator-", "-gregmode-"
      ,"-portraitartist-", "-characterartist-" , "-landscapeartist-", "-scifiartist-", "-graphicdesignartist-", "-digitalartist-", "-architectartist-", "-cinemaartist-", "-setting-", "-charactertype-", "-objectstohold-", "-episodetitle-", "-token-", "-allstylessuffix-", "-fluff-", "-event-", "-background-"
      , "-occult-", "-locationfantasy-", "-locationscifi-", "-locationvideogame-", "-locationbiome-", "-locationcity-", "-bird-", "-cat-", "-dog-", "-insect-", "-pokemon-", "-pokemontype-", "-marinelife-"
    ]
    const allwildcardslistnohybridlists = [
      colorlist, objectlist, animallist, fictionallist, nonfictionallist, buildinglist, vehiclelist, locationlist,conceptprefixlist,foodlist,haircolorlist, hairstylelist,joblist, accessorielist, humanoidlist, manwomanlist, humanlist, colorschemelist, moodlist, genderdescriptionlist, artmovementlist, malefemalelist, bodytypelist, minilocationlist, minilocationadditionslist, poselist, seasonlist, minioutfitlist, elaborateoutfitlist, minivomitlist, vomitlist, rpgclasslist, customsubjectslist, customoutfitslist, brandlist, spacelist, artistlist, imagetypelist, othertypelist, qualitylist, lightinglist, cameralist, lenslist, imagetypequalitylist, poemlinelist, songlinelist, greatworklist, fantasyartistlist, popularartistlist, romanticismartistlist, photographyartistlist, emojilist, timeperiodlist, shotsizelist, musicgenrelist, animaladditionlist, addontolocationinsidelist, addontolocationlist, objectadditionslist, humanadditionlist, overalladditionlist, focuslist, directionlist, stylestiloralist, manwomanrelationlist, waterlocationlist, containerlist, firstnamelist, floralist, printlist, miniactivitylist, patternlist, animalsuffixadditionlist, chairlist, cardnamelist, coveringlist, heshelist, hisherlist, himherlist, outfitdescriptorlist, hairdescriptorlist, hairvomitlist, humandescriptorlist, manwomanmultiplelist, facepartlist, buildfacepartlist, outfitvomitlist, locationdescriptorlist, basicbitchdescriptorlist, animaldescriptorlist, humanexpressionlist, humanvomitlist, eyecolorlist, fashiondesignerlist, colorcombinationlist, materialcombinationlist, oppositefictionallist, oppositenonfictionallist, photoadditionlist, agelist, agecalculatorlist, gregmodelist
      , portraitartistlist, characterartistlist, landscapeartistlist, scifiartistlist, graphicdesignartistlist, digitalartistlist, architectartistlist, cinemaartistlist, settinglist, charactertypelist, objectstoholdlist, episodetitlelist, tokenlist, allstylessuffixlist, flufferlist, eventlist, backgroundlist
      , occultlist, locationfantasylist, locationscifilist, locationvideogamelist, locationbiomelist, locationcitylist, birdlist, catlist, doglist, insectlist, pokemonlist, pokemontypelist, marinelifelist
    ]

    const allwildcardslistwithhybrid = ["-material-", "-descriptor-", "-outfit-", "-conceptsuffix-","-culture-", "-objecttotal-", "-outfitprinttotal-", "-element-"]
    const allwildcardslistwithhybridlists = [materiallist, descriptorlist,outfitlist,conceptsuffixlist,culturelist, objecttotallist, outfitprinttotallist, elementlist]


    //  keywordsinstring = any(word.lower() in givensubject.lower() for word in keywordslist)
    for (const wildcard of allwildcardslistnohybrid) {
      const attachedlist = allwildcardslistnohybridlists[allwildcardslistnohybrid.indexOf(wildcard)]
      completeprompt = await replacewildcard(completeprompt, insanitylevel, wildcard, attachedlist,false, advancedprompting, artiststyleselector)
    }

    for (const wildcard of allwildcardslistwithhybrid) {
      let attachedlist = allwildcardslistwithhybridlists[allwildcardslistwithhybrid.indexOf(wildcard)]
      completeprompt = await replacewildcard(completeprompt, insanitylevel, wildcard, attachedlist.map(x => x.toString()),true, advancedprompting, artiststyleselector)
    } // LINE 3625
  } // LINE 3625

  customizedLogger('102-3', completeprompt);

  // completeprompt = await replace_user_wildcards(completeprompt)

  customizedLogger('103-1', completeprompt);

  // prompt strenght stuff

  // if the given subject already is formed like this ( :1.x)
  // then just ignore this

  let matches: string[] = []
  if(givensubject != "") {
    matches = Array.from(givensubject.match(/\(\w+:\d+\.\d+\)/g) ?? [])
  }

  let strenght = "1.0"
  if(completeprompt.length > 325 && !matches.length && !remove_weights) {
    if(completeprompt.length < 375)
      strenght = "1.1"  
    else if(completeprompt.length < 450)
      strenght = "1.2"  
    else
      strenght = "1.3"  
    completeprompt = completeprompt.replaceAll("-objectstrengthstart-","(")
    completeprompt = completeprompt.replaceAll("-objectstrengthend-",":" + strenght + ")")
  } else {
    completeprompt = completeprompt.replaceAll("-objectstrengthstart-","")
    completeprompt = completeprompt.replaceAll("-objectstrengthend-","")
  }


  // Now, we are going to parse any custom functions we have build in
  // this is OR()
  // OR()

  // OR(foo;bar;bla)  --> randomly take foo, bar or bla
  // OR(foo;bar;bla;uncommon) --> Take foo, unless it hits uncommon roll. Then take bar or bla
  // OR(;foo)  --> empty or foo
  // OR(;foo;uncommon) --> empty unless it hits uncommon roll. Then take foo
  // OR(;foo;bar;uncommon) --> empty unless it hits uncommon roll. Then take foo or bar


  completeprompt = parse_custom_functions(completeprompt, insanitylevel)

  // prompt enhancer!
  if(!templatemode && !specialmode && base_model != "Stable Cascade") {
    // how insane do we want it?

    const maxamountofwords = Math.max(0, -1 + randint(0,4),6 - insanitylevel)
    const amountofwords = randint(0,maxamountofwords)

    if(amountofwords > 0) {
      const enhance_positive_words = await enhance_positive(completeprompt, amountofwords)
      completeprompt = completeprompt.replaceAll("-tempnewwords-", enhance_positive_words)
    }
  }

  completeprompt = completeprompt.replaceAll("-tempnewwords-", "")

  customizedLogger('104-1', completeprompt);
      
  // clean it up
  completeprompt = cleanup(completeprompt, advancedprompting, insanitylevel)

  customizedLogger('105-1', completeprompt);

  let prompt_g = ""
  let prompt_l = ""

  // Split it up for support for prompt_g (subject) and prompt_l (style)
  if(completeprompt.includes("@@@") && prompt_g_and_l) {
    const promptlist = completeprompt.split("@@@")
    prompt_g = cleanup(promptlist[1], advancedprompting, insanitylevel)
    prompt_l = cleanup((promptlist[0] + ", " + promptlist[2]).replaceAll("of a",""), advancedprompting, insanitylevel)
  }
  if(completeprompt.includes("@@@") && superprompter) {
    //load_models()
    const promptlist = completeprompt.split("@@@")
    const subjectprompt = cleanup(promptlist[1], advancedprompting, insanitylevel)
    const startprompt = cleanup(promptlist[0], advancedprompting, insanitylevel)
    const endprompt = cleanup(promptlist[2], advancedprompting, insanitylevel)
    const superpromptresult = await one_button_superprompt(insanitylevel, subjectprompt, seed, givensubject, overrideoutfit, subjectchooser, gender, startprompt + endprompt)
    completeprompt = startprompt + ", " + superpromptresult + ", " + endprompt
    prompt_g = superpromptresult
    prompt_l = startprompt + endprompt
  } else if(!prompt_g_and_l) {
    prompt_g = completeprompt
    prompt_l = completeprompt
  }

  customizedLogger('106-1', completeprompt);
      

  completeprompt = completeprompt.replaceAll(" @@@ ", " ")
  completeprompt = completeprompt.replaceAll("@@@ ", " ")
  completeprompt = completeprompt.replaceAll(" @@@", " ")
  completeprompt = completeprompt.replaceAll("@@@", " ")
  completeprompt = cleanup(completeprompt, advancedprompting, insanitylevel)

  customizedLogger('107-1', completeprompt);

  //just for me, some fun with posting fake dev messages (ala old sim games)
  if(randint(1, 50) == 1) {
    console.log("")
    console.log(randomChoice(devmessagelist))
    console.log("")
  }

  console.log(completeprompt) // keep this! :D 

  if(!prompt_g_and_l)
    return completeprompt
  else
    return { completeprompt, prompt_g, prompt_l }

}