"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Grid, Type, Eye, Download, Link, Search } from 'lucide-react'
import { useChartConfigHook } from "@/hooks/use-chart-config"
import { Input } from "@/components/ui/input"

export function BeautifulChartRibbon() {
    const { gridOn, setGridOn, borderOn, setBorderOn, shadowOn, setShadowOn } = useChartConfigHook();
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="p-4">
            <div className="w-full flex items-center justify-between">
            <div className="relative flex items-center ">
              <Search size={16} className="absolute left-3" />
              <Input
                type="text"
                className="pl-10 pr-4 py-1 w-full border rounded-md focus:outline-none focus:border-transparent font-normal"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
                <div className="flex flex-wrap items-center justify-end gap-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="grid-toggle"
                            checked={gridOn}
                            onCheckedChange={setGridOn}
                        />
                        <Label htmlFor="grid-toggle" className="cursor-pointer">
                            Grid
                        </Label>
                    </div>

                    {/* border toggle */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="border-toggle"
                            checked={borderOn}
                            onCheckedChange={() => {
                                setBorderOn(!borderOn)
                            }}
                        />
                        <Label htmlFor="border-toggle" className="cursor-pointer">
                            Border
                        </Label>
                    </div>

                    {/* shadow toggle */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="shadow-toggle"
                            checked={shadowOn}
                            onCheckedChange={() => {
                                setShadowOn(!shadowOn)
                            }}
                        />
                        <Label htmlFor="shadow-toggle" className="cursor-pointer">
                            Shadow
                        </Label>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                    >
                        <Link className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>
        </div>
    )
}

