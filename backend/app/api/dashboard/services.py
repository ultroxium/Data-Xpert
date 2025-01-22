import builtins
from app.api.charts.model import ChartModel
from fastapi import status, HTTPException
from fastapi.responses import JSONResponse
# from app.api.notifications.model import NotificationModel
from app.api.chat.model import ChatModel
from app.api.chat.utils.DataInspection import DataInspection
from app.api.notifications.model import NotificationModel
from app.api.workspaces.model import WorkspaceModel
from app.database.database import get_db
from app.api.charts.response import ChartCreate, ChartResponse,ChartUpdate
from sqlalchemy.orm import Session
from app.api.datasets.model import DatasetModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.Helper.websocket import manager
import random
import string
import pandas as pd
import numpy as np
import sys
import json
from typing import Any, Dict
from app.Helper.check_permissions import PermissionCheck
from app.Helper.B2fileManager import B2FileManager


class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.permission_check = PermissionCheck(db, current_user)
        self.b2_filemanager = B2FileManager()

    
    def workspace_insights(self):
        # Query non-deleted workspaces, datasets, and charts created by the current user
        workspaces = self.db.query(WorkspaceModel).filter_by(created_by=self.current_user.id, is_deleted=False).all()
        datasets = self.db.query(DatasetModel).filter_by(created_by=self.current_user.id, is_deleted=False).all()
        charts = self.db.query(ChartModel).filter_by(created_by=self.current_user.id, is_deleted=False).all()

        # Calculate totals
        total_workspaces = len(workspaces)
        total_datasets = len(datasets)
        total_charts = len(charts)

        # Get the most recent datasets with workspace name
        recent_uploades = self.db.query(DatasetModel, WorkspaceModel)\
            .join(WorkspaceModel, DatasetModel.workspace_id == WorkspaceModel.id)\
            .filter(DatasetModel.created_by == self.current_user.id, DatasetModel.is_deleted == False)\
            .order_by(DatasetModel.created_at.desc())\
            .limit(5)\
            .all()

        # Convert recent datasets to dictionary format including workspace name
        recent_uploades = [{
            'name': ds.name, 
            'created_at': ds.created_at, 
            'workspace': ws.name
        } for ds, ws in recent_uploades]
        
        # Prepare workspace-level dataset and chart counts
        datasets_num = []
        charts_num = []

        for ws in workspaces:
            datasets_num.append({
                "workspace": ws.name,
                "files": len([ds for ds in datasets if ds.workspace_id == ws.id])
            })

            charts_num.append({
                "workspace": ws.name,
                "charts": len([ch for ch in charts if ch.workspace_id == ws.id])
            })

        return {
            "dataset_info": datasets_num,
            "chart_info": charts_num,
            "total_workspaces": total_workspaces,
            "total_charts": total_charts,
            "total_datasets": total_datasets,
            "recent_uploades": recent_uploades,
        }
