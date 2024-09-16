import { env, AutoModelForSeq2SeqLM, AutoTokenizer, PreTrainedModel, PreTrainedTokenizer } from '@xenova/transformers';
import { randint } from '../helpers/general';

env.allowLocalModels = true;
env.allowRemoteModels = false;

let model: PreTrainedModel;
let tokenizer: PreTrainedTokenizer

export async function loadSuperpromptV1Model () {
  if (!tokenizer)
    tokenizer = await AutoTokenizer.from_pretrained('/superprompt-v1');

  if (!model)
    model = await AutoModelForSeq2SeqLM.from_pretrained('/superprompt-v1');
}


export async function answerBySuperprompt(input_text="", max_new_tokens=512, repetition_penalty=1.2, temperature=0.5, top_p=1, top_k = 1 , seed=-1) {
  if (seed == -1)
    seed = randint(1, 1000000)

  if (!model || !tokenizer) throw new Error('Model or tokenizer not loaded');

  const { input_ids } = await tokenizer(input_text);

  //outputs = model.generate(input_ids, max_new_tokens=max_new_tokens, repetition_penalty=repetition_penalty,
  //                        do_sample=True, temperature=temperature, top_p=top_p, top_k=top_k)

  const outputs = await model.generate(input_ids, { max_length: 500, max_new_tokens, repetition_penalty, temperature, top_p, top_k });

  const decoded = tokenizer.decode(outputs[0], { skip_special_tokens: true });

  return decoded;

}
