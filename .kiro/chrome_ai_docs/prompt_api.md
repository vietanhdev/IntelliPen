# The Prompt API

**Authors:** Thomas Steiner, Alexandra Klepper  
**Published:** May 20, 2025  
**Last updated:** July 21, 2025

**Links:** [Explainer](link) | [Web Extensions](link) | [Chrome Status](link) | [Intent](link) | [GitHub](link) | [Origin Trial](link) | [Chrome 138](link) | [View](link) | [Intent to Experiment](link)

With the Prompt API, you can send natural language requests to Gemini Nano in the browser.

There are many ways you can use the Prompt API in a web application or website. For example, you could build:

- **AI-powered search:** Answer questions based on the content of a web page
- **Personalized news feeds:** Build a feed that dynamically classifies articles with categories and allow for users to filter for that content

These are just a few possibilities, and we're excited to see what you create.

> **Important:** Gemini Nano is a generative AI model. Before you build with APIs that use Gemini Nano, you should review the People + AI Guidebook for best practices, methods, and examples for designing with AI.

## Review the Hardware Requirements

The following requirements exist for developers and the users who operate features using these APIs in Chrome. Other browsers may have different operating requirements.

The Language Detector and Translator APIs work in Chrome on desktop. These APIs do not work on mobile devices. The Prompt API, Summarizer API, Writer API, Rewriter API, and Proofreader API work in Chrome when the following conditions are met:

- **Operating system:** Windows 10 or 11; macOS 13+ (Ventura and onwards); Linux; or ChromeOS (from Platform 16389.0.0 and onwards) on Chromebook Plus devices. Chrome for Android, iOS, and ChromeOS on non-Chromebook Plus devices are not yet supported by the APIs which use Gemini Nano.
- **Storage:** At least 22 GB of free space on the volume that contains your Chrome profile.
  - Built-in models should be significantly smaller. The exact size may vary slightly with updates.
- **GPU:** Strictly more than 4 GB of VRAM.
- **Network:** Unlimited data or an unmetered connection.
  - **Key term:** A metered connection is a data-limited internet connection. Wi-Fi and ethernet connections tend to be unmetered by default, while cellular connections are often metered.

Gemini Nano's exact size may vary as the browser updates the model. To determine the current size, visit `chrome://on-device-internals`.

> **Note:** If the available storage space falls to less than 10 GB after the download, the model is removed from your device. The model redownloads once the requirements are met.

> **Note:** Before you use this API, acknowledge Google's Generative AI Prohibited Uses Policy.

## Use the Prompt API

The Prompt API uses the Gemini Nano model in Chrome. While the API is built into Chrome, the model is downloaded separately the first time an origin uses the API.

To determine if the model is ready to use, call `LanguageModel.availability()`. If the response to `availability()` was `downloadable`, listen for download progress and inform the user, as the download may take time.

```javascript
const availability = await LanguageModel.availability();
```

> **Caution:** Always pass the same options to the `availability()` function that you use in `prompt()` or `promptStreaming()`. This is critical to align model language and modality capabilities.

To trigger the download and instantiate the language model, check for user activation. Then, call the asynchronous `LanguageModel.create()` function.

```javascript
const session = await LanguageModel.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

## Model Parameters

The `params()` function informs you of the language model's parameters. The object has the following fields:

- **defaultTopK:** The default top-K value
- **maxTopK:** The maximum top-K value
- **defaultTemperature:** The default temperature
- **maxTemperature:** The maximum temperature

```javascript
await LanguageModel.params();
// {defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2}
```

## Create a Session

Once the Prompt API can run, you create a session with the `create()` function.

Each session can be customized with `topK` and `temperature` using an optional options object. The default values for these parameters are returned from `LanguageModel.params()`.

```javascript
const params = await LanguageModel.params();
// Initializing a new session must either specify both `topK` and
// `temperature` or neither of them.
const slightlyHighTemperatureSession = await LanguageModel.create({
  temperature: Math.max(params.defaultTemperature * 1.2, 2.0),
  topK: params.defaultTopK,
});
```

The `create()` function's optional options object also takes a `signal` field, which lets you pass an `AbortSignal` to destroy the session.

```javascript
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const session = await LanguageModel.create({
  signal: controller.signal,
});
```

## Add Context with Initial Prompts

With initial prompts, you can provide the language model with context about previous interactions, for example, to allow the user to resume a stored session after a browser restart.

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    { role: 'system', content: 'You are a helpful and friendly assistant.' },
    { role: 'user', content: 'What is the capital of Italy?' },
    { role: 'assistant', content: 'The capital of Italy is Rome.' },
    { role: 'user', content: 'What language is spoken there?' },
    {
      role: 'assistant',
      content: 'The official language of Italy is Italian. [...]',
    },
  ],
});
```

## Constrain Responses with a Prefix

You can add an "assistant" role, in addition to previous roles, to elaborate on the model's previous responses. For example:

```javascript
const followup = await session.prompt([
  {
    role: "user",
    content: "I'm nervous about my presentation tomorrow"
  },
  {
    role: "assistant",
    content: "Presentations are tough!"
  }
]);
```

In some cases, instead of requesting a new response, you may want to prefill part of the "assistant"-role response message. This can be helpful to guide the language model to use a specific response format. To do this, add `prefix: true` to the trailing "assistant"-role message. For example:

```javascript
const characterSheet = await session.prompt([
  {
    role: 'user',
    content: 'Create a TOML character sheet for a gnome barbarian',
  },
  {
    role: 'assistant',
    content: '```toml\n',
    prefix: true,
  },
]);
```

## Append Messages

Inference may take some time, especially when prompting with multimodal inputs. It can be useful to send predetermined prompts in advance to populate the session, so the model can get a head start on processing.

While `initialPrompts` are useful at session creation, the `append()` method can be used in addition to the `prompt()` or `promptStreaming()` methods, to give additional contextual prompts after the session is created.

For example:

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    {
      role: 'system',
      content:
        'You are a skilled analyst who correlates patterns across multiple images.',
    },
  ],
  expectedInputs: [{ type: 'image' }],
});

fileUpload.onchange = async () => {
  await session.append([
    {
      role: 'user',
      content: [
        {
          type: 'text',
          value: `Here's one image. Notes: ${fileNotesInput.value}`,
        },
        { type: 'image', value: fileUpload.files[0] },
      ],
    },
  ]);
};

analyzeButton.onclick = async (e) => {
  analysisResult.textContent = await session.prompt(userQuestionInput.value);
};
```

The promise returned by `append()` fulfills once the prompt has been validated, processed, and appended to the session. The promise is rejected if the prompt cannot be appended.

## Session Persistence and Limits

Each session keeps track of the context of the conversation. Previous interactions are taken into account for future interactions until the session's context window is full.

```javascript
const session = await LanguageModel.create({
  initialPrompts: [
    {
      role: 'system',
      content:
        'You are a friendly, helpful assistant specialized in clothing choices.',
    },
  ],
});

const result1 = await session.prompt(
  'What should I wear today? It is sunny. I am unsure between a t-shirt and a polo.',
);
console.log(result1);

const result2 = await session.prompt(
  'That sounds great, but oh no, it is actually going to rain! New advice?',
);
console.log(result2);
```

Each session has a maximum number of tokens it can process. Check your progress towards this limit with the following:

```javascript
console.log(`${session.inputUsage}/${session.inputQuota}`);
```

## Pass a JSON Schema

Add the `responseConstraint` field to `prompt()` or `promptStreaming()` method to pass a JSON Schema as the value. You can then use structured output with the Prompt API.

In the following example, the JSON Schema makes sure the model responds with true or false to classify if a given message is about pottery.

```javascript
const session = await LanguageModel.create();

const schema = {
  "type": "boolean"
};

const post = "Mugs and ramen bowls, both a bit smaller than intended, but that happens with reclaim. Glaze crawled the first time around, but pretty happy with it after refiring.";

const result = await session.prompt(
  `Is this post about pottery?\n\n${post}`,
  {
    responseConstraint: schema,
  }
);
console.log(JSON.parse(result));
// true
```

Your implementation can include a JSON Schema or regular expression as part of the message sent to the model. This uses some of the input quota. You can measure how much of the input quota it will use by passing the `responseConstraint` option to `session.measureInputUsage()`.

You can avoid this behavior with the `omitResponseConstraintInput` option. If you do so, we recommend that you include some guidance in the prompt:

```javascript
const result = await session.prompt(`
  Summarize this feedback into a rating between 0-5. Only output a JSON
  object { rating }, with a single property whose value is a number:
  The food was delicious, service was excellent, will recommend.
`, { responseConstraint: schema, omitResponseConstraintInput: true });
```

## Clone a Session

To preserve resources, you can clone an existing session with the `clone()` function. The conversation context is reset, but the initial prompt remains intact. The `clone()` function takes an optional options object with a `signal` field, which lets you pass an `AbortSignal` to destroy the cloned session.

```javascript
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const clonedSession = await session.clone({
  signal: controller.signal,
});
```

## Prompt the Model

You can prompt the model with either the `prompt()` or the `promptStreaming()` functions.

### Non-streamed Output

If you expect a short result, you can use the `prompt()` function that returns the response once it's available.

```javascript
// Start by checking if it's possible to create a session based on the
// availability of the model, and the characteristics of the device.
const { defaultTemperature, maxTemperature, defaultTopK, maxTopK } =
  await LanguageModel.params();

const available = await LanguageModel.availability();

if (available !== 'unavailable') {
  const session = await LanguageModel.create();

  // Prompt the model and wait for the whole result to come back.
  const result = await session.prompt('Write me a poem!');
  console.log(result);
}
```

### Streamed Output

If you expect a longer response, you should use the `promptStreaming()` function which lets you show partial results as they come in from the model. The `promptStreaming()` function returns a `ReadableStream`.

```javascript
const { defaultTemperature, maxTemperature, defaultTopK, maxTopK } =
  await LanguageModel.params();

const available = await LanguageModel.availability();
if (available !== 'unavailable') {
  const session = await LanguageModel.create();

  // Prompt the model and stream the result:
  const stream = session.promptStreaming('Write me an extra-long poem!');
  for await (const chunk of stream) {
    console.log(chunk);
  }
}
```

## Stop Prompting

Both `prompt()` and `promptStreaming()` accept an optional second parameter with a `signal` field, which lets you stop running prompts.

```javascript
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const result = await session.prompt('Write me a poem!', {
  signal: controller.signal,
});
```

## Terminate a Session

Call `destroy()` to free resources if you no longer need a session. When a session is destroyed, it can no longer be used, and any ongoing execution is aborted. You may want to keep the session around if you intend to prompt the model often since creating a session can take some time.

```javascript
await session.prompt(
  "You are a friendly, helpful assistant specialized in clothing choices."
);

session.destroy();

// The promise is rejected with an error explaining that
// the session is destroyed.
await session.prompt(
  "What should I wear today? It is sunny, and I am choosing between a t-shirt and a polo."
);
```

## Multimodal Capabilities

The Prompt API origin trial supports audio and image inputs. The API returns a text output.

With these capabilities, you could:

- Allow users to transcribe audio messages sent in a chat application
- Describe an image uploaded to your website for use in a caption or alt text

```javascript
const session = await LanguageModel.create({
  // { type: 'text' } only required when including expected input languages.
  expectedInputs: [{ type: 'audio' }, { type: 'image' }],
});

const referenceImage = await (await fetch('/reference-image.jpeg')).blob();
const userDrawnImage = document.querySelector('canvas');

const response1 = await session.prompt([
  {
    role: 'user',
    content: [
      {
        type: 'text',
        value:
          'Give an artistic critique of how well the second image matches the first:',
      },
      { type: 'image', value: referenceImage },
      { type: 'image', value: userDrawnImage },
    ],
  },
]);

console.log(response1);

const audioBlob = await captureMicrophoneInput({ seconds: 10 });

const response2 = await session.prompt([
  {
    role: 'user',
    content: [
      { type: 'text', value: 'My response to your critique:' },
      { type: 'audio', value: audioBlob },
    ],
  },
]);
```

See the [Mediarecorder Audio Prompt demo](link) for using the Prompt API with audio input and the [Canvas Image Prompt demo](link) for using the Prompt API with image input.

## Performance Strategy

The Prompt API for the web is still being developed. While we build this API, refer to our [best practices on session management](link) for optimal performance.

## Permission Policy, iframes, and Web Workers

By default, the Prompt API is only available to top-level windows and to their same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permission Policy `allow=""` attribute:

```html
<!--
  The hosting site at https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Prompt API by
  setting the `allow="language-model"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="language-model"></iframe>
```

The Prompt API isn't available in Web Workers for now, due to the complexity of establishing a responsible document for each worker in order to check the permissions policy status.    