import { build_dynamic_prompt } from "./PromptGeneration"
import { loadSuperpromptV1Model } from "./PromptGeneration/models/superprompter-v1"

// setTimeout(() => {
//   loadSuperpromptV1Model().then(console.log)
// }, 3000)

build_dynamic_prompt().then(console.log)