import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import BalloonIcon from "./balloon-icon";
import SortIcon from "./sort-icon";
import "./css/leaderboard.css";

interface LeaderBoardProps {
  distances: Record<number, number>;
  maxAltitudes: Record<number, number>;
  selectBalloonByIndex: (index: number) => void;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LeaderBoard({
  distances,
  maxAltitudes,
  selectBalloonByIndex,
  playing,
  setPlaying,
}: LeaderBoardProps) {
  const [mode, setMode] = useState("dist");
  const [entries, setEntries] = useState(20);
  const [ascending, setAscending] = useState(false);

  const sortedDistances = Object.entries(distances)
    .map(([idx, dist]) => [Number(idx), dist] as [number, number])
    .sort((a, b) => (ascending ? a[1] - b[1] : b[1] - a[1]));

  const sortedAlts = Object.entries(maxAltitudes)
    .map(([idx, alt]) => [Number(idx), alt] as [number, number])
    .sort((a, b) => (ascending ? a[1] - b[1] : b[1] - a[1]));

  let balloons = mode === "dist" ? sortedDistances : sortedAlts;

  function loadEntries() {
    if (playing) {
      setPlaying(false);
    }
    if (entries < 500) {
      setEntries((prev) => prev + 20);
    }
  }

  useEffect(() => {
    if (!playing) return;
    setEntries(20);
  }, [playing]);

  return (
    <div className="leaderboard-wrapper">
      <div className="podium">
        <div className="podium-step second">
          <BalloonIcon
            size={180}
            index={balloons[1] ? balloons[1][0] : null}
            color="#4a90e2"
          />
          <div className="podium-block"></div>
        </div>
        <div className="podium-step first">
          <BalloonIcon
            size={180}
            index={balloons[0] ? balloons[0][0] : null}
            color="#ff5a5f"
          />
          <div className="podium-block"></div>
        </div>
        <div className="podium-step third">
          <BalloonIcon
            size={180}
            index={balloons[2] ? balloons[2][0] : null}
            color="#7ed321"
          />
          <div className="podium-block"></div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>
              <div className="leaderboard-filter">
                <Select
                  value={mode}
                  onValueChange={(value) => {
                    setMode(value);
                    setEntries(20);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dist">Total Distance</SelectItem>
                    <SelectItem value="alt">Max Altitude</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAscending((prev) => !prev);
                    setEntries(20);
                  }}
                >
                  <SortIcon />
                </Button>
              </div>
            </TableHead>
            <TableHead></TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balloons.length > 3
            ? balloons.slice(0, entries).map((d, i) => {
                let rank = ascending ? 1000 - i : i + 1;
                const id = d[0];
                let stat;
                if (mode === "dist") {
                  stat = (d[1] / 1000).toFixed(0);
                } else {
                  stat = d[1].toFixed(6);
                }
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{rank}</TableCell>
                    <TableCell>{id}</TableCell>
                    <TableCell>{stat} km</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          selectBalloonByIndex(id);
                          window.scrollTo({
                            top: 100,
                            behavior: "smooth",
                          });
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            : Array.from({ length: 20 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="font-medium">
                    <Skeleton className="h-[10px] w-[30px] rounded-full" />
                  </TableCell>
                  <TableCell className="skeleton">
                    <Skeleton className="h-[10px] w-[30px] rounded-full" />
                  </TableCell>
                  <TableCell className="skeleton">
                    <Skeleton className="h-[10px] w-[180px] rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <div className="entries-controls">
        {entries > 20 && <Button onClick={() => setEntries(20)}>Hide</Button>}
        {balloons.length > 3 && entries < 500 && (
          <Button onClick={loadEntries}>Load More</Button>
        )}
      </div>
    </div>
  );
}
