// builds a prompt dynamically
// insanity level controls randomness of propmt 0-10
// forcesubject van be used to force a certain type of subject
// Set artistmode to none, to exclude artists 
function build_dynamic_prompt(
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

}