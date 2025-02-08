import { Step } from "react-joyride";

export const steps: Step[] = [
  {
    target: ".step-1",
    content: "Welcome to DataXpert! Let’s take a quick tour to help you get started.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: ".step-2",
    content: "You can switch between workspaces here.",
  },
  {
    target: ".step-3",
    content: "This is data upload progress bar. You can see the progress of your data upload here.",
  },
  {
    target:".step-4",
    content: "This is the main dashboard where you can view all your datasets.",
    placement: "center",
  },
  {
    target: ".step-5",
    content: "You can upload your csv datasets here.",
  },
  {
    target: ".step-6",
    content: "You can fetch data from any API here.",
  },
  {
    target: ".step-7",
    content: "Click here to view the details of the dataset.",
  }
];
