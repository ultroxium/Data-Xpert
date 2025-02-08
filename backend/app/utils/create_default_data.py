import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from app.api.workspaces.model import WorkspaceModel
from app.api.feature_engineering.model import ProcessedDataModel
from app.api.datasets.model import DatasetModel
from app.Helper.B2fileManager import B2FileManager
from app.api.auth.model import UserModel

def create_default_dataset(db: Session, user: UserModel, workspace: WorkspaceModel):
    """Creates a default dataset for new users in their Default Workspace."""
    
    dataset_name = "Sample Dataset"
    dataset_description = "This is a sample dataset provided as a default."

    # Check if dataset already exists
    existing_dataset = db.query(DatasetModel).filter(
        DatasetModel.name == dataset_name,
        DatasetModel.workspace_id == workspace.id,
        DatasetModel.is_deleted == False
    ).first()

    if existing_dataset:
        return  # Avoid duplicate dataset creation

    # Create a sample DataFrame
    sample_data = pd.DataFrame({
        "Name": ["Alice", "Bob", "Charlie"],
        "Age": [25, 30, 22],
        "City": ["New York", "San Francisco", "Chicago"]
    })

    # Save dataset to in-memory CSV file
    csv_buffer = BytesIO()
    sample_data.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    # Define storage path
    data_path = f"{user.id}/{workspace.name}/datasets/{dataset_name}.csv"

    # Upload to B2 storage
    b2_filemanager = B2FileManager()
    b2_filemanager.write_file(sample_data, data_path, "csv")

    # Create dataset record in the database
    new_dataset = DatasetModel(
        name=dataset_name,
        description=dataset_description,
        data=data_path,
        workspace_id=workspace.id,
        created_by=user.id,
    )

    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)

    # Process and save cleaned data version
    processed_data_path = f"{user.id}/{workspace.name}/datasets/{new_dataset.id}/{dataset_name}.csv"
    b2_filemanager.write_file(sample_data, processed_data_path, "csv")

    cleaned_data = ProcessedDataModel(
        dataset_id=new_dataset.id,
        data=processed_data_path,
        version=1
    )

    db.add(cleaned_data)
    db.commit()
