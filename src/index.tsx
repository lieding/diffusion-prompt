// import { env, AutoModelForSeq2SeqLM, AutoTokenizer } from '@xenova/transformers';

// env.allowLocalModels = true;
// env.allowRemoteModels = false;

// async function load () {
//   const tokenizer = await AutoTokenizer.from_pretrained('/superprompt-v1');
//   const model = await AutoModelForSeq2SeqLM.from_pretrained('/superprompt-v1');
//   const { input_ids } = await tokenizer('Expand the following prompt to add more detail: one asian girl');
//   const outputs = await model.generate(input_ids, { max_length: 500 });
//   console.log(outputs.length);
//   const decoded = tokenizer.decode(outputs[0], { skip_special_tokens: true });

//   console.log(decoded);
// }

// load();


