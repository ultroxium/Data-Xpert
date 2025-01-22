
from fastapi import HTTPException,status

from app.Helper.B2fileManager import B2FileManager


class DataHelper:
    def __init__(self, datapath):
        self.datapath = datapath
        self.b2_filemanager = B2FileManager()
        self.df = self.b2_filemanager.read_file(self.datapath,'csv')

    def check_null_values(self):
        isNull= self.df.isnull().any().any()
        if isNull:
            #raise exception
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset contains null values, Please clean the data and try again.")
        return True