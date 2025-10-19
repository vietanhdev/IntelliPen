# Language Detection with Built-in AI

**Author:** Thomas Steiner  
**Published:** September 24, 2024  
**Last updated:** May 20, 2025

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | 138+ ✅ |
| Edge    | Not supported ❌ |
| Firefox | Not supported ❌ |
| Safari  | Not supported ❌ |

**Source:** [Link]

Before translating text from one language to another, you must first determine what language is used in the given text. Previously, translation required uploading the text to a cloud service, performing the translation on the server, then downloading the results.

The Language Detector API works client-side, which means you can protect user privacy. While it's possible to ship a specific library which does this, it would require additional resources to download.

> **Note:** Join the Early Preview Program for an early look at new built-in AI APIs and access to discussion on our mailing list.

## When to Use Language Detection

The Language Detector API is primarily useful in the following scenarios:

- Determine the language of input text, so it can be translated
- Determine the language of input text, so the correct model can be loaded for language-specific tasks, such as toxicity detection
- Determine the language of input text, so it can be labeled correctly, for example, in online social networking sites
- Determine the language of input text, so an app's interface can be adjusted accordingly. For example, on a Belgian site to only show the interface relevant to users who speak French

## Get Started

Run feature detection to see if the browser supports the Language Detector API.

```javascript
if ('LanguageDetector' in self) {
  // The Language Detector API is available.
}
```

## Model Download

Language detection depends on a model that is fine-tuned for the specific task of detecting languages. While the API is built in the browser, the model is downloaded on-demand the first time a site tries to use the API. In Chrome, this model is very small by comparison with other models. It might already be present, as this model is used by other Chrome features.

To determine if the model is ready to use, call the asynchronous `LanguageDetector.availability()` function. If the response to `availability()` was `downloadable`, listen for download progress and inform the user, as the download may take time.

To trigger the download and instantiate the language detector, check for user activation. Then, call the asynchronous `LanguageDetector.create()` function.

```javascript
const detector = await LanguageDetector.create({
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

## Run the Language Detector

The Language Detector API uses a ranking model to determine which language is most likely used in a given piece of text. Ranking is a type of machine learning, where the objective is to order a list of items. In this case, the Language Detector API ranks languages from highest to lowest probability.

> **Note:** The Language Detector API is trained on a set of languages, which is not wholly inclusive of every language that exists. This means the API cannot detect every language with complete accuracy. From Chrome 132, you can check if a given language is available for detection.

The `detect()` function can return either the first result, the likeliest answer, or iterate over the ranked candidates with the level of confidence. This is returned as a list of `{detectedLanguage, confidence}` objects. The confidence level is expressed as a value between 0.0 (lowest confidence) and 1.0 (highest confidence).

```javascript
const someUserText = 'Hallo und herzlich willkommen!';
const results = await detector.detect(someUserText);
for (const result of results) {
  // Show the full list of potential languages with their likelihood, ranked
  // from most likely to least likely. In practice, one would pick the top
  // language(s) that cross a high enough threshold.
  console.log(result.detectedLanguage, result.confidence);
}
// (Output truncated):
// de 0.9993835687637329
// en 0.00038279531872831285
// nl 0.00010798392031574622
// ...
```

> **Caution:** Very short phrases and single words should be avoided, as the accuracy of the results will be low. If you commonly work with shorter text, experiment with your priority languages, review the reported confidence, and return the result as unknown when the confidence is too low.

## API Playground

Experiment with the Language Detector API in our API playground. Enter text written in different languages in the textarea.

[API Playground Link]

## Permission Policy, iframes, and Web Workers

By default, the Language Detector API is only available to top-level windows and to their same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permission Policy `allow=""` attribute:

```html
<!--
  The hosting site at https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Language Detector API by
  setting the `allow="language-detector"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="language-detector"></iframe>
```

The Language Detector API isn't available in Web Workers. This is due to the complexity of establishing a responsible document for each worker in order to check the Permissions Policy status.