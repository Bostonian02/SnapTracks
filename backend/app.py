import os
import json
import base64
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
from google.cloud import vision
import vertexai
from vertexai.generative_models import GenerativeModel
import logging

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Retrieve API keys and configurations from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUNO_API_KEY = os.getenv("SUNO_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
VERTEX_PROJECT = os.getenv("VERTEX_PROJECT")
VERTEX_LOCATION = os.getenv("VERTEX_LOCATION")

# Validate environment variables
if not all([OPENAI_API_KEY, SUNO_API_KEY, GOOGLE_APPLICATION_CREDENTIALS, VERTEX_PROJECT, VERTEX_LOCATION]):
    logger.error("One or more environment variables are missing. Please check your .env file.")
    exit(1)

# Set Google Application Credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# Initialize Vertex AI
try:
    vertexai.init(project=VERTEX_PROJECT, location=VERTEX_LOCATION)
    logger.info("Vertex AI initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Vertex AI: {e}")
    exit(1)

@app.route('/generate_music', methods=['POST'])
def generate_music():
    """
    Endpoint to generate music lyrics, create song clips, and fetch song data.
    Expects a JSON payload with the following fields:
    - setting_description (str)
    - location (str)
    - weather (str)
    - time_of_day (str)
    """
    data = request.get_json()
    logger.info("Received request to /generate_music with data: %s", data)

    # Extract parameters from request
    setting_description = data.get('setting_description')
    location = data.get('location')
    weather = data.get('weather')
    time_of_day = data.get('time_of_day')

    if not all([setting_description, location, weather, time_of_day]):
        logger.warning("Missing required parameters in /generate_music request.")
        return jsonify({"error": "Missing required parameters."}), 400

    try:
        # Generate music prompt
        lyrics, title, genre_tags = generate_music_prompt(
            setting_description, location, weather, time_of_day
        )
        logger.info("Generated music prompt: Lyrics Length=%d, Title=%s, Genre Tags=%s",
                    len(lyrics) if lyrics else 0, title, genre_tags)

        if not all([lyrics, title, genre_tags]):
            logger.error("Failed to generate lyrics, title, or genre tags.")
            return jsonify({"error": "Failed to generate lyrics, title, or genre tags."}), 500

        # Get generated song IDs
        song_id_1, song_id_2 = get_generated_song_ids(lyrics, title, genre_tags)
        logger.info("Generated Song IDs: %s, %s", song_id_1, song_id_2)

        # Fetch song data for each generated song ID
        song_one_data = get_song_data_from_id(song_id_1)
        song_two_data = get_song_data_from_id(song_id_2)

        response = {
            "lyrics": lyrics,
            "title": title,
            "genre_tags": genre_tags,
            "songs": [
                {"id": song_id_1, "data": song_one_data},
                {"id": song_id_2, "data": song_two_data}
            ]
        }

        return jsonify(response), 200

    except Exception as e:
        logger.exception("An error occurred in /generate_music: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/describe_image', methods=['POST'])
def describe_image():
    """
    Endpoint to process an image and generate a description.
    Expects a JSON payload with the following field:
    - image_base64 (str): The base64-encoded image string.
    """
    data = request.get_json()
    logger.info("Received request to /describe_image with data: %s", data)

    image_base64 = data.get('image_base64')

    if not image_base64:
        logger.warning("Missing 'image_base64' parameter in /describe_image request.")
        return jsonify({"error": "Missing 'image_base64' parameter."}), 400

    try:
        description = generate_description_from_image_base64(image_base64)
        logger.info("Generated image description: %s", description)
        return jsonify({"description": description}), 200
    except Exception as e:
        logger.exception("An error occurred in /describe_image: %s", e)
        return jsonify({"error": str(e)}), 500

def generate_music_prompt(setting_description, location, weather, time_of_day):
    """
    Calls the OpenAI ChatGPT API to generate music lyrics based on the provided parameters.
    """
    api_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    # Compose the message for ChatGPT
    messages = [
        {
            "role": "system",
            "content": """You are a helpful assistant that generates music lyrics based on inputted parameters of the user's current setting and surroundings. Write the lyrics in this format with a combination of 6 verses, choruses, and bridges. Also, provide a title for the song and genre tags if possible."""
        },
        {
            "role": "user",
            "content": (
                f"The description is: {setting_description}. The location is: {location}. "
                f"The weather is: {weather}. The current time of day is: {time_of_day}."
                f"Focus more on the description and be literal about what is happening with minimal creative freedom."
            )
        }
    ]

    # Define the payload for the API call
    data = {
        "model": "gpt-4o-mini",  # or "gpt-3.5-turbo" depending on your access
        "messages": messages,
        "max_tokens": 400,
        "temperature": 0.7
    }

    logger.info("Sending request to OpenAI API for music prompt.")

    # Make the API call
    response = requests.post(api_url, headers=headers, data=json.dumps(data))

    # Log the response status
    logger.info("OpenAI API response status: %s", response.status_code)

    # Debugging: Print status code and full response in case of failure
    if response.status_code != 200:
        logger.error("Error: Received status code %s from OpenAI API", response.status_code)
        logger.error("Response: %s", response.text)
        return None, None, None  # Return None in case of failure

    response_data = response.json()
    logger.debug("OpenAI API response data: %s", response_data)

    # Extract the generated text from the response
    if "choices" in response_data and len(response_data["choices"]) > 0:
        music_prompt = response_data["choices"][0]["message"]["content"].strip()
        logger.debug("Generated music prompt: %s", music_prompt)

        # Initialize variables
        lyrics = []
        title = ""
        genre_tags = []

        # Use basic heuristics to search for title and genre tags in the response
        lines = music_prompt.splitlines()

        # Search for a line that looks like a title or genre
        for line in lines:
            if line.lower().startswith("title:"):
                title = line.split(":", 1)[1].strip()
            elif line.lower().startswith("genre:") or line.lower().startswith("tags:"):
                genre_tags = [tag.strip() for tag in line.split(":", 1)[1].split(",")]

            # If the line doesn't look like a title or genre, treat it as lyrics
            if not (line.lower().startswith("title:") or line.lower().startswith("genre:") or line.lower().startswith("tags:")):
                lyrics.append(line)

        lyrics = "\n".join(lyrics).strip()

        # If title or genre tags are not found, return default values
        if not title:
            title = "Untitled Song"
        if not genre_tags:
            genre_tags = ["Unknown"]

        logger.info("Parsed Lyrics Length: %d, Title: %s, Genre Tags: %s",
                    len(lyrics), title, genre_tags)
        return lyrics, title, genre_tags
    else:
        logger.error("OpenAI API response does not contain 'choices' or is empty.")
        return None, None, None  # Return None in case of an empty response


def get_generated_song_ids(lyrics, title, genre_tags):
    """
    Calls the Suno API to generate song clips based on the lyrics, title, and genre tags.
    Returns two generated song clip IDs.
    """
    api_url = "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip"
    headers = {
        "Authorization": f"Bearer {SUNO_API_KEY}",
        "Content-Type": "application/json",
    }

    tags_string = ", ".join(genre_tags)

    payload = {
        "prompt": lyrics,
        "tags": tags_string,  # API expects a string, not an array
        "title": title
    }

    logger.info("Sending request to Suno API to generate song clips.")

    response = requests.post(api_url, headers=headers, json=payload)

    # Check for response status code and log error if any
    if response.status_code != 200:
        logger.error("Error response from Suno API: %s", response.text)
        response.raise_for_status()  # Raise the HTTP error with more detail

    data = response.json()
    logger.debug("Suno API response data: %s", data)

    clip_ids = data.get("clip_ids", [])

    if len(clip_ids) < 2:
        logger.error("Insufficient clip IDs returned from Suno API.")
        raise Exception("Insufficient clip IDs returned from Suno API.")

    return clip_ids[0], clip_ids[1]

def get_song_data_from_id(song_id):
    """
    Retrieves song data from Suno API using the provided song ID.
    """
    api_url = "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip"
    headers = {
        "Authorization": f"Bearer {SUNO_API_KEY}",
        "Content-Type": "application/json",
    }

    params = {
        "clip_id": song_id,
        "status": "streaming",
    }

    logger.info("Fetching song data for clip ID: %s", song_id)

    response = requests.get(api_url, headers=headers, params=params)

    if response.status_code != 200:
        logger.error("Error fetching song data for ID %s: %s", song_id, response.text)
        response.raise_for_status()

    data = response.json()
    logger.debug("Song data for clip ID %s: %s", song_id, data)
    return data

def generate_description_from_image_base64(image_base64):
    """
    Processes a base64-encoded image to generate a description using Google Cloud Vision API
    and Vertex AI's generative model.
    """
    logger.info("Starting image description generation.")

    # Decode the base64 image
    try:
        image_bytes = base64.b64decode(image_base64)
        logger.debug("Image decoded successfully.")
    except base64.binascii.Error as e:
        logger.error("Invalid base64 image data: %s", e)
        raise ValueError("Invalid base64 image data.") from e

    # Get image descriptions using Google Cloud Vision API
    descriptions = get_image_description(image_bytes)
    logger.info("Image descriptions from Vision API: %s", descriptions)

    # Generate a combined description using Vertex AI's generative model
    try:
        model = GenerativeModel("gemini-1.5-flash-001")
        chat = model.start_chat()
        logger.info("Vertex AI generative model initialized.")
    except Exception as e:
        logger.error("Failed to initialize Vertex AI generative model: %s", e)
        raise

    prompt = (
        f"The following are key details observed in the image: {', '.join(descriptions)}. "
        "Based on these elements, please provide a detailed description."
    )

    logger.info("Sending prompt to Vertex AI generative model.")

    model_response = chat.send_message(prompt)
    logger.debug("Vertex AI response: %s", model_response.text if model_response else "No response")

    return model_response.text if model_response else "No response generated."

def get_image_description(image_bytes):
    """
    Uses Google Cloud Vision API to perform label detection on the image and return descriptions.
    """
    logger.info("Performing label detection using Google Cloud Vision API.")

    # Initialize Google Cloud Vision client
    try:
        client = vision.ImageAnnotatorClient()
        logger.info("Google Cloud Vision client initialized.")
    except Exception as e:
        logger.error("Failed to initialize Google Cloud Vision client: %s", e)
        raise

    # Prepare the image for the Vision API
    image = vision.Image(content=image_bytes)

    # Perform label detection on the image
    response = client.label_detection(image=image)
    logger.info("Label detection completed.")

    # Handle errors in response
    if response.error.message:
        logger.error("Google Cloud Vision API Error: %s", response.error.message)
        raise Exception(f'Google Cloud Vision API Error: {response.error.message}')

    # Extract labels (descriptions) from the response
    descriptions = [label.description for label in response.label_annotations]

    # Handle the case where no labels are returned
    if not descriptions:
        logger.warning("No labels detected in the image.")
        return ["No discernible objects found."]

    return descriptions

if __name__ == "__main__":
    # Run the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)

