import { csv_to_list } from "./helpers/csvUtil";
import { artist_category_csv_to_list, common_dist, load_config_csv, normal_dist, randint, randomChoice, rare_dist } from "./helpers/general";
import { OneButtonPresets } from "./helpers/presets";
import { translate_main_subject } from "./helpers/subjectUtils";

const OBPresets = new OneButtonPresets();

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
  // Otherwise, just do nothing and it will keep on working based on an earlier set seed
  if(seed > 0)
    seed = Math.random()

  let originalinsanitylevel = insanitylevel
  if (advancedprompting && Math.round(Math.random() * Math.max(0, insanitylevel - 2)) <= 0) {
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
  const fictionallist = await csv_to_list(csvfilename="fictional characters",antilist=antilist,skipheader=True,gender=gender)
  const nonfictionallist = await csv_to_list(csvfilename="nonfictional characters",antilist=antilist,skipheader=True,gender=gender)
  const oppositefictionallist = await csv_to_list(csvfilename="fictional characters",antilist=antilist,skipheader=True,gender=oppositegender)
  const oppositenonfictionallist = await csv_to_list(csvfilename="nonfictional characters",antilist=antilist,skipheader=True,gender=oppositegender)
  const conceptsuffixlist = await csv_to_list("concept_suffix",antilist)
  const buildinglist = await csv_to_list("buildings",antilist)
  const vehiclelist = await csv_to_list("vehicles",antilist)
  const outfitlist = await csv_to_list("outfits",antilist)
  const locationlist = await csv_to_list("locations",antilist)
  const backgroundlist = await csv_to_list("backgrounds",antilist)

  const accessorielist = await csv_to_list("accessories",antilist,"./csvfiles/",0,"?",False,False,gender)
  const artmovementlist = await csv_to_list("artmovements",antilist)
  const bodytypelist = await csv_to_list("body_types",antilist=antilist,skipheader=True,gender=gender)
  const cameralist = await csv_to_list("cameras",antilist)
  const colorschemelist = await csv_to_list("colorscheme",antilist)
  const conceptprefixlist = await csv_to_list("concept_prefix",antilist)
  const culturelist = await csv_to_list("cultures",antilist)
  let descriptorlist = await csv_to_list("descriptors",antilist)
  const devmessagelist = await csv_to_list("devmessages",antilist)
  const directionlist = await csv_to_list(csvfilename="directions",antilist=antilist,insanitylevel=insanitylevel)
  const emojilist = await csv_to_list("emojis",antilist)
  const eventlist = await csv_to_list("events",antilist)
  const focuslist = await csv_to_list(csvfilename="focus",antilist=antilist, insanitylevel=insanitylevel)
  const greatworklist = await csv_to_list("greatworks",antilist)
  const haircolorlist = await csv_to_list("haircolors",antilist)
  const hairstylelist = await csv_to_list("hairstyles",antilist)
  const hairvomitlist = await csv_to_list("hairvomit",antilist,"./csvfiles/",0,"?",False,False)
  
  const humanoidlist = await csv_to_list("humanoids",antilist) // build_dynamic_prompt.py LINE244
  let imagetypelist = [];
  if(anime_mode || imagetype=="all - anime") {
    if(imagetype == "all")
      imagetype = "all - anime"
    imagetypelist = await csv_to_list(csvfilename="imagetypes_anime",antilist=antilist, insanitylevel=insanitylevel, delimiter="?")
  } else {
    imagetypelist = await csv_to_list(csvfilename="imagetypes",antilist=antilist, insanitylevel=insanitylevel, delimiter="?")
  }
      

  const joblist = await csv_to_list(csvfilename="jobs",antilist=antilist,skipheader=True,gender=gender)
  const lenslist = await csv_to_list(csvfilename="lenses",antilist=antilist, insanitylevel=insanitylevel)
  const lightinglist = await csv_to_list(csvfilename="lighting",antilist=antilist, insanitylevel=insanitylevel)
  const malefemalelist = await csv_to_list(csvfilename="malefemale",antilist=antilist,skipheader=True,gender=gender)
  const manwomanlist = await csv_to_list(csvfilename="manwoman",antilist=antilist,skipheader=True,gender=gender)
  const moodlist = await csv_to_list(csvfilename="moods",antilist=antilist, insanitylevel=insanitylevel)
  const othertypelist = await csv_to_list("othertypes",antilist)
  const poselist = await csv_to_list("poses",antilist)
  const qualitylist = await csv_to_list("quality",antilist)
  const shotsizelist = await csv_to_list(csvfilename="shotsizes",antilist=antilist, insanitylevel=insanitylevel)
  const timeperiodlist = await csv_to_list("timeperiods",antilist)
  const vomitlist = await csv_to_list(csvfilename="vomit",antilist=antilist, insanitylevel=insanitylevel)
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
  const genderdescriptionlist = await csv_to_list(csvfilename="genderdescription",antilist=antilist,skipheader=True,gender=gender)
  const minilocationlist = await csv_to_list("minilocations", antilist)
  const minioutfitlist = await csv_to_list("minioutfits",antilist,"./csvfiles/",0,"?",False,False,gender)
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
  const manwomanrelationlist = await csv_to_list(csvfilename="manwomanrelations",antilist=antilist,skipheader=True,gender=gender)
  const manwomanmultiplelist = await csv_to_list(csvfilename="manwomanmultiples",antilist=antilist,skipheader=True,gender=gender,delimiter="?")
  const waterlocationlist = await csv_to_list("waterlocations", antilist)
  const containerlist = await csv_to_list("containers", antilist)
  const firstnamelist = await csv_to_list(csvfilename="firstnames",antilist=antilist,skipheader=True,gender=gender)
  const floralist = await csv_to_list("flora", antilist)
  const printlist = await csv_to_list("prints", antilist)
  const patternlist = await csv_to_list("patterns", antilist)
  const chairlist = await csv_to_list("chairs", antilist)
  const cardnamelist = await csv_to_list("card_names", antilist)
  const coveringlist = await csv_to_list("coverings", antilist)
  const facepartlist = await csv_to_list("faceparts", antilist)
  const outfitvomitlist = await csv_to_list(csvfilename="outfitvomit",antilist=antilist,delimiter="?")
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
  const episodetitlelist = await csv_to_list(csvfilename="episodetitles",antilist=antilist,skipheader=True)
  const flufferlist = await csv_to_list("fluff", antilist)
  const tokenlist = []
  
  // New set of lists
  const locationfantasylist = await csv_to_list("locationsfantasy", antilist)
  const locationscifilist = await csv_to_list("locationsscifi", antilist)
  const locationvideogamelist = await csv_to_list("locationsvideogame", antilist)
  const locationbiomelist = await csv_to_list("locationsbiome", antilist)
  const locationcitylist = await csv_to_list("locationscities", antilist)
  const birdlist = await csv_to_list("birds", antilist)
  const catlist = await csv_to_list(csvfilename="cats", antilist=antilist,delimiter="?")
  const doglist = await csv_to_list(csvfilename="dogs", antilist=antilist,delimiter="?")
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

  let artistlist = []
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
  const generatestyle = Boolean(stylestiloralist?.length) // True of not empty

  const custominputprefixlist = await csv_to_list("custom_input_prefix",antilist,"./userfiles/")
  const generatecustominputprefix = Boolean(custominputprefixlist?.length) // True of not empty

  const custominputmidlist = await csv_to_list("custom_input_mid",antilist,"./userfiles/")
  const generatecustominputmid = Boolean(custominputmidlist?.length) // True of not empty

  const custominputsuffixlist = await csv_to_list("custom_input_suffix",antilist,"./userfiles/")
  const generatecustominputsuffix = Boolean(custominputsuffixlist?.length) // True of not empty

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
  const imagetypemodelist = await csv_to_list("imagetypemodes", antilist,"./csvfiles/special_lists/",0,"?")
  const miniactivitylist = await csv_to_list("miniactivity", antilist,"./csvfiles/special_lists/",0,"?")
  const animalsuffixadditionlist = await csv_to_list("animalsuffixadditions", antilist,"./csvfiles/special_lists/",0,"?")
  const buildfacepartlist = await csv_to_list("buildfaceparts", antilist,"./csvfiles/special_lists/",0,"?")
  const conceptmixerlist = await csv_to_list("conceptmixer", antilist,"./csvfiles/special_lists/",0,"?")
  
  
  tokinatorlist = csv_to_list("tokinator", antilist,"./csvfiles/templates/",0,"?")
  styleslist = csv_to_list("styles", antilist,"./csvfiles/templates/",0,"?")
  stylessuffix = [item.split('-subject-')[1] for item in styleslist]
  breakstylessuffix = [item.split(',') for item in stylessuffix]
  allstylessuffixlist = [value for sublist in breakstylessuffix for value in sublist]
  allstylessuffixlist = list(set(allstylessuffixlist))

  artistsuffix = artist_descriptions_csv_to_list("artists_and_category")
  breakartiststylessuffix = [item.split(',') for item in artistsuffix]
  artiststylessuffixlist = [value for sublist in breakartiststylessuffix for value in sublist]
  artiststylessuffixlist = list(set(artiststylessuffixlist))
  allstylessuffixlist += artiststylessuffixlist
  
  dynamictemplatesprefixlist = csv_to_list("dynamic_templates_prefix", antilist,"./csvfiles/templates/",0,"?")
  dynamictemplatessuffixlist = csv_to_list("dynamic_templates_suffix", antilist,"./csvfiles/templates/",0,"?") // build_dynamic_prompt.py LINE 516
}