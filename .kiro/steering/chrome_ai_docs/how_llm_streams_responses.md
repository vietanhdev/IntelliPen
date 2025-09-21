# How LLMs Stream Responses

**Authors:** Thomas Steiner, Alexandra Klepper  
**Published:** January 21, 2025

> **Key Term:** Streaming breaks up a resource you want to send or receive over a network into smaller chunks. This is common for browsers when receiving media assets, such as video buffering or partial loading of images.

A streamed LLM response consists of data emitted incrementally and continuously. Streaming data looks different from the server and the client.

## From the Server

To understand what a streamed response looks like, I prompted Gemini to tell me a long joke using the command line tool curl. Consider the following call to the Gemini API. If you try it, be sure to replace `{GOOGLE_API_KEY}` in the URL with your Gemini API key.

```bash
$ curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key={GOOGLE_API_KEY}" \
      -H 'Content-Type: application/json' \
      --no-buffer \
      -d '{ "contents":[{"parts":[{"text": "Tell me a long T-rex joke, please."}]}]}'
```

This request logs the following (truncated) output, in event stream format. Each line begins with `data:` followed by the message payload. The concrete format is not actually important, what matters are the chunks of text.

```
//
data: {"candidates":[{"content": {"parts": [{"text": "A T-Rex"}],"role": "model"},
  "finishReason": "STOP","index": 0,"safetyRatings": [{"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_HATE_SPEECH","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_HARASSMENT","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_DANGEROUS_CONTENT","probability": "NEGLIGIBLE"}]}],
  "usageMetadata": {"promptTokenCount": 11,"candidatesTokenCount": 4,"totalTokenCount": 15}}

data: {"candidates": [{"content": {"parts": [{ "text": " walks into a bar and orders a drink. As he sits there, he notices a" }], "role": "model"},
  "finishReason": "STOP","index": 0,"safetyRatings": [{"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_HATE_SPEECH","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_HARASSMENT","probability": "NEGLIGIBLE"},{"category": "HARM_CATEGORY_DANGEROUS_CONTENT","probability": "NEGLIGIBLE"}]}],
  "usageMetadata": {"promptTokenCount": 11,"candidatesTokenCount": 21,"totalTokenCount": 32}}
```

*After executing the command, the result chunks stream in.*

The first payload is JSON. Take a closer look at the highlighted `candidates[0].content.parts[0].text`:

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "A T-Rex"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_HATE_SPEECH",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_HARASSMENT",
          "probability": "NEGLIGIBLE"
        },
        {
          "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 11,
    "candidatesTokenCount": 4,
    "totalTokenCount": 15
  }
}
```

That first text entry is the beginning of Gemini's response. When you extract more text entries, the response is newline-delimited.

The following snippet shows multiple text entries, which shows the final response from the model.

```
"A T-Rex"

" was walking through the prehistoric jungle when he came across a group of Triceratops. "

"\n\n\"Hey, Triceratops!\" the T-Rex roared. \"What are"

" you guys doing?\"\n\nThe Triceratops, a bit nervous, mumbled,
\"Just... just hanging out, you know? Relaxing.\"\n\n\"Well, you"

" guys look pretty relaxed,\" the T-Rex said, eyeing them with a sly grin.
\"Maybe you could give me a hand with something.\"\n\n\"A hand?\""

...
```

But what happens if instead of for T-rex jokes, you ask the model for something slightly more complex. For example, ask Gemini to come up with a JavaScript function to determine if a number is even or odd. The `text:` chunks look slightly different.

The output now contains Markdown format, starting with the JavaScript code block. The following sample includes the same pre-processing steps as before.

```
"```javascript\nfunction"

" isEven(number) {\n  // Check if the number is an integer.\n"

"  if (Number.isInteger(number)) {\n  // Use the modulo operator"

" (%) to check if the remainder after dividing by 2 is 0.\n  return number % 2 === 0; \n  } else {\n  "
"// Return false if the number is not an integer.\n    return false;\n }\n}\n\n// Example usage:\nconsole.log(isEven("

"4)); // Output: true\nconsole.log(isEven(7)); // Output: false\nconsole.log(isEven(3.5)); // Output: false\n```\n\n**Explanation:**\n\n1. **`isEven("

"number)` function:**\n   - Takes a single argument `number` representing the number to be checked.\n   - Checks if the `number` is an integer using `Number.isInteger()`.\n   - If it's an"

...
```

To make matters more challenging, some of the marked up items begin in one chunk and end in another. Some of the markup is nested. In the following example, the highlighted function is split between two lines: `**isEven(` and `number) function:**`. Combined, the output is `**isEven(number) function:**`. This means if you want to output formatted Markdown, you can't just process each chunk individually with a Markdown parser.

## From the Client

If you run models like Gemma on the client with a framework like MediaPipe LLM, streaming data comes through a callback function.

For example:

```javascript
llmInference.generateResponse(
  inputPrompt,
  (chunk, done) => {
     console.log(chunk);
});
```

With the Prompt API, you get streaming data as chunks by iterating over a `ReadableStream`.

```javascript
const languageModel = await LanguageModel.create();
const stream = languageModel.promptStreaming(inputPrompt);
for await (const chunk of stream) {
  console.log(chunk);
}
```