"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLeaderboard } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { shortenAddress, formatNumber } from "@/lib/utils";

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const { address } = useAccount();
  const { leaderboard, fetchLeaderboard, loading, error } = useLeaderboard();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard(50);
  }, [fetchLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(50);
    setRefreshing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🏆</span> Leaderboard
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "..." : "↻"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {loading && !leaderboard.length ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No players yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isCurrentUser =
                  entry.address.toLowerCase() === address?.toLowerCase();
                const rankEmoji =
                  entry.rank === 1
                    ? "🥇"
                    : entry.rank === 2
                    ? "🥈"
                    : entry.rank === 3
                    ? "🥉"
                    : `#${entry.rank}`;

                return (
                  <div
                    key={entry.address}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrentUser
                        ? "bg-solar-100 border-2 border-solar-400"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-bold w-8 ${
                          entry.rank <= 3 ? "text-2xl" : "text-gray-500"
                        }`}
                      >
                        {rankEmoji}
                      </span>
                      <div>
                        <div className="font-medium">
                          {entry.townName}
                          {isCurrentUser && (
                            <span className="text-solar-500 ml-1">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {shortenAddress(entry.address)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-solar-600">
                        {formatNumber(entry.developmentScore)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ⚡ {formatNumber(entry.totalSolarCapacity)} kW
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
