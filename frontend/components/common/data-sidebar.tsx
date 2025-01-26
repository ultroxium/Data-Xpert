"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AreaChart,
  BotIcon,
  ChevronDown,
  ScatterChartIcon as ChartScatter,
  Cpu,
  Home,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  LineChartIcon as ChartLine,
  Sparkles,
} from "lucide-react"
import SearchParam from "@/lib/search-param"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const sidebarItems = [
  {
    tag: "General",
    items: [
      {
        title: "Overview",
        tab: "overview",
        icon: Home,
      },
      {
        title: "Visualize data",
        tab: "visualize",
        icon: AreaChart,
      },
    ],
  },
  {
    tag: "AI Feature",
    items: [
      {
        title: "Chat with AI",
        tab: "assistant",
        icon: MessageSquare,
      },
    ],
  },
  {
    tag: "Machine Learning",
    items: [
      {
        title: "Process Data",
        tab: "preprocess",
        icon: Cpu,
      },
      {
        title: "Train Data",
        tab: "train",
        icon: BotIcon,
        sub: [
          {
            title: "Regression",
            tab: "&category=Regression",
            icon: ChartLine,
          },
          {
            title: "Classification",
            tab: "&category=Classification",
            icon: ChartScatter,
          },
        ],
      },
      {
        title: "Make Prediction",
        tab: "predict",
        icon: Sparkles,
      },
    ],
  },
]

const Sidebar = () => {
  const tab = SearchParam("tab")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(sidebarItems.map((group) => group.tag))

  const toggleGroup = (tag: string) => {
    setOpenGroups((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <aside
      className={cn(
        "h-full flex flex-col justify-between border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <nav className="flex-grow p-4">
        <div className="flex items-center justify-between mb-6">
          <h2
            className={cn(
              "font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-opacity duration-300",
              isCollapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            Menu
          </h2>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <ul className="space-y-6">
          {sidebarItems.map((group) => (
            <li key={group.tag}>
              <Collapsible
                open={openGroups.includes(group.tag) && !isCollapsed}
                onOpenChange={() => !isCollapsed && toggleGroup(group.tag)}
              >
                <CollapsibleTrigger className="flex items-center w-full group">
                  <h3
                    className={cn(
                      "text-sm font-medium text-gray-400 dark:text-gray-500 mb-2 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300",
                      isCollapsed ? "opacity-0 w-0" : "opacity-100",
                    )}
                  >
                    {group.tag}
                  </h3>
                  {!isCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 ml-auto text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200",
                        openGroups.includes(group.tag) ? "transform rotate-180" : "",
                      )}
                    />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="space-y-1 mt-1">
                    {group.items.map((item) => (
                      <li key={item.tab}>
                        <Link
                          href={`?tab=${item.tab}`}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out",
                            tab === item.tab
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                          )}
                        >
                          <span
                            className={cn(
                              item.tab === "assistant" &&
                                "bg-lime-600 text-white w-8 h-8 flex items-center justify-center rounded-lg",
                              isCollapsed ? "mr-0" : "mr-3",
                            )}
                          >
                            <item.icon size={16} className={cn("flex-shrink-0")} />
                          </span>
                          <span
                            className={cn(
                              "transition-opacity duration-300",
                              isCollapsed ? "opacity-0 w-0" : "opacity-100",
                            )}
                          >
                            {item.title}
                          </span>
                        </Link>
                        {item.sub && !isCollapsed && (
                          <ul className="ml-6 mt-1 space-y-1 border-l border-lime-600 dark:border-lime-400">
                            {item.sub.map((subItem) => (
                              <li key={subItem.tab}>
                                <Link
                                  href={`?tab=${item.tab}${subItem.tab}`}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out",
                                    tab === `${item.tab}${subItem.tab}`
                                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200",
                                  )}
                                >
                                  <subItem.icon size={12} className="mr-2" />
                                  {subItem.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

