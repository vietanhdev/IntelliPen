# Rewriter API

**Authors:** Alexandra Klepper, Thomas Steiner  
**Published:** May 20, 2025

**Links:** [Explainer](link) | [Web Extensions](link) | [Chrome Status](link) | [Intent](link) | [GitHub](link) | [Origin Trial](link) | [View](link) | [Intent to Experiment](link)

The Rewriter API helps you revise and restructure text. This API and the Writer API are part of the Writing Assistance APIs proposal.

These APIs can help you improve content created by users.

> **Important:** Gemini Nano is a generative AI model. Before you build with APIs that use Gemini Nano, you should review the People + AI Guidebook for best practices, methods, and examples for designing with AI.

## Use Cases

Refine existing text by making it longer or shorter, or changing the tone. For example, you could:

- Rewrite a short email so that it sounds more polite and formal
- Suggest edits to customer reviews to help other customers understand the feedback or remove toxicity
- Format content to meet the expectations of certain audiences

Is your use case missing? Join the early preview program to share your feedback.

## Get Started

Join the Rewriter API origin trial, running in Chrome 137 to 142.

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

The Rewriter API is available in a joint origin trial with the Writer API. To start using these APIs:

1. Acknowledge Google's Generative AI Prohibited Uses Policy
2. Go to the Rewriter API origin trial
3. Click Register and fill out the form. In the Web origin field, provide your origin or extension ID, `chrome-extension://YOUR_EXTENSION_ID`
4. To submit, click Register
5. Copy the token provided, and add it to every participating web page on your origin or include it in your Extension manifest
6. Start using the Rewriter API

Learn more about how to get started with origin trials.

### Add Support to localhost

To access the Writer and Rewriter APIs on localhost during the origin trial, you must update Chrome to the latest version. Then, follow these steps:

1. Go to `chrome://flags/#rewriter-api-for-gemini-nano`
2. Select Enabled
3. Click Relaunch or restart Chrome

## Use the Rewriter API

First, run feature detection to see if the browser supports these APIs.

```javascript
if ('Rewriter' in self) {
  // The Rewriter API is supported.
}
```

The Rewriter API, and all other built-in AI APIs, are integrated in the browser. Gemini Nano is downloaded separately the first time any website uses a built-in AI API. In practice, if a user has already interacted with a built-in API, they have downloaded the model to their browser.

To determine if the model is ready to use, call the asynchronous `Rewriter.availability()` function. If the response to `availability()` was `downloadable`, listen for download progress and inform the user, as the download may take time.

```javascript
const availability = await Rewriter.availability();
```

To trigger model download and start the rewriter, check for user activation and call the `Rewriter.create()` function.

```javascript
const rewriter = await Rewriter.create({
  monitor(m) {
    m.addEventListener("downloadprogress", e => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  }
});
```

### API Functions

The `create()` function lets you configure a new rewriter object. It takes an optional options object with the following parameters:

- **tone:** Writing tone can refer to the style, character, or attitude of the content. The value can be set to `more-formal`, `as-is` (default), or `more-casual`.
- **format:** The output formatting, with the allowed values `as-is` (default), `markdown`, and `plain-text`.
- **length:** The length of the output, with the allowed values `shorter`, `as-is` (default), and `longer`.
- **sharedContext:** When rewriting multiple pieces of content, a shared context can help the model create content better aligned with your expectations.

> **Note:** Once set, the parameters can't be changed. Create a new rewriter object if you need to modify the parameters.

The following example demonstrates how to initiate a rewriter object:

```javascript
const options = {
  sharedContext: 'This is an email to acquaintances about an upcoming event.',
  tone: 'more-casual',
  format: 'plain-text',
  length: 'shorter',
};

const available = await Rewriter.availability();
let rewriter;
if (available === 'unavailable') {
  // The Rewriter API isn't usable.
  return;
}
if (available === 'available') {
  // The Rewriter API can be used immediately.
  rewriter = await Rewriter.create(options);
} else {
  // The Rewriter can be used after the model is downloaded.
  rewriter = await Rewriter.create(options);
  rewriter.addEventListener('downloadprogress', (e) => {
    console.log(e.loaded, e.total);
  });
}
```

## Start Rewriting

There are two ways to output content from the model: non-streaming and streaming.

### Non-streaming Output

With non-streaming rewriting, the model processes the input as a whole and then produces the output.

To get a non-streaming output, call the asynchronous `rewrite()` function. You must include the initial text that you want to be rewritten. You can add an optional context to provide the model background information, which may help the model better meet your expectations for the output.

```javascript
// Non-streaming
const rewriter = await Rewriter.create({
  sharedContext: "A review for the Flux Capacitor 3000 from TimeMachines Inc."
});
const result = await rewriter.rewrite(reviewEl.textContent, {
  context: "Avoid any toxic language and be as constructive as possible."
});
```

### Stream Rewriting Output

Streaming offers results in real-time. The output updates continuously as the input is added and adjusted.

To get a streaming rewriter, call the `rewriteStreaming()` function and iterate over the available segments of text in the stream. You can add an optional context to provide the model background information, which may help the model better meet your expectations for the output.

```javascript
const rewriter = await Rewriter.create({
  sharedContext: "A review for the Flux Capacitor 3000 from TimeMachines Inc."
});

const stream = rewriter.rewriteStreaming(reviewEl.textContent, {
  context: "Avoid any toxic language and be as constructive as possible.",
  tone: "more-casual",
});

for await (const chunk of stream) {
  composeTextbox.append(chunk);
}
```

### Share Context for Multiple Tasks

You may want to use a rewriter to generate multiple pieces of content. In this case, it's useful to add `sharedContext`. For example, you may want to help reviewers give better feedback in comments.

```javascript
// Shared context and per writing task context
const rewriter = await Rewriter.create({
  sharedContext: "This is for publishing on [popular website name], a business and employment-focused social media platform."
});

const stream = rewriter.rewriteStreaming(
  "Love all this work on generative AI at Google! So much to learn and so many new things I can do!",
  {
    context: "The request comes from someone working at a startup providing an e-commerce CMS solution.",
    tone: "more-casual",
  }
);

for await (const chunk of stream) {
  composeTextbox.append(chunk);
}
```

### Reuse a Rewriter

You can use the same rewriter to edit multiple pieces of content. This may be particularly useful if adding the rewriter to a feedback or commenting tool, to help writers offer productive and helpful feedback.

```javascript
// Reusing a rewriter
const rewriter = await Rewriter.create({
  sharedContext: "A review for the Flux Capacitor 3000 from TimeMachines Inc."
});

const rewrittenReviews = await Promise.all(
  Array.from(
    document.querySelectorAll("#reviews > .review"),
    (reviewEl) => rewriter.rewrite(reviewEl.textContent, {
      context: "Avoid any toxic language and be as constructive as possible.",
      tone: "more-casual",
    })
  ),
);
```

### Stop the Rewriter

To end the rewriting process, abort the controller and destroy the rewriter.

```javascript
// Stop a rewriter
const controller = new AbortController();
stopButton.onclick = () => controller.abort();

const rewriter = await Rewriter.create({ signal: controller.signal });
await rewriter.rewrite(reviewEl.textContent, { signal: controller.signal });

// Destroy a rewriter
rewriter.destroy();
```

## Demo

[Demo Link]

## Permission Policy, iframes, and Web Workers

By default, the Rewriter API is only available to top-level windows and to their same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permission Policy `allow=""` attribute:

```html
<!--
  The hosting site at https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Rewriter API by
  setting the `allow="rewriter"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="rewriter"></iframe>
```

The Rewriter API isn't available in Web Workers. This is due to the complexity of establishing a responsible document for each worker, in order to check the Permissions Policy status.

## Engage and Share Feedback

The Writer and Rewriter APIs are under active discussion and subject to change in the future. If you try this API and have feedback, we'd love to hear it.

- Read the explainer, raise questions and participate in discussion
- Review the implementation for Chrome on Chrome Status
- Join the early preview program for an early look at new APIs and access to our mailing list
- If you have feedback on Chrome's implementation, file a Chromium bug
- Discover all of the built-in AI APIs which use models, including Gemini Nano and other expert models, in the browser