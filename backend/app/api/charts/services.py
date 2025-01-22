import builtins
import math
from fastapi import status, HTTPException
from fastapi.responses import JSONResponse
# from app.api.notifications.model import NotificationModel
from app.Helper.df_helper import DataHelper
from app.api.workspaces.model import WorkspaceModel
from app.database.database import get_db
from app.api.auth.services import get_current_active_user
from app.api.charts.response import ChartCreate, ChartResponse,ChartUpdate
from sqlalchemy.orm import Session
from app.api.charts.model import ChartModel
from app.api.datasets.model import DatasetModel
from app.api.workspaces.teams.members_model import TeamMemberModel
from app.Helper.websocket import manager
import random
import string
import pandas as pd
import numpy as np
import sys
import json
from typing import Any, Dict, Optional
from app.Helper.check_permissions import PermissionCheck
from app.Helper.B2fileManager import B2FileManager
from fastapi.responses import StreamingResponse



class Services:
    def __init__(self, db: Session, current_user: dict):
        self.db = db
        self.current_user = current_user
        self.permission_check = PermissionCheck(db, current_user)
        self.b2_filemanager = B2FileManager()
        
    def _query_non_deleted_chart(self, **filters):
        return (
            self.db.query(ChartModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )
        
    def _query_non_deleted_dataset(self, **filters):
        return (
            self.db.query(DatasetModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )

    async def create_chart(self,workspace_id, dataset_id, data):
        self.permission_check.check_edit_access(workspace_id)
        chart = self._query_non_deleted_chart(
            workspace_id=workspace_id,
            dataset_id=dataset_id,
            label=data.label,
            key=data.key,
        )
        
        dataset = self._query_non_deleted_dataset(
            id=dataset_id,
            # workspace_id=workspace_id
        )

        data_helper = DataHelper(dataset.data)
        data_helper.check_null_values()

        if chart:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chart already exists",
            )

        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset does not exist",
            )
        
        if data.xAxis == data.yAxis:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X and Y axis cannot be same",
            )

        new_chart = ChartModel(
            key=data.key,
            label=data.label,
            description=data.description,
            column=data.column,
            xAxis=data.xAxis,
            yAxis=data.yAxis,
            option=data.option,
            dataset_id=dataset_id,
            workspace_id=dataset.workspace_id,
            created_by=self.current_user.id,
        )

        self.db.add(new_chart)
        # notification = NotificationModel(
        #     user_id=self.current_user.id,
        #     message="You have created a new chart.",
        #     title="New Chart",
        #     tag="notification",
        # )
        # self.db.add(notification)
        self.db.commit()
        self.db.refresh(new_chart)
        
        # if self.current_user.id:
            # await manager.send_personal_message({
            #     "title": "New Chart",
            #     "message": "You have created a new chart",
            #     "tag": "notification",
            #     "created_at": str(notification.created_at),
            #     }, self.current_user.id)
        return new_chart

    def get_charts(self,workspace_id, dataset_id):
        self.permission_check.check_view_access(workspace_id)
            
        charts = (
            self.db.query(ChartModel)
            .filter(
                # ChartModel.created_by == self.current_user.id,
                ChartModel.dataset_id == dataset_id,
                ChartModel.is_deleted == False,
                ChartModel.workspace_id == workspace_id,
            )
            .all()
        )
        
        dataset= self._query_non_deleted_dataset(
            id=dataset_id,
            workspace_id=workspace_id,
        )

        df = self.b2_filemanager.read_file(dataset.data, 'csv')

        final_chart = []

        for chart in charts:
            column = chart.column
            xAxis = chart.xAxis
            yAxis = chart.yAxis

            if column and not yAxis:
                isMultipleColumn = False
            elif (xAxis and yAxis) or chart.key == "correlation":
                isMultipleColumn = True
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Something went wrong, try again later.",
                )

            # Single Column Charts
            if not isMultipleColumn:
                if chart.key in ["line", "bar", "area"]:
                    try:
                        if chart.option == "count":
                            value_count = df[column].value_counts()
                            xLabel = value_count.index.tolist()
                            yLabel = value_count.values.tolist()
                        if chart.option == "average":
                            average = float(df[column].mean())
                            xLabel = [column]
                            yLabel = [average]

                        if chart.option == "sum":
                            sum = float(df[column].sum())
                            xLabel = [column]
                            yLabel = [sum]

                        if chart.option == "min":
                            min = float(df[column].min())
                            xLabel = [column]
                            yLabel = [min]

                        if chart.option == "max":
                            max = float(df[column].max())
                            xLabel = [column]
                            yLabel = [max]

                        if chart.option == "distribution":
                            mean = df[column].mean()
                            std_dev = df[column].std()
                            bins = [mean - 3*std_dev, mean - 2*std_dev, mean - std_dev,
                                mean, mean + std_dev, mean + 2*std_dev, mean + 3*std_dev]

                            # Create xLabel and yLabel
                            xLabel = [
                                f"{round(bins[i], 2)}-{round(bins[i + 1], 2)}"
                                for i in range(len(bins) - 1)
                            ]
                            yLabel = [
                                len(df[(df[column] >= bins[i]) & (df[column] < bins[i + 1])])
                                for i in range(len(bins) - 1)
                            ]

                        final_chart.append(
                            {
                                "id": chart.id,
                                "key": chart.key,
                                "label": chart.label,
                                "layout": chart.layout,
                                "color":chart.color,
                                "description": chart.description,
                                "column": chart.column,
                                "option": chart.option,
                                "xLabel": xLabel,
                                "yLabel": yLabel,
                                "workspace_id": chart.workspace_id,
                                "dataset_id": chart.dataset_id,
                                "created_by": chart.created_by,
                                "updated_by": chart.updated_by,
                                "updated_at": chart.updated_at,
                                "created_at": chart.created_at,
                            }
                        )
                    except Exception as e:
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": f"Something went wrong, try again later. error {e}",
                            }
                        )
                        break

                elif chart.key in ["pie", "doughnut", "customized_pie"]:
                    if chart.option == "count":
                        value_count = df[column].value_counts()
                        data = [
                            {"value": count, "name": name}
                            for name, count in value_count.items()
                        ]
                    if chart.option == "average":
                        average = float(df[column].mean())
                        data = [{"value": average, "name": column}]

                    if chart.option == "sum":
                        sum = float(df[column].sum())
                        data = [{"value": sum, "name": column}]

                    if chart.option == "min":
                        min = float(df[column].min())
                        data = [{"value": min, "name": column}]

                    if chart.option == "max":
                        max = float(df[column].max())
                        data = [{"value": max, "name": column}]

                    if chart.option == "distribution":
                        if len(chart.xAxis) > 0:
                            step = float(list(chart.xAxis)[0])
                        else:
                            step = 1.0

                        data = []
                        for i in np.arange(df[column].min(), df[column].max(), step):
                            data.append(
                                {
                                    "value": len(
                                        df[(df[column] >= i) & (df[column] < i + step)]
                                    ),
                                    "name": f"{round(i, 2)}-{round(i+step, 2)}",
                                }
                            )

                    final_chart.append(
                        {
                            "id": chart.id,
                            "key": chart.key,
                            "label": chart.label,
                            "layout": chart.layout,
                            "color":chart.color,
                            "description": chart.description,
                            "column": chart.column,
                            "option": chart.option,
                            "data": data,
                            "workspace_id": chart.workspace_id,
                            "dataset_id": chart.dataset_id,
                            "created_by": chart.created_by,
                            "updated_by": chart.updated_by,
                            "updated_at": chart.updated_at,
                            "created_at": chart.created_at,
                        }
                    )

            elif isMultipleColumn and chart.key != "correlation":
                x_values = list(chart.xAxis)[0]
                y_values = list(chart.yAxis)[0]
                df[y_values] = pd.to_numeric(df[y_values], errors="coerce").astype(float)
                if chart.key in ["line", "bar", "area"]:
                    if chart.option == "average":
                        grouped_df = df.groupby(x_values,observed=False)[y_values].mean().reset_index()
                    elif chart.option == "sum":
                        grouped_df = df.groupby(x_values)[y_values].sum().reset_index()
                    elif chart.option == "min":
                        grouped_df = df.groupby(x_values)[y_values].min().reset_index()
                    elif chart.option == "max":
                        grouped_df = df.groupby(x_values)[y_values].max().reset_index()
                    elif chart.option == "per-hundredths":
                        grouped_df = df.groupby(x_values)[y_values].sum().reset_index()
                        grouped_df[y_values] = (
                            grouped_df[y_values] / grouped_df[x_values]
                        ) * 100
                    else:
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "Invalid plot option selected.",
                            }
                        )
                        break
                    xLabel = grouped_df[x_values].tolist()
                    yLabel = grouped_df[y_values].tolist()

                    #if xLabel or yLabel have inf value then replace it with 0
                    xLabel = [0 if isinstance(x, (int, float)) and math.isinf(x) else x for x in xLabel]
                    yLabel = [0 if isinstance(y, (int, float)) and math.isinf(y) else y for y in yLabel]

                    final_chart.append(
                        {
                            "id": chart.id,
                            "key": chart.key,
                            "label": chart.label,
                            "layout": chart.layout,
                            "color":chart.color,
                            "description": chart.description,
                            "xAxis": chart.xAxis,
                            "yAxis": chart.yAxis,
                            "option": chart.option,
                            "xLabel": xLabel,
                            "yLabel": yLabel,
                            "workspace_id": chart.workspace_id,
                            "dataset_id": chart.dataset_id,
                            "created_by": chart.created_by,
                            "updated_by": chart.updated_by,
                            "updated_at": chart.updated_at,
                            "created_at": chart.created_at,
                        }
                    )

                elif chart.key in [
                    "scatter",
                    "linear",
                    "cluster",
                    "linear_regression",
                    "polynomial_regression",
                    "exponential_regression",
                ]:
                    x_values = list(chart.xAxis)[0]
                    y_values = list(chart.yAxis)[0]

                    df[x_values] = pd.to_numeric(df[x_values], errors="coerce").astype(float)
                    df[y_values] = pd.to_numeric(df[y_values], errors="coerce").astype(float)

                    # Ensure both values are numbers
                    if not pd.api.types.is_numeric_dtype(
                        df[x_values]
                    ) or not pd.api.types.is_numeric_dtype(df[y_values]):
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "Both x and y values must be numerical in scatter plot.",
                            }
                        )
                        break

                    # Ensure both x and y have the same length
                    if len(df[x_values]) == len(df[y_values]):
                        data = list(zip(df[x_values], df[y_values]))
                    else:
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "Mismatch in length of x and y values. To scatter plots, use equal length of x and y values.",
                            }
                        )
                        break

                    final_chart.append(
                        {
                            "id": chart.id,
                            "key": chart.key,
                            "label": chart.label,
                            "layout": chart.layout,
                            "color":chart.color,
                            "description": chart.description,
                            "xAxis": chart.xAxis,
                            "yAxis": chart.yAxis,
                            "option": chart.option,
                            "data": data,
                            "workspace_id": chart.workspace_id,
                            "dataset_id": chart.dataset_id,
                            "created_by": chart.created_by,
                            "updated_by": chart.updated_by,
                            "updated_at": chart.updated_at,
                            "created_at": chart.created_at,
                        }
                    )
                if chart.key in ["pie", "doughnut", "customized_pie"]:
                    x_values = list(chart.xAxis)[0]
                    y_values = list(chart.yAxis)[0]

                    df[y_values] = pd.to_numeric(df[y_values], errors="coerce").astype(float)

                    if not pd.api.types.is_numeric_dtype(df[y_values]):
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "Y values must be numerical in scatter plot.",
                            }
                        )
                        break

                    if chart.option == "average":
                        avg = df.groupby(x_values,observed=False)[y_values].mean().reset_index()
                        data = avg.apply(
                            lambda row: {"name": row[x_values], "value": row[y_values]},
                            axis=1,
                        ).to_list()

                    if chart.option == "sum":
                        sum = df.groupby(x_values)[y_values].sum().reset_index()
                        data = sum.apply(
                            lambda row: {"name": row[x_values], "value": row[y_values]},
                            axis=1,
                        ).to_list()

                    if chart.option == "min":
                        min = df.groupby(x_values)[y_values].min().reset_index()
                        data = min.apply(
                            lambda row: {"name": row[x_values], "value": row[y_values]},
                            axis=1,
                        ).to_list()

                    if chart.option == "max":
                        max = df.groupby(x_values)[y_values].max().reset_index()
                        data = max.apply(
                            lambda row: {"name": row[x_values], "value": row[y_values]},
                            axis=1,
                        ).to_list()

                    final_chart.append(
                        {
                            "id": chart.id,
                            "key": chart.key,
                            "label": chart.label,
                            "layout": chart.layout,
                            "color":chart.color,
                            "description": chart.description,
                            "xAxis": chart.xAxis,
                            "yAxis": chart.yAxis,
                            "option": chart.option,
                            "data": data,
                            "workspace_id": chart.workspace_id,
                            "dataset_id": chart.dataset_id,
                            "created_by": chart.created_by,
                            "updated_by": chart.updated_by,
                            "updated_at": chart.updated_at,
                            "created_at": chart.created_at,
                        }
                    )

                if chart.key in ["heatmap"]:

                    x_values = list(chart.xAxis)[0]
                    y_values = list(chart.yAxis)

                    df[x_values] = pd.Categorical(
                        df[x_values], categories=df[x_values].unique()
                    )
                    for col in y_values:
                        df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)

                    if any(not pd.api.types.is_numeric_dtype(df[y]) for y in y_values):
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "All Y values must be numerical for heatmap.",
                            }
                        )
                        break

                    heatmap_data = []
                    for i, y_value in enumerate(y_values):
                        if chart.option == "average":
                            avg = df.groupby(x_values,observed=False)[y_value].mean().reset_index()
                            data_list = [
                                [i, j, round(avg.iloc[j, 1], 2)]
                                for j in range(len(avg))
                            ]
                            heatmap_data.extend(data_list)

                        elif chart.option == "sum":
                            sum_values = (
                                df.groupby(x_values)[y_value].sum().reset_index()
                            )
                            data_list = [
                                [i, j, sum_values.iloc[j, 1]]
                                for j in range(len(sum_values))
                            ]
                            heatmap_data.extend(data_list)

                        elif chart.option == "min":
                            min_values = (
                                df.groupby(x_values)[y_value].min().reset_index()
                            )
                            data_list = [
                                [i, j, min_values.iloc[j, 1]]
                                for j in range(len(min_values))
                            ]
                            heatmap_data.extend(data_list)

                        elif chart.option == "max":
                            max_values = (
                                df.groupby(x_values)[y_value].max().reset_index()
                            )
                            data_list = [
                                [i, j, max_values.iloc[j, 1]]
                                for j in range(len(max_values))
                            ]
                            heatmap_data.extend(data_list)

                        else:
                            final_chart.append(
                                {
                                    "label": chart.label,
                                    "description": chart.description,
                                    "error": "Invalid plot option selected.",
                                }
                            )
                            break

                    xLabel = df[x_values].unique().tolist()
                    yLabel = y_values

                    all_values = [data[2] for data in heatmap_data]
                    max_value = builtins.max(all_values)
                    min_value = builtins.min(all_values)

                    final_chart.append(
                        {
                            "id": chart.id,
                            "key": chart.key,
                            "label": chart.label,
                            "layout": chart.layout,
                            "color":chart.color,
                            "description": chart.description,
                            "xAxis": chart.xAxis,
                            "yAxis": chart.yAxis,
                            "option": chart.option,
                            "data": {
                                "dataList": heatmap_data,
                                "xLabel": xLabel,
                                "yLabel": yLabel,
                                "max": max_value,
                                "min": min_value,
                            },
                            "workspace_id": chart.workspace_id,
                            "dataset_id": chart.dataset_id,
                            "created_by": chart.created_by,
                            "updated_by": chart.updated_by,
                            "updated_at": chart.updated_at,
                            "created_at": chart.created_at,
                        }
                    )

            if chart.key in ["stacked_line"]:
                x_values = list(chart.xAxis)[0]
                y_values = list(chart.yAxis)

                df[x_values] = pd.Categorical(
                    df[x_values], categories=df[x_values].unique()
                )
                for col in y_values:
                    df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)

                if any(not pd.api.types.is_numeric_dtype(df[y]) for y in y_values):
                    final_chart.append(
                        {
                            "label": chart.label,
                            "description": chart.description,
                            "error": "All Y values must be numerical for Stacked Line.",
                        }
                    )
                    break

                stacked_line_data = []
                for i, y_value in enumerate(y_values):
                    if chart.option == "average":
                        avg = df.groupby(x_values,observed=False)[y_value].mean().reset_index()
                        avg_values = avg[y_value].tolist()
                        stacked_line_data.append({
                            "name": y_value,
                            "type": "line",
                            "stack": chart.option,
                            "data": avg_values
                        })

                    elif chart.option == "sum":
                        sum = (
                            df.groupby(x_values)[y_value].sum().reset_index()
                        )
                        sum_values = sum[y_value].tolist()

                        stacked_line_data.append({
                            "name": y_value,
                            "type": "line",
                            "stack": chart.option,
                            "data": sum_values
                        })
                    elif chart.option == "min":
                        min = (
                            df.groupby(x_values)[y_value].min().reset_index()
                        )
                        min_values = min[y_value].tolist()
                        stacked_line_data.append({
                            "name": y_value,
                            "type": "line",
                            "stack": chart.option,
                            "data": min_values
                        })
                    elif chart.option == "max":
                        max = (
                            df.groupby(x_values)[y_value].max().reset_index()
                        )
                        max_values = max[y_value].tolist()
                        stacked_line_data.append({
                            "name": y_value,
                            "type": "line",
                            "stack": chart.option,
                            "data": max_values
                        })
                    else:
                        final_chart.append(
                            {
                                "label": chart.label,
                                "description": chart.description,
                                "error": "Invalid plot option selected.",
                            }
                        )
                        break
                    
                xLabel = df[x_values].unique().tolist()
                yLabel = y_values

                final_chart.append(
                    {
                        "id": chart.id,
                        "key": chart.key,
                        "label": chart.label,
                        "layout": chart.layout,
                        "color":chart.color,
                        "description": chart.description,
                        "xAxis": chart.xAxis,
                        "yAxis": chart.yAxis,
                        "option": chart.option,
                        "data": {
                            "dataList": stacked_line_data,
                            "xLabel": xLabel,
                            "yLabel": yLabel
                        },
                        "workspace_id": chart.workspace_id,
                        "dataset_id": chart.dataset_id,
                        "created_by": chart.created_by,
                        "updated_by": chart.updated_by,
                        "updated_at": chart.updated_at,
                        "created_at": chart.created_at,
                    }
                )

            if chart.key in ["correlation"]:
                x_values = list(chart.xAxis)
                for col in x_values:
                    df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)

                corr_df = df[x_values]

                if chart.option == "pearson":
                    correlation_matrix = corr_df.corr(method="pearson")
                elif chart.option == "spearman":
                    correlation_matrix = corr_df.corr(method="spearman")
                elif chart.option == "kendall":
                    correlation_matrix = corr_df.corr(method="kendall")
                else:
                    final_chart.append(
                        {
                            "label": chart.label,
                            "description": chart.description,
                            "error": "Invalid plot option selected.",
                        }
                    )
                    break

                # Handle NaN or infinite values
                rounded_matrix = correlation_matrix.round(2)
                rounded_matrix.replace([np.inf, -np.inf], np.nan, inplace=True)
                rounded_matrix.fillna(0, inplace=True)

                xLabel = rounded_matrix.columns.tolist()
                yLabel = rounded_matrix.index.tolist()

                # Format data as dataList
                dataList = [
                    [i, j, rounded_matrix.iloc[i, j]]
                    for i in range(len(rounded_matrix))
                    for j in range(len(rounded_matrix.columns))
                ]

                # Calculate max and min values
                max_value = rounded_matrix.values.max()
                min_value = rounded_matrix.values.min()

                final_chart.append(
                    {
                        "id": chart.id,
                        "key": chart.key,
                        "label": chart.label,
                        "layout": chart.layout,
                        "color":chart.color,
                        "description": chart.description,
                        "option": chart.option,
                        "data": {
                            "dataList": dataList,
                            "xLabel": xLabel,
                            "yLabel": yLabel,
                            "max": max_value,
                            "min": min_value,
                        },
                        "workspace_id": chart.workspace_id,
                        "dataset_id": chart.dataset_id,
                        "created_by": chart.created_by,
                        "updated_by": chart.updated_by,
                        "updated_at": chart.updated_at,
                        "created_at": chart.created_at,
                    }
                )
        #sort the final chart by created_at
        return sorted(final_chart, key=lambda x: x['created_at'],reverse=True)


    def delete_chart(self,workspace_id, chart_id):
        self.permission_check.check_edit_access(workspace_id)
            
        
        chart = self._query_non_deleted_chart(
            workspace_id=workspace_id,
            id=chart_id,
        )

        if not chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart not found",
            )

        chart.is_deleted = True
        self.db.commit()
        return {"message": "Chart deleted successfully"}
    
    def update_chart(self,workspace_id,chart_id, data: ChartUpdate):
        self.permission_check.check_edit_access(workspace_id)
        
        chart = self._query_non_deleted_chart(
            workspace_id=workspace_id,
            id=chart_id,
        )

        if not chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart not found",
            )

        # Update only the fields that are provided in the payload
        if data.key is not None:
            chart.key = data.key
        if data.label is not None:
            chart.label = data.label
        if data.description is not None:
            chart.description = data.description
        if data.option is not None:
            chart.option = data.option
        if data.column is not None:
            chart.column = data.column
        if data.dtype is not None:
            chart.dtype = data.dtype
        if data.xAxis is not None:
            chart.xAxis = data.xAxis
        if data.yAxis is not None:
            chart.yAxis = data.yAxis
        if data.layout is not None:
            chart.layout = data.layout
        if data.color is not None:
            chart.color = data.color
        
        chart.updated_by = self.current_user.id
        self.db.commit()
        self.db.refresh(chart)
        return chart

    
    
    def duplicate_chart(self,workspace_id, chart_id):
        self.permission_check.check_edit_access(workspace_id)
                
        chart = self._query_non_deleted_chart(
            workspace_id=workspace_id,
            id=chart_id,
        )

        if not chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart not found",
            )
            
        base_name = chart.label

        # Generate the new name with incremental copy number
        index = 1
        new_name = f"{base_name}_copy({index})"

        # Check for existing names and increment the index
        while self._query_non_deleted_chart(label=new_name):
            index += 1
            new_name = f"{base_name}_copy({index})"

        new_chart = ChartModel(
            key=chart.key,
            label=new_name,
            description=chart.description,
            column=chart.column,
            xAxis=chart.xAxis,
            yAxis=chart.yAxis,
            option=chart.option,
            dataset_id=chart.dataset_id,
            workspace_id=chart.workspace_id,
            created_by=self.current_user.id,
        )

        self.db.add(new_chart)
        self.db.commit()
        self.db.refresh(new_chart)
        return new_chart
    


    # --------------------------------------------------

class PublicServices:
    def __init__(self, db: Session):
        self.db = db
        self.b2_filemanager = B2FileManager()

    def _query_non_deleted_chart(self, **filters):
        return (
            self.db.query(ChartModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )
        
    def _query_non_deleted_dataset(self, **filters):
        return (
            self.db.query(DatasetModel)
            .filter_by(**filters, is_deleted=False)
            .first()
        )
    def _query_non_deleted_chart_last(self, **filters):
        return (
            self.db.query(ChartModel)
            .filter_by(**filters, is_deleted=False)
            .order_by(ChartModel.created_at.desc())
            .first()
        )

    async def process_charts(self, workspace_id: int, dataset_id: int):
        
        charts = (
            self.db.query(ChartModel)
            .filter(
                ChartModel.dataset_id == dataset_id,
                ChartModel.is_deleted == False,
                ChartModel.workspace_id == workspace_id,
            )
            .all()
        )
        
        dataset = self._query_non_deleted_dataset(id=dataset_id)
        df = self.b2_filemanager.read_file(dataset.data, 'csv')

        for chart in charts:
            try:
                result = await self.process_single_chart(chart, df)
                if result:
                    yield result
            except Exception as e:
                yield {
                    "id": chart.id,
                    "label": chart.label,
                    "description": chart.description,
                    "error": f"Something went wrong, try again later. error {str(e)}",
                }

    async def process_single_chart(self, chart: ChartModel, df: pd.DataFrame):
        if chart.key in ["line", "bar", "area"]:
            return await self._process_basic_chart(chart, df)
        elif chart.key in ["pie", "doughnut", "customized_pie"]:
            return await self._process_pie_chart(chart, df)
        elif chart.key in ["scatter", "linear", "cluster", "linear_regression", "polynomial_regression", "exponential_regression"]:
            return await self._process_scatter_chart(chart, df)
        elif chart.key == "heatmap":
            return await self._process_heatmap(chart, df)
        elif chart.key == "stacked_line":
            return await self._process_stacked_line(chart, df)
        elif chart.key == "correlation":
            return await self._process_correlation(chart, df)
        else:
            raise ValueError(f"Unsupported chart type: {chart.key}")

    async def _process_basic_chart(self, chart: ChartModel, df: pd.DataFrame):
        column = chart.column
        if not chart.yAxis:
            if chart.option == "count":
                value_count = df[column].value_counts()
                xLabel = value_count.index.tolist()
                yLabel = value_count.values.tolist()
            elif chart.option == "average":
                average = float(df[column].mean())
                xLabel = [column]
                yLabel = [average]
            elif chart.option == "sum":
                sum = float(df[column].sum())
                xLabel = [column]
                yLabel = [sum]
            elif chart.option == "min":
                min = float(df[column].min())
                xLabel = [column]
                yLabel = [min]
            elif chart.option == "max":
                max = float(df[column].max())
                xLabel = [column]
                yLabel = [max]
            elif chart.option == "distribution":
                # if len(chart.xAxis) > 0:
                #     step = float(list(chart.xAxis)[0])
                # else:
                #     step = (df[column].max() - df[column].min()) / 10

                # xLabel = [
                #     f"{round(i, 2)}-{round(i+step, 2)}"
                #     for i in np.arange(
                #         df[column].min(), df[column].max(), step
                #     )
                # ]
                # yLabel = [
                #     len(df[(df[column] >= i) & (df[column] < i + step)])
                #     for i in np.arange(
                #         df[column].min(), df[column].max(), step
                #     )
                # ]
                mean = df[column].mean()
                std_dev = df[column].std()
                bins = [mean - 3*std_dev, mean - 2*std_dev, mean - std_dev,
                    mean, mean + std_dev, mean + 2*std_dev, mean + 3*std_dev]

                # Create xLabel and yLabel
                xLabel = [
                    f"{round(bins[i], 2)}-{round(bins[i + 1], 2)}"
                    for i in range(len(bins) - 1)
                ]
                yLabel = [
                    len(df[(df[column] >= bins[i]) & (df[column] < bins[i + 1])])
                    for i in range(len(bins) - 1)
                ]
            else:
                value = getattr(df[column], chart.option)()
                xLabel = [column]
                yLabel = [value]
        else:
            x_values = list(chart.xAxis)[0]
            y_values = list(chart.yAxis)[0]
            df[y_values] = pd.to_numeric(df[y_values], errors='coerce')
            grouped = df.groupby(x_values, observed=False)[y_values]
            if chart.option == "average":
                result = grouped.mean()
                xLabel = result.index.tolist()
                yLabel = result.values.tolist()
            elif chart.option == "sum":
                result = grouped.sum()
                xLabel = result.index.tolist()
                yLabel = result.values.tolist()
            elif chart.option == "min":
                result = grouped.min()
                xLabel = result.index.tolist()
                yLabel = result.values.tolist()
            elif chart.option == "max":
                result = grouped.max()
                xLabel = result.index.tolist()
                yLabel = result.values.tolist()
            elif chart.option == "per-hundredths":
                grouped_df = df.groupby(x_values)[y_values].sum().reset_index()
                grouped_df[y_values] = (
                    grouped_df[y_values] / grouped_df[x_values]
                ) * 100
                xLabel = grouped_df[x_values].tolist()
                yLabel = grouped_df[y_values].tolist()

                #if xLabel or yLabel have inf value then replace it with 0
                xLabel = [0 if math.isinf(x) else x for x in xLabel]
                yLabel = [0 if math.isinf(y) else y for y in yLabel]

            else:
                raise ValueError(f"Invalid option: {chart.option}")
            
        return self._create_chart_response(chart, xLabel, yLabel)

    async def _process_pie_chart(self, chart: ChartModel, df: pd.DataFrame):
        if not chart.yAxis:
            column = chart.column
            if chart.option == "count":
                value_count = df[column].value_counts()
                data = [{"name": name, "value": count} for name, count in value_count.items()]
            elif chart.option == "distribution":
                if len(chart.xAxis) > 0:
                    step = float(list(chart.xAxis)[0])
                else:
                    step = 1.0

                data = []
                for i in np.arange(df[column].min(), df[column].max(), step):
                    data.append(
                        {
                            "value": len(
                                df[(df[column] >= i) & (df[column] < i + step)]
                            ),
                            "name": f"{round(i, 2)}-{round(i+step, 2)}",
                        }
                    )
            else:
                value = getattr(df[column], chart.option)()
                data = [{"name": column, "value": value}]
        else:
            x_values = list(chart.xAxis)[0]
            y_values = list(chart.yAxis)[0]
            df[y_values] = pd.to_numeric(df[y_values], errors='coerce')
            grouped = df.groupby(x_values, observed=False)[y_values]
            if chart.option == "average":
                result = grouped.mean()
                data = [{"name": name, "value": value} for name, value in result.items()]
            elif chart.option == "sum":
                result = grouped.sum()
                data = [{"name": name, "value": value} for name, value in result.items()]
            elif chart.option == "min":
                result = grouped.min()
                data = [{"name": name, "value": value} for name, value in result.items()]
            elif chart.option == "max":
                result = grouped.max()
                data = [{"name": name, "value": value} for name, value in result.items()]
            
            else:
                raise ValueError(f"Invalid option: {chart.option}")
            

        return self._create_chart_response(chart, data=data)

    async def _process_scatter_chart(self, chart: ChartModel, df: pd.DataFrame):
        x_values = list(chart.xAxis)[0]
        y_values = list(chart.yAxis)[0]
        df[x_values] = pd.to_numeric(df[x_values], errors='coerce')
        df[y_values] = pd.to_numeric(df[y_values], errors='coerce')
        data = list(zip(df[x_values], df[y_values]))
        return self._create_chart_response(chart, data=data)

    async def _process_heatmap(self, chart: ChartModel, df: pd.DataFrame):
        x_values = list(chart.xAxis)[0]
        y_values = list(chart.yAxis)
        df[x_values] = pd.Categorical(df[x_values], categories=df[x_values].unique())
        for col in y_values:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        heatmap_data = []
        for i, y_value in enumerate(y_values):
            grouped = df.groupby(x_values, observed=False)[y_value]
            if chart.option == "average":
                result = grouped.mean()
            elif chart.option == "sum":
                result = grouped.sum()
            elif chart.option == "min":
                result = grouped.min()
            elif chart.option == "max":
                result = grouped.max()
            else:
                raise ValueError(f"Invalid option: {chart.option}")
            heatmap_data.extend([[i, j, result.iloc[j]] for j in range(len(result))])

        xLabel = df[x_values].unique().tolist()
        yLabel = y_values
        all_values = [data[2] for data in heatmap_data]
        max_value = max(all_values)
        min_value = min(all_values)

        return self._create_chart_response(chart, xLabel=xLabel, yLabel=yLabel, data={
            "dataList": heatmap_data,
            "xLabel": xLabel,
            "yLabel": yLabel,
            "max": max_value,
            "min": min_value,
        })

    async def _process_stacked_line(self, chart: ChartModel, df: pd.DataFrame):
        x_values = list(chart.xAxis)[0]
        y_values = list(chart.yAxis)
        df[x_values] = pd.Categorical(df[x_values], categories=df[x_values].unique())
        for col in y_values:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        stacked_line_data = []
        for y_value in y_values:
            grouped = df.groupby(x_values, observed=False)[y_value]
            if chart.option == "average":
                result = grouped.mean()
            elif chart.option == "sum":
                result = grouped.sum()
            elif chart.option == "min":
                result = grouped.min()
            elif chart.option == "max":
                result = grouped.max()
            else:
                raise ValueError(f"Invalid option: {chart.option}")
            stacked_line_data.append({
                "name": y_value,
                "type": "line",
                "stack": chart.option,
                "data": result.tolist()
            })

        xLabel = df[x_values].unique().tolist()
        yLabel = y_values

        return self._create_chart_response(chart, xLabel=xLabel, yLabel=yLabel, data={
            "dataList": stacked_line_data,
            "xLabel": xLabel,
            "yLabel": yLabel
        })

    async def _process_correlation(self, chart: ChartModel, df: pd.DataFrame):
        x_values = list(chart.xAxis)
        for col in x_values:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        corr_df = df[x_values]
        correlation_matrix = corr_df.corr(method=chart.option)
        rounded_matrix = correlation_matrix.round(2)
        rounded_matrix.replace([np.inf, -np.inf], np.nan, inplace=True)
        rounded_matrix.fillna(0, inplace=True)

        xLabel = rounded_matrix.columns.tolist()
        yLabel = rounded_matrix.index.tolist()
        dataList = [
            [i, j, rounded_matrix.iloc[i, j]]
            for i in range(len(rounded_matrix))
            for j in range(len(rounded_matrix.columns))
        ]
        max_value = rounded_matrix.values.max()
        min_value = rounded_matrix.values.min()

        return self._create_chart_response(chart, data={
            "dataList": dataList,
            "xLabel": xLabel,
            "yLabel": yLabel,
            "max": max_value,
            "min": min_value,
        })

    def _create_chart_response(self, chart: ChartModel, xLabel=None, yLabel=None, data=None):
        response = {
            "id": chart.id,
            "key": chart.key,
            "label": chart.label,
            "layout": chart.layout,
            "color":chart.color,
            "description": chart.description,
            "xAxis": chart.xAxis,
            "yAxis": chart.yAxis,
            "option": chart.option,
            "workspace_id": chart.workspace_id,
            "dataset_id": chart.dataset_id,
            "created_by": chart.created_by,
            "updated_by": chart.updated_by,
            "updated_at": chart.updated_at.isoformat() if chart.updated_at else None,
            "created_at": chart.created_at.isoformat() if chart.created_at else None,
        }
        if xLabel is not None:
            response["xLabel"] = xLabel
        if yLabel is not None:
            response["yLabel"] = yLabel
        if data is not None:
            response["data"] = data
        return response
    
    async def get_last_created_chart(self, workspace_id: int, dataset_id: int):
        last_chart = self._query_non_deleted_chart_last(
            workspace_id=workspace_id, dataset_id=dataset_id
        )
        if last_chart:
            dataset = self._query_non_deleted_dataset(id=dataset_id)
            df = self.b2_filemanager.read_file(dataset.data, 'csv')
            return await self.process_single_chart(last_chart, df)
        return None

    async def get_charts(self, workspace_id: int, dataset_id: int,LastOnly: Optional[bool] = False):
        if LastOnly:
            chart = await self.get_last_created_chart(workspace_id, dataset_id)
            if chart: 
                return {"chart": chart}  
            return {"message": "No charts found."}
        # async def stream_response():
        #     async for chart in self.process_charts(workspace_id, dataset_id):
        #         yield f"data: {json.dumps(chart)}\n\n"

        # return StreamingResponse(stream_response(), media_type="text/event-stream")
        charts = []
        async for chart in self.process_charts(workspace_id, dataset_id):
            charts.append(chart)
        #sort the final chart by created_at
        return {"charts": sorted(charts, key=lambda x: x['created_at'],reverse=True)}