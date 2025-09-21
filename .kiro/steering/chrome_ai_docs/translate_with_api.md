# Client-side Translation with AI

**Authors:** Maud Nalpas, Kenji Baheux, Alexandra Klepper  
**Published:** May 16, 2024  
**Last updated:** November 13, 2024

**Links:** [Explainer](link) | [Web Extensions](link) | [Chrome Status](link) | [Intent](link) | [MDN](link) | [Chrome 138](link) | [View](link) | [Intent to Ship](link)

> **Note:** The following document was published for Google I/O 2024. While it's still a useful walkthrough, you may find the code isn't as up-to-date. Take a look at the [Translator API documentation](link).

Expanding your business into international markets can be expensive. More markets likely means more languages to support, and more languages can lead to challenges with interactive features and flows, such as after-sale support chat. If your company only has English-speaking support agents, non-native speakers may find it difficult to explain exactly what problem they've encountered.

How can we use AI to improve the experience for speakers of multiple languages, while minimizing risk and confirming if it's worth investing in support agents who speak additional languages?

Some users try to overcome the language barrier with their browser's built-in page translation feature or third-party tools. But the user experience is sub-par with interactive features, like our after-sale support chat.

For chat tools with integrated translation, it's important to minimize delays. By processing language on device, you can translate in real-time, before the user even submits the message.

That said, transparency is critical when bridging a language gap with automated tools. Remember, before the conversation starts, make it clear you've implemented AI tools which allow for this translation. This sets expectations and helps avoid awkward moments if the translation isn't perfect. Link out to your policy with more information.

We're working on a client-side Translator API with a model built into Chrome.

## Review the Hardware Requirements

The following requirements exist for developers and the users who operate features using these APIs in Chrome. Other browsers may have different operating requirements.

The Language Detector and Translator APIs work in Chrome on desktop. These APIs do not work on mobile devices. The Prompt API, Summarizer API, Writer API, Rewriter API, and Proofreader API work in Chrome when the following conditions are met:

- **Operating system:** Windows 10 or 11; macOS 13+ (Ventura and onwards); Linux; or ChromeOS (from Platform 16389.0.0 and onwards) on Chromebook Plus devices. Chrome for Android, iOS, and ChromeOS on non-Chromebook Plus devices are not yet supported by the APIs which use Gemini Nano.
- **Storage:** At least 22 GB of free space on the volume that contains your Chrome profile.
  Built-in models should be significantly smaller. The exact size may vary slightly with updates.
- **GPU:** Strictly more than 4 GB of VRAM.
- **Network:** Unlimited data or an unmetered connection.

> **Key term:** A metered connection is a data-limited internet connection. Wi-Fi and ethernet connections tend to be unmetered by default, while cellular connections are often metered.

Gemini Nano's exact size may vary as the browser updates the model. To determine the current size, visit `chrome://on-device-internals`.

> **Note:** If the available storage space falls to less than 10 GB after the download, the model is removed from your device. The model redownloads once the requirements are met.

## Demo Chat

We've built a [customer support chat](link) which allows for users to type in their first language and receive real-time translation for the support agent.

## Use the Translator API

To determine if the Translator API is supported, run the following feature detection snippet.

```javascript
if ('Translator' in self) {
  // The Translator API is supported.
}
```

### Check Language Pair Support

Translation is managed with language packs, downloaded on demand. A language pack is like a dictionary for a given language.

- **sourceLanguage:** The current language for the text.
- **targetLanguage:** The final language the text should be translated into.

Use BCP 47 language short codes as strings. For example, `'es'` for Spanish or `'fr'` for French.

Determine the model availability and listen for the downloadprogress:

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

If the download fails, then downloadprogress events stop and the ready promise is rejected.

### Create and Run the Translator

To create a translator, call the asynchronous `create()` function. It requires an options parameter with two fields, one for the `sourceLanguage` and one for the `targetLanguage`.

```javascript
// Create a translator that translates from English to French.
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
});
```

Once you have a translator, call the asynchronous `translate()` function to translate your text.

```javascript
await translator.translate('Where is the next bus stop, please?');
// "Où est le prochain arrêt de bus, s'il vous plaît ?"
```