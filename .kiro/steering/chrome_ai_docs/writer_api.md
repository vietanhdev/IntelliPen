# Writer API

**Authors:** Alexandra Klepper, Thomas Steiner  
**Published:** May 20, 2025

**Links:** [Explainer](link) | [Web Extensions](link) | [Chrome Status](link) | [Intent](link) | [GitHub](link) | [Origin Trial](link) | [View](link) | [Intent to Experiment](link)

The Writer API helps you create new content that conforms to a specified writing task. The Writer API and the Rewriter API are part of the Writing Assistance APIs proposal.

These partner APIs can help you improve content created by users.

> **Important:** Gemini Nano is a generative AI model. Before you build with APIs that use Gemini Nano, you should review the People + AI Guidebook for best practices, methods, and examples for designing with AI.

## Use Cases

Write new content, based on your initial idea and optional context. This could be used to:

- Support users write any kind of content, like reviews, blog posts, or emails
- Help users write better support requests
- Draft an introduction for a series of work samples, to better capture certain skills

Is your use case missing? Join the early preview program to share your feedback.

## Get Started

Join the Writer API origin trial running in Chrome 137 to 142.

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

### Sign Up for the Origin Trial

The Writer API is available in a joint origin trial with the Rewriter API. To start using these APIs:

1. Acknowledge Google's Generative AI Prohibited Uses Policy
2. Go to the Writer API origin trial
3. Click Register and fill out the form. In the Web origin field, provide your origin or extension ID, `chrome-extension://YOUR_EXTENSION_ID`
4. To submit, click Register
5. Copy the token provided, and add it to every participating web page on your origin or include it in your Extension manifest
6. Start using the Writer and Rewriter APIs

Learn more about how to get started with origin trials.

### Add Support to localhost

To access the Writer and Rewriter APIs on localhost during the origin trial, you must update Chrome to the latest version. Then, follow these steps:

1. Go to `chrome://flags/#writer-api-for-gemini-nano`
2. Select Enabled
3. Click Relaunch or restart Chrome

## Use the Writer API

First, run feature detection to see if the browser supports these APIs.

```javascript
if ('Writer' in self) {
  // The Writer API is supported.
}
```

The Writer API, and all other built-in AI APIs, are integrated in the browser. Gemini Nano is downloaded separately the first time any website uses a built-in AI API. In practice, if a user has already interacted with a built-in API, they have downloaded the model to their browser.

To determine if the model is ready to use, call the asynchronous `Writer.availability()` function. If the response to `availability()` is `downloadable`, listen for download progress and inform the user, as the download may take time.

```javascript
const availability = await Writer.availability();
```

To trigger model download and start the writer, check for user activation and call the `Writer.create()` function.

```javascript
const writer = await Writer.create({
  monitor(m) {
    m.addEventListener("downloadprogress", e => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### API Functions

The `create()` function lets you configure a new writer object. It takes an optional options object with the following parameters:

- **tone:** Writing tone can refer to the style, character, or attitude of the content. The value can be set to `formal`, `neutral` (default), or `casual`.
- **format:** The output formatting, with the allowed values `markdown` (default) and `plain-text`.
- **length:** The length of the output, with the allowed values `short`, `medium` (default), and `long`.
- **sharedContext:** When writing multiple outputs, a shared context can help the model create content better aligned with your expectations.

> **Note:** Once set, the parameters can't be changed. Create a new writer object if you need to modify the parameters.

The following example demonstrates how to initiate a writer object:

```javascript
const options = {
  sharedContext: 'This is an email to acquaintances about an upcoming event.',
  tone: 'casual',
  format: 'plain-text',
  length: 'medium',
};

const available = await Writer.availability();
let writer;
if (available === 'unavailable') {
  // The Writer API isn't usable.
  return;
}
if (available === 'available') {
  // The Writer API can be used immediately.
  writer = await Writer.create(options);
} else {
  // The Writer can be used after the model is downloaded.
  const writer = await Writer.create({
    ...options,
    monitor(m) {
      m.addEventListener("downloadprogress", e => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    }
  });
}
```

## Start Writing

There are two ways to output writing from the model: non-streaming and streaming.

### Non-streaming Output

With non-streaming writing, the model processes the input as a whole and then produces the output.

To get a non-streaming output, call the asynchronous `write()` function. You must include a prompt for the content you want written. You can add an optional context to provide the model background information, which may help the model better meet your expectations for the output.

```javascript
// Non-streaming
const writer = await Writer.create();
const result = await writer.write(
  "An inquiry to my bank about how to enable wire transfers on my account.", {
    context: "I'm a longstanding customer",
  },
);
```

### Stream Writing Output

Streaming offers results in real-time. The output updates continuously as the input is added and adjusted.

To get a streaming writer, call the `writeStreaming()` function and iterate over the available segments of text in the stream. You can add an optional context to provide the model background information, which may help the model better meet your expectations for the output.

```javascript
// Streaming
const writer = await Writer.create();
const stream = writer.writeStreaming(
  "An inquiry to my bank about how to enable wire transfers on my account.", {
    context: "I'm a longstanding customer",
  },
);
for await (const chunk of stream) {
  composeTextbox.append(chunk);
}
```

### Share Context for Multiple Tasks

You may want to use a writer to generate multiple pieces of content. In this case, it's useful to add `sharedContext`. For example, you may want to help reviewers give better feedback in comments.

```javascript
// Shared context and per writing task context
const writer = await Writer.create({
  sharedContext: "This is for publishing on [popular website name], a business and employment-focused social media platform."
});

const stream = writer.writeStreaming(
  "Write a blog post about how I love all this work on gen AI at Google!" +
  "Mention that there's so much to learn and so many new things I can do!",
  { context: "The request comes from someone working at a startup providing an e-commerce CMS solution."}
);

for await (const chunk of stream) {
  composeTextbox.append(chunk);
}
```

### Reuse a Writer

You can use the same writer to create multiple pieces of content.

```javascript
// Reuse a writer
const writer = await Writer.create({ tone: "formal" });

const reviews = await Promise.all(
  Array.from(
    document.querySelectorAll("#reviews > .review"),
    (reviewEl) => writer.write(reviewEl.textContent)
  ),
);
```

### Stop the Writer

To end the writing process, abort the controller and destroy the writer.

```javascript
// Aborting a writer
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const writer = await Writer.create({ signal: controller.signal });
await writer.write(reviewEl.textContent, { signal: controller.signal });

// Destroying a writer
writer.destroy();
```

## Demo

[Demo Link]

## Permission Policy, iframes, and Web Workers

By default, the Writer API is only available to top-level windows and to their same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permission Policy `allow=""` attribute:

```html
<!--
  The hosting site at https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Writer API by
  setting the `allow="writer"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="writer"></iframe>
```

The Writer API isn't available in Web Workers. This is due to the complexity of establishing a responsible document for each worker in order to check the Permissions Policy status.

## Engage and Share Feedback

The Writer and Rewriter API are under active discussion and subject to change in the future. If you try this API and have feedback, we'd love to hear it.

- Read the explainer, raise questions and participate in discussion
- Review the implementation for Chrome on Chrome Status
- Join the early preview program for an early look at new APIs and access to our mailing list
- If you have feedback on Chrome's implementation, file a Chromium bug
- Discover all of the built-in AI APIs which use models, including Gemini Nano and other expert models, in the browser