"use client";
import MultiSelector from "@/components/common/MultiSelector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartsList,
  ExcludeChartListForSingleColumnChart,
  ExcludeXaxisForMultiColumnChart,
} from "@/config/chart";
import { useDatasetStoreNew } from "@/store/datasets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ChevronRight, CirclePlus, LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { ChartSelector } from "../ChartSelector";
import useLocalStorageListener from "@/hooks/localstorage-listener";
import { UsedDatasetType } from "@/constant/common-constant";

export function ManualChartCreation({
  workspaceId,
  datasetId,
}: {
  workspaceId?: string;
  datasetId?: string;
}) {
  const { columnDetails }: any = useDatasetStoreNew();

  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  const chartDatasetType = localStorage.getItem("chartDatasetType");
  console.log("chartDatasetType", chartDatasetType);

  const postChartsData = async (
    workspaceId: string,
    datasetId: string,
    data: any
  ) => {
    const response = await axios.post(
      `/datasets/api/${workspaceId}/${datasetId}/charts?type=create`,
      data
    );
    return response.data;
  };

  const addChartMutation = useMutation({
    mutationFn: ({
      workspaceId,
      datasetId,
      data,
    }: {
      workspaceId: string;
      datasetId: string;
      data: any;
    }) => postChartsData(workspaceId, datasetId, data),

    onSuccess: () => {
      if (workspaceId && datasetId) {
        queryClient.invalidateQueries({
          queryKey: ["charts", workspaceId, datasetId],
        });
      }
      toast.success("Chart created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    },
  });

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    option: Yup.string().required("Option is required"),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const checkType = (selectedData: string) => {
    const field =
      chartDatasetType === UsedDatasetType.RAW
        ? columnDetails?.unprocessed?.find(
            (item: any) => item.name === selectedData
          )
        : columnDetails?.processed?.find(
            (item: any) => item.name === selectedData
          );
    if (field?.type === "number") {
      return true;
    }
    return false;
  };

  return (
    <Formik
      initialValues={{
        title: "",
        comment: "",
        column: "",
        key: "",
        option: "",
        isSingle: false,
        xAxis: [],
        yAxis: [],
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const Success = await addChartMutation.mutateAsync({
          workspaceId,
          datasetId,
          data: {
            key: values.key,
            label: values.title,
            description: values.comment,
            option: values.option,
            column: values.column,
            xAxis: values.xAxis,
            yAxis: values.yAxis,
            dtype: localStorage.getItem("chartDatasetType"),
          },
        });
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="flex flex-col gap-6 w-full ">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="title"
              className="text-xs uppercase text-muted-foreground"
            >
              Chart Title
            </Label>
            <Field
              as={Input}
              id="title"
              name="title"
              placeholder="Enter title"
            />
            <ErrorMessage
              name="title"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSingle"
              checked={values.isSingle}
              onCheckedChange={() => {
                setFieldValue("column", "");
                setFieldValue("xAxis", []);
                setFieldValue("yAxis", []);
                setFieldValue("isSingle", !values.isSingle);
              }}
            />
            <label
              htmlFor="isSingle"
              className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs text-muted-foreground"
            >
              Is Single Column?
            </label>
          </div>
          {values.isSingle ? (
            <>
              <div className="w-full flex flex-col gap-2">
                <Label
                  htmlFor="Column"
                  className="text-xs uppercase text-muted-foreground"
                >
                  Select Column
                </Label>
                <MultiSelector
                  options={
                    chartDatasetType === UsedDatasetType.RAW
                      ? columnDetails?.unprocessed?.map((col: any) => col.name)
                      : columnDetails?.processed?.map((col: any) => col.name)
                  }
                  isMultiple={false}
                  onSelected={(values) => {
                    setFieldValue("column", values[0]);
                    setFieldValue("option", "");
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="chartType"
                  className="text-xs uppercase text-muted-foreground"
                >
                  Chart Type
                </Label>
                <Select
                  onValueChange={(value) => {
                    setFieldValue("key", value);
                    setFieldValue("option", "");
                  }}
                  value={values.key}
                >
                  <SelectTrigger id="chartType">
                    <SelectValue placeholder="Select chart" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ChartsList.filter(
                      (item) =>
                        !ExcludeChartListForSingleColumnChart.includes(item.key)
                    ).map((chart) => (
                      <SelectItem key={chart.id} value={chart.key}>
                        {chart.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ChartsList?.filter((chart) => values.key === chart.key)?.map(
                (chart) => (
                  <div className="w-full" key={chart.id}>
                    <Label
                      htmlFor="option"
                      className="text-xs uppercase text-muted-foreground"
                    >
                      Plot Options
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setFieldValue("option", value);
                      }}
                      value={values.option}
                    >
                      <SelectTrigger id="option">
                        <SelectValue placeholder="Select Plot Option" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {checkType(values.column)
                          ? chart.list
                              .filter((calc) => calc !== "per-hundredths")
                              .map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={option}
                                  className="uppercase"
                                >
                                  {option}
                                </SelectItem>
                              ))
                          : chart.list
                              .filter((calc) => calc === "count")
                              .map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={option}
                                  className="uppercase"
                                >
                                  {option}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                    <ErrorMessage
                      name="option"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                )
              )}
            </>
          ) : (
            <>
              <div>
                {/* <div className="mb-4 flex flex-col gap-2">
                                                <Label htmlFor="chartType">Chart Type</Label>
                                                <Select
                                                    onValueChange={(value) => {
                                                        setFieldValue('key', value);
                                                        setFieldValue('option', '');
                                                    }}
                                                    value={values.key}>
                                                    <SelectTrigger id="chartType">
                                                        <SelectValue placeholder="Select chart" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        {ChartsList.map((chart) => (
                                                            <SelectItem key={chart.id} value={chart.key}>
                                                                {chart.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div> */}
                <ChartSelector setFieldValue={setFieldValue} values={values} />
                <div className="flex flex-col mb-4">
                  <Label
                    htmlFor="xAxisData"
                    className="text-xs uppercase text-muted-foreground"
                  >
                    {values.key === "correlation"
                      ? "Select Numeric Columns"
                      : "X-Axis"}
                  </Label>
                  <MultiSelector
                    options={
                      ExcludeXaxisForMultiColumnChart.includes(values.key)
                        ? chartDatasetType === UsedDatasetType.RAW
                          ? columnDetails?.unprocessed
                              ?.filter((c) => c.type === "number")
                              .map((col: any) => col.name)
                          : columnDetails?.processed
                              ?.filter((c) => c.type === "number")
                              .map((col: any) => col.name)
                        : chartDatasetType === UsedDatasetType.RAW
                        ? columnDetails?.unprocessed?.map(
                            (col: any) => col.name
                          )
                        : columnDetails?.processed?.map((col: any) => col.name)
                    }
                    isMultiple={values.key === "correlation"}
                    onSelected={(values) => {
                      setFieldValue("xAxis", values);
                    }}
                  />
                </div>
                {values.key !== "correlation" && (
                  <div className="flex flex-col">
                    <Label
                      htmlFor="yAxisData"
                      className="text-xs uppercase text-muted-foreground"
                    >
                      Y-Axis
                    </Label>
                    <MultiSelector
                      options={(chartDatasetType === UsedDatasetType.RAW
                        ? columnDetails?.unprocessed
                        : columnDetails?.processed
                      )
                        ?.filter((c) => c.type === "number")
                        .map((col: any) => col.name)}
                      isMultiple={true}
                      onSelected={(values) => {
                        setFieldValue("yAxis", values);
                      }}
                    />
                  </div>
                )}

                {ChartsList?.filter((chart) => values.key === chart.key)?.map(
                  (chart) => (
                    <div className="w-full mt-4" key={chart.id}>
                      <Label
                        htmlFor="option"
                        className="text-xs uppercase text-muted-foreground"
                      >
                        Plot Options
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          setFieldValue("option", value);
                        }}
                        value={values.option}
                      >
                        <SelectTrigger id="option">
                          <SelectValue placeholder="Select Plot Option" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {checkType(values.yAxis[0]) &&
                          checkType(values.xAxis[0])
                            ? chart.list
                                .filter(
                                  (c) =>
                                    (c !== "count" &&
                                      c !== "distribution" &&
                                      c === "scatter") ||
                                    c === "per-hundredths"
                                )
                                .map((option, index) => (
                                  <SelectItem
                                    key={index}
                                    value={option}
                                    className="uppercase"
                                  >
                                    {option}
                                  </SelectItem>
                                ))
                            : checkType(values.yAxis[0])
                            ? chart.list
                                .filter(
                                  (c) =>
                                    c !== "count" &&
                                    c !== "distribution" &&
                                    c !== "per-hundredths" &&
                                    c !== "scatter"
                                )
                                .map((option, index) => (
                                  <SelectItem
                                    key={index}
                                    value={option}
                                    className="uppercase"
                                  >
                                    {option}
                                  </SelectItem>
                                ))
                            : chart.list.map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={option}
                                  className="uppercase"
                                >
                                  {option}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="option"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  )
                )}
                <div className="flex flex-col gap-2 mt-4">
                  <Label
                    htmlFor="comment"
                    className="text-xs uppercase text-muted-foreground"
                  >
                    Comments (optional)
                  </Label>
                  <Field
                    as={Textarea}
                    id="comment"
                    name="comment"
                    className="resize-none"
                    rows={3}
                    placeholder="Enter comments"
                  />
                </div>
              </div>
            </>
          )}

          <Button variant="default" type="submit" className="w-fit">
            {addChartMutation.isPending ? (
              <div className="flex items-center gap-1">
                <LoaderCircle className="animate-spin" size={16} /> Creating
              </div>
            ) : (
              "Create"
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
