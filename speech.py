import os
import azure.cognitiveservices.speech as speechsdk
import requests,json

import sys

#print("Number of arguments:", len(sys.argv))
#print("Arguments:", sys.argv)

def authWithBearer():
    resourceID = "/subscriptions/d5998bf4-a9d3-4729-a539-79d0cbdf1c2a/resourceGroups/andrei-internal/providers/Microsoft.CognitiveServices/accounts/atimo-speechServices"
    url = "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token?"
    payload = 'grant_type=client_credentials&client_id=ad9307de-21a1-4e57-aa1b-2dc69e6ffae5&client_secret=IPY8Q~ekfU7C2dn~BDUI9EOeiPsKos3IAmkDWcXK&resource=https%3A%2F%2Fcognitiveservices.azure.com%2F'
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    
    iason = json.loads(response.text)
    bearer = iason["access_token"]
    
    return 'aad#' + resourceID + '#' + bearer

def recognize_from_microphone():
    # This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    speech_config = speechsdk.SpeechConfig(auth_token=authWithBearer, region="eastus")
    speech_config.speech_recognition_language="en-US"

    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    print("Speak into your microphone.")
    speech_recognition_result = speech_recognizer.recognize_once_async().get()

    if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print("Recognized: {}".format(speech_recognition_result.text))
    elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
    elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_recognition_result.cancellation_details
        print("Speech Recognition canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))
            print("Did you set the speech resource key and region values?")

if __name__ == "__main__":
    # Example usage
    recognize_from_microphone()