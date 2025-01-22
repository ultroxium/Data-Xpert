import os
import b2sdk.v2 as b2
import joblib
import pandas as pd
import json
from io import BytesIO
from app.core.config import settings
from b2sdk.v2 import DownloadVersion

class B2FileManager:
    def __init__(self):
        self.info = b2.InMemoryAccountInfo()
        self.b2_api = b2.B2Api(self.info)
        self.app_key_id = settings.BUCKET_KEY_ID
        self.app_key = settings.BUCKET_SECRET_KEY
        self.bucket_name = settings.BUCKET_NAME
        self.b2_api.authorize_account('production', self.app_key_id, self.app_key)
        self.bucket = self.b2_api.get_bucket_by_name(self.bucket_name)
    
    def upload_file(self, data, b2_path):
        try:
            self.bucket.upload_bytes(data, b2_path)
            return f"File uploaded as '{b2_path}'"
        except b2.exception.B2Error as e:
            return f"Error uploading file: {e}"

    def download_file(self, b2_path):
        try:
            file_info = self.bucket.download_file_by_name(b2_path)
            file_bytes = BytesIO()
            file_info.save(file_bytes)
            file_bytes.seek(0)
            return file_bytes
        except b2.exception.B2Error as e:
            return f"Error downloading file: {e}"

    def read_file(self, b2_path, file_type='csv'):
        file_bytes = self.download_file(b2_path)

        if isinstance(file_bytes, BytesIO):
            if file_type == 'csv':
                return pd.read_csv(file_bytes)
            elif file_type == 'json':
                return json.load(file_bytes)
            elif file_type in ['model', 'encoder']:
                return joblib.load(file_bytes)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        else:
            return file_bytes  # Return the error message if download failed

    def write_file(self, data, b2_path, file_type='csv'):
        file_bytes = BytesIO()

        if file_type == 'csv':
            data.to_csv(file_bytes, index=False)
        elif file_type == 'json':
            json.dump(data, file_bytes, ensure_ascii=False)  # Write JSON data directly to file_bytes
        elif file_type == 'image':
            data.save(file_bytes, format='PNG')
        elif file_type in ['model', 'encoder']:
            joblib.dump(data, file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        file_bytes.seek(0)  
        return self.upload_file(file_bytes.read(), b2_path)
    
    def get_file_size(self, b2_path):
        try:
            download_version = self.bucket.get_file_info_by_name(b2_path)
            file_size = download_version.size
            return file_size
        except b2.exception.B2Error as e:
            return f"Error retrieving file size: {e}"
        
    def list_file_versions(self, b2_path):
        """List all versions of a file in descending order by timestamp."""
        try:
            # Get all versions of the file
            versions = self.bucket.list_file_versions(b2_path)
            
            # Create a list of dictionaries with file_id, name, and timestamp
            version_info = [
                {
                    "version": index + 1,  # Indexing the versions
                    "file_id": version.id_,
                    "name": version.file_name,
                    "timestamp": version.upload_timestamp
                }
                for index, version in enumerate(sorted(versions, key=lambda v: v.upload_timestamp, reverse=True))
            ]
            return version_info
        except b2.exception.B2Error as e:
            return f"Error listing file versions: {e}"

    def download_file_version(self, b2_path, file_id):
        """Download a specific version of a file by its file_id."""
        try:
            file_info = self.bucket.download_file_by_id(file_id)
            file_bytes = BytesIO()
            file_info.save(file_bytes)
            file_bytes.seek(0)
            return file_bytes
        except b2.exception.B2Error as e:
            return f"Error downloading file version: {e}"
        
    
    def delete_recent_file_versions(self, b2_path):
        """Delete all recent file versions except the oldest one."""
        try:
            # Get all versions of the file
            versions = list(self.bucket.list_file_versions(b2_path))

            # Sort the versions by timestamp in ascending order (oldest first)
            sorted_versions = sorted(versions, key=lambda v: v.upload_timestamp)

            # Keep the first (oldest) version, delete the rest
            if len(sorted_versions) > 1:
                for version in sorted_versions[1:]:
                    self.bucket.delete_file_version(version.id_, version.file_name)
                return f"Deleted {len(sorted_versions) - 1} recent versions, keeping the oldest one."
            else:
                return "No recent versions to delete, only the oldest version exists."
        except b2.exception.B2Error as e:
            return f"Error deleting file versions: {e}"


# class B2FileManager:
    # def __init__(self, use_b2=False, local_dir='/static/'):
    #     self.use_b2 = use_b2
    #     self.local_dir = os.path.abspath(local_dir)
    #     if not self.use_b2:
    #         os.makedirs(self.local_dir, exist_ok=True)  
    #     else:
    #         self.info = b2.InMemoryAccountInfo()
    #         self.b2_api = b2.B2Api(self.info)
    #         self.app_key_id = settings.BUCKET_KEY_ID
    #         self.app_key = settings.BUCKET_SECRET_KEY
    #         self.bucket_name = settings.BUCKET_NAME
    #         self.b2_api.authorize_account('production', self.app_key_id, self.app_key)
    #         self.bucket = self.b2_api.get_bucket_by_name(self.bucket_name)

    # def upload_file(self, data, path):
    #     if self.use_b2:
    #         try:
    #             self.bucket.upload_bytes(data, path)
    #             return f"File uploaded as '{path}'"
    #         except b2.exception.B2Error as e:
    #             return f"Error uploading file: {e}"
    #     else:
    #         local_path = os.path.join(self.local_dir, path)
    #         os.makedirs(os.path.dirname(local_path), exist_ok=True)
    #         try:
    #             with open(local_path, 'wb') as f:
    #                 f.write(data)
    #             return f"File uploaded locally as '{local_path}'"
    #         except Exception as e:
    #             return f"Error uploading file locally: {e}"

    # def download_file(self, path):
    #     if self.use_b2:
    #         try:
    #             file_info = self.bucket.download_file_by_name(path)
    #             file_bytes = BytesIO()
    #             file_info.save(file_bytes)
    #             file_bytes.seek(0)
    #             return file_bytes
    #         except b2.exception.B2Error as e:
    #             return f"Error downloading file: {e}"
    #     else:
    #         local_path = os.path.join(self.local_dir, path)
    #         try:
    #             with open(local_path, 'rb') as f:
    #                 return BytesIO(f.read())
    #         except Exception as e:
    #             return f"Error downloading file locally: {e}"

    # def read_file(self, path, file_type='csv'):
    #     file_bytes = self.download_file(path)

    #     if isinstance(file_bytes, BytesIO):
    #         if file_type == 'csv':
    #             return pd.read_csv(file_bytes)
    #         elif file_type == 'json':
    #             return json.load(file_bytes)
    #         elif file_type in ['model', 'encoder']:
    #             return joblib.load(file_bytes)
    #         else:
    #             raise ValueError(f"Unsupported file type: {file_type}")
    #     else:
    #         return file_bytes  # Return the error message if download failed

    # def write_file(self, data, path, file_type='csv'):
    #     file_bytes = BytesIO()

    #     if file_type == 'csv':
    #         data.to_csv(file_bytes, index=False)
    #     elif file_type == 'json':
    #         json.dump(data, file_bytes, ensure_ascii=False)
    #     elif file_type == 'image':
    #         data.save(file_bytes, format='PNG')
    #     elif file_type in ['model', 'encoder']:
    #         joblib.dump(data, file_bytes)
    #     else:
    #         raise ValueError(f"Unsupported file type: {file_type}")

    #     file_bytes.seek(0)
    #     return self.upload_file(file_bytes.read(), path)

    # def get_file_size(self, path):
    #     if self.use_b2:
    #         try:
    #             download_version = self.bucket.get_file_info_by_name(path)
    #             return download_version.size
    #         except b2.exception.B2Error as e:
    #             return f"Error retrieving file size: {e}"
    #     else:
    #         try:
    #             return os.path.getsize(os.path.join(self.local_dir, path))
    #         except Exception as e:
    #             return f"Error retrieving file size: {e}"

    # def list_file_versions(self, path):
    #     """List all versions of a file."""
    #     if self.use_b2:
    #         try:
    #             versions = self.bucket.list_file_versions(path)
    #             version_info = [
    #                 {
    #                     "version": index + 1,
    #                     "file_id": version.id_,
    #                     "name": version.file_name,
    #                     "timestamp": version.upload_timestamp
    #                 }
    #                 for index, version in enumerate(sorted(versions, key=lambda v: v.upload_timestamp, reverse=True))
    #             ]
    #             return version_info
    #         except b2.exception.B2Error as e:
    #             return f"Error listing file versions: {e}"
    #     else:
    #         return "Local file versioning not implemented."

    # def download_file_version(self, path, file_id):
    #     """Download a specific version of a file by its file_id."""
    #     if self.use_b2:
    #         try:
    #             file_info = self.bucket.download_file_by_id(file_id)
    #             file_bytes = BytesIO()
    #             file_info.save(file_bytes)
    #             file_bytes.seek(0)
    #             return file_bytes
    #         except b2.exception.B2Error as e:
    #             return f"Error downloading file version: {e}"
    #     else:
    #         return "Local file versioning not implemented."

    # def delete_recent_file_versions(self, path):
    #     """Delete all recent file versions except the oldest one."""
    #     if self.use_b2:
    #         try:
    #             versions = list(self.bucket.list_file_versions(path))
    #             sorted_versions = sorted(versions, key=lambda v: v.upload_timestamp)
    #             if len(sorted_versions) > 1:
    #                 for version in sorted_versions[1:]:
    #                     self.bucket.delete_file_version(version.id_, version.file_name)
    #                 return f"Deleted {len(sorted_versions) - 1} recent versions, keeping the oldest one."
    #             else:
    #                 return "No recent versions to delete."
    #         except b2.exception.B2Error as e:
    #             return f"Error deleting file versions: {e}"
    #     else:
    #         return "Local file versioning not implemented." 
