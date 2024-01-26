"use strict";

var _require = require('microsoft-cognitiveservices-speech-sdk'),
    SpeechTranslationConfig = _require.SpeechTranslationConfig,
    AudioConfig = _require.AudioConfig,
    TranslationRecognizer = _require.TranslationRecognizer;

var axios = require('axios');

function authWithBearer() {
  var resourceID, url, payload, headers, response, iason, bearer;
  return regeneratorRuntime.async(function authWithBearer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          resourceID = "/subscriptions/d5998bf4-a9d3-4729-a539-79d0cbdf1c2a/resourceGroups/andrei-internal/providers/Microsoft.CognitiveServices/accounts/atimo-speechServices";
          url = "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token?";
          payload = 'grant_type=client_credentials&client_id=ad9307de-21a1-4e57-aa1b-2dc69e6ffae5&client_secret=IPY8Q~ekfU7C2dn~BDUI9EOeiPsKos3IAmkDWcXK&resource=https%3A%2F%2Fcognitiveservices.azure.com%2F';
          headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
          };
          _context.next = 6;
          return regeneratorRuntime.awrap(axios.post(url, payload, {
            headers: headers
          }));

        case 6:
          response = _context.sent;
          iason = response.data;
          bearer = iason.access_token;
          return _context.abrupt("return", 'aad#' + resourceID + '#' + bearer);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
}

function recognizeFromMicrophone(sourceLanguage, targetLanguage) {
  var SPEECH_KEY, resourceRegion, speechTranslationConfig, audioConfig, translationRecognizer, translationRecognitionResult, originalText, translatedText, cancellationDetails;
  return regeneratorRuntime.async(function recognizeFromMicrophone$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(authWithBearer());

        case 3:
          SPEECH_KEY = _context2.sent;
          resourceRegion = "eastus";
          speechTranslationConfig = SpeechTranslationConfig.fromAuthorizationToken(SPEECH_KEY, resourceRegion);
          speechTranslationConfig.speechRecognitionLanguage = sourceLanguage;

          if (targetLanguage) {
            _context2.next = 10;
            break;
          }

          console.log("Please provide a target language.");
          return _context2.abrupt("return", null);

        case 10:
          speechTranslationConfig.addTargetLanguage(targetLanguage);
          audioConfig = AudioConfig.fromDefaultMicrophoneInput();
          translationRecognizer = new TranslationRecognizer(speechTranslationConfig, audioConfig);
          _context2.next = 15;
          return regeneratorRuntime.awrap(translationRecognizer.recognizeOnceAsync());

        case 15:
          translationRecognitionResult = _context2.sent;

          if (!(translationRecognitionResult.reason === ResultReason.TranslatedSpeech)) {
            _context2.next = 30;
            break;
          }

          console.log('Translation Result:', translationRecognitionResult);
          originalText = translationRecognitionResult.text;
          translatedText = translationRecognitionResult.translations[targetLanguage];

          if (!(originalText && translatedText)) {
            _context2.next = 26;
            break;
          }

          console.log('Original Text:', originalText);
          console.log('Translated Text:', translatedText);
          return _context2.abrupt("return", {
            originalText: originalText,
            translatedText: translatedText
          });

        case 26:
          console.error('Unexpected null or undefined values in translation result.');
          return _context2.abrupt("return", null);

        case 28:
          _context2.next = 31;
          break;

        case 30:
          if (translationRecognitionResult.reason === ResultReason.NoMatch) {
            console.log("No speech could be recognized: " + translationRecognitionResult.noMatchDetails);
          } else if (translationRecognitionResult.reason === ResultReason.Canceled) {
            cancellationDetails = translationRecognitionResult.cancellationDetails;
            console.log("Speech Recognition canceled: " + cancellationDetails.reason);

            if (cancellationDetails.reason === CancellationReason.Error) {
              console.log("Error details: " + cancellationDetails.errorDetails);
              console.log("Did you set the speech resource key and region values?");
              console.log("Language details: source=".concat(sourceLanguage, ", target=").concat(targetLanguage));
              console.log("Azure Region: ".concat(resourceRegion));
            }
          } else {
            console.log("Recognition failed with reason: " + translationRecognitionResult.reason);
            console.log("Language details: source=".concat(sourceLanguage, ", target=").concat(targetLanguage));
            console.log("Azure Region: ".concat(resourceRegion));
          }

        case 31:
          _context2.next = 37;
          break;

        case 33:
          _context2.prev = 33;
          _context2.t0 = _context2["catch"](0);
          console.log('An error occurred:', _context2.t0.message);
          return _context2.abrupt("return", null);

        case 37:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 33]]);
}

module.exports = {
  recognizeFromMicrophone: recognizeFromMicrophone
};
module.exports = {
  recognizeFromMicrophone: recognizeFromMicrophone
};