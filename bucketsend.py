from google.cloud import storage
import os

def upload_directory_to_bucket(bucket_name, directory_path):
    # Create a client object
    client = storage.Client()

    # Get the bucket object
    bucket = client.get_bucket(bucket_name)

    # Iterate through files in the directory
    for file_name in os.listdir(directory_path):
        # Create a blob object
        blob = bucket.blob(file_name)

        # Upload the file to the bucket
        blob.upload_from_filename(os.path.join(directory_path, file_name))

        print(f"Uploaded {file_name} to {bucket_name}")

# Set the name of your Google Cloud Storage bucket
bucket_name = "assets.bunrum.com"

# Set the path to the directory containing the files you want to upload
directory_path = "/assets"

# Call the function to upload the directory to the bucket
upload_directory_to_bucket(bucket_name, directory_path)
