# Summarize with Built-in AI

**Author:** Thomas Steiner  
**Published:** November 11, 2024  
**Last updated:** July 30, 2025

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | 138+ ✅ |
| Edge    | Behind a flag 🚩 |
| Firefox | Not supported ❌ |
| Safari  | Not supported ❌ |

You can offer your users the ability to distill lengthy articles, complex documents, or even lively chat conversations into concise and insightful summaries.

The Summarizer API can be used to generate different types of summaries in varied lengths and formats, such as sentences, paragraphs, bullet point lists, and more. We believe this API is useful in the following scenarios:

- Summarizing the key points of an article or a chat conversation
- Suggesting titles and headings for articles
- Creating a concise and informative summary of a lengthy text
- Generating a teaser for a book based on a book review

> **Important:** Gemini Nano is a generative AI model. Before you build with APIs that use Gemini Nano, you should review the People + AI Guidebook for best practices, methods, and examples for designing with AI.

## Get Started

The Summarizer API is available from Chrome 138 stable.

Before you use this API, acknowledge Google's Generative AI Prohibited Uses Policy.

Run feature detection to see if the browser supports the Summarizer API.

```javascript
if ('Summarizer' in self) {
  // The Summarizer API is supported.
}
```

### Review the Hardware Requirements

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

## Model Download

The Summarizer API uses a model trained to generate high-quality summaries. The API is built into Chrome, and Gemini Nano is the model downloaded the first time a website uses this API.

> **Important:** Gemini Nano is a generative AI model. Before you build with APIs that use Gemini Nano, you should review the People + AI Guidebook for best practices, methods, and examples for designing with AI.

To determine if the model is ready to use, call the asynchronous `Summarizer.availability()` function. If the response to `availability()` is `downloadable`, listen for download progress to inform the user of its progress, as it may take time.

```javascript
const availability = await Summarizer.availability();
```

To trigger the model download and create the summarizer, check for user activation, then call the asynchronous `Summarizer.create()` function.

```javascript
// Proceed to request batch or streaming summarization
const summarizer = await Summarizer.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

## API Functions

The `create()` function lets you configure a new summarizer object to your needs. It takes an optional options object with the following parameters:

- **sharedContext:** Additional shared context that can help the summarizer
- **type:** The type of the summarization, with the allowed values `key-points` (default), `tldr`, `teaser`, and `headline`. See the following table for details.
- **format:** The format of the summarization, with the allowed values `markdown` (default) and `plain-text`
- **length:** The length of the summarization, with the allowed values `short`, `medium` (default), and `long`. The meanings of these lengths vary depending on the type requested. For example, in Chrome's implementation, a short key-points summary consists of three bullet points, and a short summary is one sentence.

Once set, the parameters can't be changed. Create a new summarizer object if you need to make modifications to the parameters.

The following table demonstrates the different types of summaries and their corresponding lengths. The lengths represent the maximum possible value, as sometimes, the results can be shorter.

| Type | Meaning | Length |
|------|---------|---------|
| `"tldr"` | Summary should be short and to the point, providing a quick overview of the input, suitable for a busy reader. | **short:** 1 sentence<br>**medium:** 3 sentences<br>**long:** 5 sentences |
| `"teaser"` | Summary should focus on the most interesting or intriguing parts of the input, designed to draw the reader in to read more. | **short:** 1 sentence<br>**medium:** 3 sentences<br>**long:** 5 sentences |
| `"key-points"` | Summary should extract the most important points from the input, presented as a bulleted list. | **short:** 3 bullet points<br>**medium:** 5 bullet points<br>**long:** 7 bullet points |
| `"headline"` | Summary should effectively contain the main point of the input in a single sentence, in the format of an article headline. | **short:** 12 words<br>**medium:** 17 words<br>**long:** 22 words |

For example, you could initialize a summarizer to output a medium length of key points in Markdown.

```javascript
const options = {
  sharedContext: 'This is a scientific article',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
};

const availability = await Summarizer.availability();
if (availability === 'unavailable') {
  // The Summarizer API isn't usable.
  return;
}

// Check for user activation before creating the summarizer
if (navigator.userActivation.isActive) {
  const summarizer = await Summarizer.create(options);
}
```

There are two ways to run the summarizer: streaming and batch (non-streaming).

### Batch Summarization

With batch summarization, the model processes the input as a whole and then produces the output.

To get a batch summary, call the `summarize()` function. The first argument is the text that you want to summarize. The second, optional argument is an object with a context field. This field lets you add background details that might improve the summarization.

```javascript
const longText = document.querySelector('article').innerHTML;
const summary = await summarizer.summarize(longText, {
  context: 'This article is intended for a tech-savvy audience.',
});
```

> **Tip:** Remove any unnecessary data, including HTML markup, when summarizing. For content present on a webpage, you can use the `innerText` property of an HTML element, as this property represents only the rendered text content of an element and its descendants.

### Streaming Summarization

Streaming summarization offers results in real-time. The output updates continuously as the input is added and adjusted. To get a streaming summary, call `summarizeStreaming()` instead of `summarize()`.

```javascript
const longText = document.querySelector('article').innerHTML;
const stream = summarizer.summarizeStreaming(longText, {
  context: 'This article is intended for junior developers.',
});
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Demo

You can try the Summarizer API in the [Summarizer API Playground](link).

## Permission Policy, iframes, and Web Workers

By default, the Summarizer API is only available to top-level windows and to their same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permission Policy `allow=""` attribute:

```html
<!--
  The hosting site at https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Summarizer API by
  setting the `allow="summarizer"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="summarizer"></iframe>
```

The Summarizer API isn't available in Web Workers for now. This is due to the complexity of establishing a responsible document for each worker, in order to check the Permissions Policy status.