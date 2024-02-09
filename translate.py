from azure.ai.translation.text import TextTranslationClient, TranslatorCredential
from azure.ai.translation.text.models import InputTextItem
from azure.core.exceptions import HttpResponseError
import json
import sys

def translation(input_language, output_language, input_text):
    key = "c523af4573f24ab4b5f8e53646c79806"
    endpoint = "https://api.cognitive.microsofttranslator.com/"
    region = "eastus"
    credential = TranslatorCredential(key, region)
    text_translator = TextTranslationClient(endpoint=endpoint, credential=credential)

    try:
        target_languages = [output_language]  # Use a list even if it's a single language

        input_text_elements = [InputTextItem(text=input_text)]

        response = text_translator.translate(content=input_text_elements, to=target_languages, from_parameter=input_language)
        translation = response[0] if response else None

        if translation:
            translated_texts = [translated_text.text for translated_text in translation.translations]
            print(json.dumps(translated_texts))  # Print the result as JSON

    except HttpResponseError as exception:
        print(json.dumps({"error": f"Error Code: {exception.error.code}, Message: {exception.error.message}"}))

if __name__ == "__main__":
    input_language = sys.argv[1]  # Replace with the actual source language
    output_language = sys.argv[2]  # Replace with the actual output language
    input_text = sys.argv[3]  # Replace with the actual input text
    translations = translation(input_language, output_language, input_text)
