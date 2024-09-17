import PromptGenerationWorker from './buildDynamicPrompt?worker&inline'

const worker = new PromptGenerationWorker()

worker.postMessage('  ')

const closeTimeout = setTimeout(() => {
  worker.terminate();
}, 15 * 1000)

worker.onmessage = (event: any) => {
  clearTimeout(closeTimeout)
  document.body.appendChild(document.createTextNode(event.data))
  worker.terminate();
}

