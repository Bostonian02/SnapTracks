import requests
import json

# HARD-CODED PARAMETERS
setting_description = "A young person is standing on a college campus, looking at a building. The person is wearing a Stitch backpack and black sneakers. The person is alone, and the image evokes a feeling of isolation."
location = "University of Central Florida "
weather = "clear skies"
time_of_day = "2 in the afternoon"

# HARD-CODED API KEYS
openai_key = "OPENAI_API_KEY"
suno_key = "SUNO_API_KEY"

####################################################################################################


# Define the function that will call the ChatGPT API
def generate_music_prompt(setting_description, location, weather, time_of_day):
    api_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_key}"
    }
    
    # Compose the message for ChatGPT
    messages = [
        {
            "role": "system",
            "content": """You are a helpful assistant that generates music lyrics based on inputted parameters of the user's current setting and surroundings. Write the lyrics in this format with a combination of 6 verses, choruses, and bridges. Here is an example template to follow:
            
            [Verse]  
            Silver cities shine brightly  
            Skies are painted blue  
            Hopes and dreams take flight  
            Future starts anew  

            [Verse 2]  
            Machines hum a new tune  
            Worlds we’ve never seen  
            Chasing stars so far  
            Building our own dream  

            [Chorus]  
            Future dreams so high  
            Touch the endless sky  
            Live beyond the now  
            Make the future wow  

            [Verse 3]  
            We create the world  
            Technology our guide  
            Hearts and minds as one  
            Infinite the ride  

            [Chorus]  
            Future dreams so high  
            Touch the endless sky  
            Live beyond the now  
            Make the future wow  

            [Bridge]  
            With every beat we rise  
            See through wiser eyes  
            The places we can go  
            A brilliance that will grow.

            Also add two tags that describe the music genre and a title for the song."""
        },
        {
            "role": "user",
            "content": (
                f"The description is: {setting_description}. The location is: {location}. "
                f"The weather is: {weather}. The current time of day is: {time_of_day}."
                f"Do not dwell to much on making the lyrics about the location, weather, or time_of_day. They are only there to help set the mood for the lyrics."
                f"Focus more of the lyrics on the description and be more literal about what is happening with very minimal creative freedom regarding the lyrics."
            )
        }
    ]
    
    # Define the payload for the API call
    data = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "max_tokens": 400,
        "temperature": 0.7
    }
    
    # Make the API call
    response = requests.post(api_url, headers=headers, data=json.dumps(data))
    
    # Debugging: Print status code and full response in case of failure
    if response.status_code != 200:
        print(f"Error: Received status code {response.status_code}")
        print("Response:", response.text)
        return None, None, None  # Return None in case of failure
    
    response_data = response.json()
    
    # Extract the generated text from the response
    if "choices" in response_data and len(response_data["choices"]) > 0:
        music_prompt = response_data["choices"][0]["message"]["content"].strip()
        
        # Split the response into sections
        lyrics = music_prompt
        title = ""
        genre_tags = []
        
        # Use parsing to extract title and genre tags if they appear in the output
        lines = music_prompt.splitlines()
        for i, line in enumerate(lines):
            if "title:" in line.lower():
                title = line.split(":", 1)[1].strip()
            elif "genre:" in line.lower() or "tag" in line.lower():
                genre_tags = line.split(":", 1)[1].strip().split(", ")
        
        return lyrics, title, genre_tags
    else:
        return None, None, None  # Return None in case of an empty response
    

def get_generated_song_ids(lyrics, title, genre_tags):
    # Join genre tags into a single string as required by the API
    tags_string = ", ".join(genre_tags)
    
    # Debugging: print the input values before the request
    print("Lyrics:", lyrics)
    print("Title:", title)
    print("Genre Tags:", tags_string)
    
    # Make the API request to generate song clips
    response = requests.post(
        "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
        headers={
            "Authorization": f"Bearer {suno_key}",
            "Content-Type": "application/json",
        },
        json={
            "prompt": lyrics,
            "tags": tags_string,  # API expects a string, not an array
            "title": title
        },
    )

    # Check for response status code and print the error response if any
    if response.status_code != 200:
        print("Error response:", response.text)  # Print the error message from the API
        response.raise_for_status()  # Raise the HTTP error with more detail
    
    data = response.json()
    clip_ids = data["clip_ids"]
    return clip_ids[0], clip_ids[1]


def get_song_data_from_id(song_id):

    print ("Song ID:", song_id)
    response = requests.get(
        "https://api.aimlapi.com/v2/generate/audio/suno-ai/clip",
        params={
            "clip_id": f"{song_id}",
            "status": "streaming",
        },
        headers={
            "Authorization": f"Bearer {suno_key}",
            "Content-Type": "application/json",
        },
    )

    response.raise_for_status()
    data = response.json()
    print("Clip data:", data)
    return data


# Example usage
if __name__ == "__main__":
    
    # Generate the music prompt
    lyrics, title, genre_tags = generate_music_prompt(setting_description, location, weather, time_of_day)
    
    # Check if lyrics, title, and genre_tags are generated before proceeding
    if lyrics and title and genre_tags:
        # Get the generated song IDs
        song_id_1, song_id_2 = get_generated_song_ids(lyrics, title, genre_tags)

        # Fetch the song data for each generated song ID
        song_one_data = get_song_data_from_id(song_id_1)
        song_two_data = get_song_data_from_id(song_id_2)
    else:
        print("Failed to generate lyrics, title, or genre tags.")
