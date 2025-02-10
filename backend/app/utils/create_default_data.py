import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from app.api.workspaces.model import WorkspaceModel
from app.api.feature_engineering.model import ProcessedDataModel
from app.api.datasets.model import DatasetModel
from app.Helper.B2fileManager import B2FileManager
from app.api.auth.model import UserModel
from sqlalchemy.orm import aliased,joinedload

import numpy as np

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

    np.random.seed(42)

    # Define the number of sample transactions
    num_transactions = 50

    # Create a sample data dictionary
    data = {
        "Transaction ID": [f"T{1000+i}" for i in range(num_transactions)],
        "Date": pd.to_datetime("2025-01-01") + pd.to_timedelta(np.random.randint(0, 30, size=num_transactions), unit="D"),
        "Store": np.random.choice(["Store A", "Store B", "Store C"], size=num_transactions),
        "Product": np.random.choice(["Laptop", "Tablet", "Smartphone", "Accessory"], size=num_transactions),
        "Quantity": np.random.randint(1, 5, size=num_transactions),
        "Unit Price": np.round(np.random.uniform(100, 2000, size=num_transactions), 2),
        "Discount (%)": np.random.choice([0, 5, 10, 15, 20], size=num_transactions)
    }

    # Create the DataFrame
    sales_df = pd.DataFrame(data)

    # Calculate Revenue after discount
    sales_df["Revenue"] = sales_df["Quantity"] * sales_df["Unit Price"] * (1 - sales_df["Discount (%)"] / 100)

    # Sort the DataFrame by Date for a chronological view
    sales_df.sort_values("Date", inplace=True)

    # Save dataset to in-memory CSV file
    csv_buffer = BytesIO()
    sales_df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    # Define storage path
    data_path = f"{user.id}/{workspace.name}/datasets/{dataset_name}"

    # Upload to B2 storage
    b2_filemanager = B2FileManager()
    b2_filemanager.write_file(sales_df, data_path, "csv")

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

    created_dataset = db.query(DatasetModel).options(joinedload(DatasetModel.creator)).filter(DatasetModel.id == new_dataset.id).one_or_none()
    b2_filemanager.read_file(created_dataset.data, 'csv')

    # Process and save cleaned data version
    processed_data_path = f"{user.id}/{workspace.name}/datasets/{created_dataset.id}/{dataset_name}"
    b2_filemanager.write_file(sales_df, processed_data_path, "csv")

    cleaned_data = ProcessedDataModel(
        dataset_id=new_dataset.id,
        data=processed_data_path,
        version=1
    )

    db.add(cleaned_data)
    db.commit()

