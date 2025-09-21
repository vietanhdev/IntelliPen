# Translation with Built-in AI

**Authors:** Thomas Steiner, Alexandra Klepper  
**Published:** November 13, 2024  
**Last updated:** May 20, 2025

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | 138+ ✅ |
| Edge    | Not supported ❌ |
| Firefox | Not supported ❌ |
| Safari  | Not supported ❌ |

Use the Translator API in Chrome to translate text with AI models provided in the browser.

Your website may already offer website content in multiple languages. With the Translator API, users can write in their first language. For example, users can participate in support chats in their first language, and your site can translate their message into your support agents' first language, before the message leaves the user's device. This creates a smooth, fast, and inclusive experience for all users.

Translation of web content typically requires using a cloud service. First, the source content is uploaded to a server, which runs the translation to a target language, then the resulting text is downloaded and returned to the user. When the content is ephemeral and doesn't warrant saving to a database, client-side translation saves time and cost over a hosted translation service.

## Get Started

Run feature detection to see if the browser supports the Translator API.

```javascript
if ('Translator' in self) {
  // The Translator API is supported.
}
```

While you always know the target language for translations, you may not always know the source language. In such cases, you can use the Language Detector API.

## Model Download

The Translator API uses an expert model trained to generate high-quality translations. The API is built into Chrome, and the model is downloaded the first time a website uses this API.

To determine if the model is ready to use, call the asynchronous `Translator.availability()` function. If the response to `availability()` is `downloadable`, listen for download progress to inform the user of its progress, as it may take time.

> **Note:** The Translator API hides the download status of specific language pairs, to protect user privacy. Instead, all language pairs are reported as downloadable until individual sites create a translator for a given pair.

## Check Language Pair Support

Translation is managed with language packs, downloaded on demand. A language pack is like a dictionary for a given language.

- **sourceLanguage:** The current language for the text
- **targetLanguage:** The final language the text should be translated into

Use BCP 47 language short codes as strings. For example, `'es'` for Spanish or `'fr'` for French.

```javascript
const translatorCapabilities = await Translator.availability({
  sourceLanguage: 'es',
  targetLanguage: 'fr',
});
// 'available'
```

Listen for model download progress with the `downloadprogress` event:

```javascript
const translator = await Translator.create({
  sourceLanguage: 'es',
  targetLanguage: 'fr',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

If the download fails, then `downloadprogress` events stop and the ready promise is rejected.

## Create and Run the Translator

To create a translator, check for user activation and call the asynchronous `create()` function. The Translator `create()` function requires an options parameter with two fields, one for the `sourceLanguage` and one for the `targetLanguage`.

```javascript
// Create a translator that translates from English to French.
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
});
```

Once you have a translator, call the asynchronous `translate()`.

```javascript
await translator.translate('Where is the next bus stop, please?');
// "Où est le prochain arrêt de bus, s'il vous plaît ?"
```

Alternatively, if you need to deal with longer texts, you can also use the streaming version of the API and call `translateStreaming()`.

```javascript
const stream = translator.translateStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Sequential Translations

Translations are processed sequentially. If you send large amounts of text to be translated, subsequent translations are blocked until the earlier ones complete.

For the best response to your requests, chunk them together and add a loading interface, such as a spinner, to convey that translation is ongoing.

## Demo

You can see the Translator API, used in combination with the Language Detector API, in the [Translator and Language Detector API playground](link).

## Permission Policy, iframes, and Web Workers

By default, the Translator API is only available to top-level windows and to same-origin iframes. Access to the API can be delegated to cross-origin iframes using the Permissions Policy `allow=""` attribute:

```html
<!--
  The host site https://main.example.com can grant a cross-origin iframe
  at https://cross-origin.example.com/ access to the Translator API by
  setting the `allow="translator"` attribute.
-->
<iframe src="https://cross-origin.example.com/" allow="translator"></iframe>
```

The Translator API isn't available in Web Workers, due to the complexity of establishing a responsible document for each worker, in order to check the Permissions Policy status.