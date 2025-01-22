from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.orm import Session

from app.Helper.B2fileManager import B2FileManager
from app.api.datasets.model import DatasetModel
from .services import URLToDataFrame

def auto_refresh_datasets(db: Session, file_manager: B2FileManager):
    """
    Refresh datasets based on their specific refresh periods.
    Only datasets whose refresh period has elapsed since their last refresh are updated.
    """
    # Query all datasets that have a defined refresh period and are not deleted
    datasets = db.query(DatasetModel).filter(
        DatasetModel.refresh_period.isnot(None),
        DatasetModel.is_deleted == False,
        DatasetModel.is_api_data == True
    ).all()
    
    # Loop through each dataset to check if it needs refreshing
    for dataset in datasets:
        last_refreshed = dataset.updated_at or dataset.created_at  # Fallback to created_at if updated_at is None
        next_refresh_time = last_refreshed + timedelta(seconds=dataset.refresh_period)

        # Check if the current time has reached or passed the next refresh time
        if datetime.now() >= next_refresh_time:
            # Fetch data from API
            api_data = URLToDataFrame(dataset.api_url, dataset.api_headers)
            dataset_df = api_data.to_dataframe()
            dataset_df.replace("", np.nan, inplace=True)
            threshold = 0.6 * len(dataset_df)
            dataset_df = dataset_df.dropna(thresh=threshold, axis=1)
            
            # Save to B2 or chosen file storage
            data_path = dataset.data
            file_manager.write_file(dataset_df, data_path, "csv")
            
            # Update the last refresh timestamp
            dataset.updated_at = datetime.now()
            db.commit()
