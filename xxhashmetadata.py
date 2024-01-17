import json
from google.cloud import storage
from concurrent.futures import ThreadPoolExecutor
import os
import xxhash
from tkinter import Tk     # from tkinter import Tk for Python 3.x
from tkinter.filedialog import askdirectory
from pathlib import Path

# assetsjson = json.load(open("local/assets.json"))
#
# file_info_dict = {val["file_path"]: val for val in assetsjson}

# def upload_directory_to_bucket(bucket_name, directory_path):
#     # Create a client object
#
#     # Get the bucket object
#
#     # Iterate through files in the directory
#     for filename in os.listdir(directory_path):
#         # Create a blob object
#
#
#         print(f"Uploaded {filename} to {bucket_name}")
#         process_blob(directory_path, blob)

def process_file(file_name, directory_path):
     filepath = os.path.join(directory_path, file_name)
     client = storage.Client()
     bucket = client.get_bucket(bucket_name)
     blob = bucket.blob(file_name)
     blob.upload_from_filename(os.path.join(directory_path, file_name))
     print(f"Uploaded {file_name} to {bucket_name}")
     with open(filepath, 'rb') as fileb:
        hasher = xxhash.xxh64()
        hasher.update(fileb.read())
        hex_text = hasher.hexdigest()
        file = {
            "url": f".storage/{filepath}",
            "file_path": file_name.replace(f"{directory_path}/", ""),
            "algorithm": "xxhash",
            "size": Path(filepath).stat().st_size,
            "hash": str(int(hex_text, 16))
        }
        blob.metadata = file
        blob.patch()
        print(f"Updated metadata for {file_name}\n")


# Set the name of your Google Cloud Storage bucket
bucket_name = "assets.bunrum.com"

Tk().withdraw() # we don't want a full GUI, so keep the root window from appearing
directory = askdirectory() # show an "Open" dialog box and return the path to the selected file
print(directory)

# Create a ThreadPoolExecutor with a max number of threads
executor = ThreadPoolExecutor(max_workers=10)
# Submit tasks to the executor for each blob
futures = [executor.submit(process_file, file_name, directory) for file_name in os.listdir(directory)]
    # Wait for all tasks to complete
for future in futures:
    future.result()
print("done")

