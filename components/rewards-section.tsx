"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Reward {
  asset: string
  collateral: string
  dailyRewards: string
  apr: string
  campaignStart: string
  campaignEnd: string
  action: string
}

interface RewardsSectionProps {
  currentRewards: Reward[]
  historicalRewards: Reward[]
}

export function RewardsSection({ currentRewards, historicalRewards }: RewardsSectionProps) {
  const [activeTab, setActiveTab] = useState("current")

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Rewards via Merkl</h2>
      </div>
      <p className="text-slate-400 mb-4">
        Reward campaigns set up using Merkl. Effortlessly earn competitive returns and access attractive opportunities.
        <a href="#" className="text-blue-400 hover:underline ml-1">
          Read more
        </a>
      </p>

      <Tabs defaultValue="current" onValueChange={setActiveTab}>
        <div className="flex space-x-2 mb-4">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="current" className="data-[state=active]:bg-slate-600">
              Current rewards
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-1 w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                      ?
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Active reward campaigns for this market</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            <TabsTrigger value="historical" className="data-[state=active]:bg-slate-600">
              Historical rewards
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-1 w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                      ?
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Past reward campaigns for this market</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Collateral</th>
                  <th className="pb-3 font-medium">Daily rewards</th>
                  <th className="pb-3 font-medium">APR</th>
                  <th className="pb-3 font-medium">Campaign start</th>
                  <th className="pb-3 font-medium">Campaign end</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRewards.map((reward, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-2">
                          R
                        </div>
                        {reward.asset}
                      </div>
                    </td>
                    <td className="py-4">{reward.collateral}</td>
                    <td className="py-4">{reward.dailyRewards}</td>
                    <td className="py-4">{reward.apr}</td>
                    <td className="py-4">{reward.campaignStart}</td>
                    <td className="py-4">{reward.campaignEnd}</td>
                    <td className="py-4">
                      <Button size="sm" variant="outline">
                        {reward.action}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="historical">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Collateral</th>
                  <th className="pb-3 font-medium">Daily rewards</th>
                  <th className="pb-3 font-medium">APR</th>
                  <th className="pb-3 font-medium">Campaign start</th>
                  <th className="pb-3 font-medium">Campaign end</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {historicalRewards.map((reward, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-2">
                          R
                        </div>
                        {reward.asset}
                      </div>
                    </td>
                    <td className="py-4">{reward.collateral}</td>
                    <td className="py-4">{reward.dailyRewards}</td>
                    <td className="py-4">{reward.apr}</td>
                    <td className="py-4">{reward.campaignStart}</td>
                    <td className="py-4">{reward.campaignEnd}</td>
                    <td className="py-4">
                      <Button size="sm" variant="outline">
                        {reward.action}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

