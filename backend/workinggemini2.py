import os
import base64
from google.cloud import vision
import vertexai
from vertexai.generative_models import GenerativeModel

# Set the environment variable to the path of your service account key
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\\Users\\ameer\\Downloads\\silent-cider-437701-t5-0b2a3b1204c1.json"

# Function to convert image to Base64
def convert_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Function to get image descriptions using Google Cloud Vision API
def get_image_description(base64_image):
    # Initialize Google Cloud Vision client
    client = vision.ImageAnnotatorClient()

    # Prepare the image in Base64 format for the Vision API
    image = vision.Image(content=base64.b64decode(base64_image))

    # Perform label detection on the image
    response = client.label_detection(image=image)

    # Handle errors in response
    if response.error.message:
        raise Exception(f'Error: {response.error.message}')
    
    # Extract labels (descriptions) from the response
    descriptions = [label.description for label in response.label_annotations]
    
    # Handle the case where no labels are returned
    if not descriptions:
        return ["No discernible objects found."]
    
    return descriptions

# Function to generate a description from image using Vertex AI's generative model
def generate_description_from_image(image_path):
    # Convert image to Base64
    base64_image = convert_image_to_base64(image_path)
    
    # Get a description from the image using Vision API
    descriptions = get_image_description(base64_image)
    
    # Initialize the Vertex AI environment
    vertexai.init(project="silent-cider-437701-t5", location="us-central1")

    # Load the generative model (Gemini)
    model = GenerativeModel("gemini-1.5-flash-001")
    
    # Start a chat session with the model
    chat = model.start_chat()

    # Create a combined prompt for the Gemini model based on the image descriptions
    prompt = (
        f"The following are key details observed in the image: {', '.join(descriptions)}. "
        "Based on thses elements, please provide a description."
    )
    
    # Send the message to the model (using prompt only)
    model_response = chat.send_message(prompt)  # Only pass the prompt
    
    # Return the model's response text
    return model_response.text if model_response else "No response generated"

if __name__ == "__main__":
    image_path = "image1.jpg"  # Replace with your image file path
    description = generate_description_from_image(image_path)
    print("Generated Description:", description)

