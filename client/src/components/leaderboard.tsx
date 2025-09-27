import BalloonIcon from "./balloon-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "./css/leaderboard.css";
import { Button } from "./ui/button";

interface LeaderBoardProps {
  balloons: [number, number][];
  mode: "dist" | "alt";
  selectBalloonByIndex: (index: number) => void;
}

export default function LeaderBoard({
  balloons,
  mode,
  selectBalloonByIndex,
}: LeaderBoardProps) {
  if (balloons.length < 3) {
    return <p style={{ color: "white" }}>Loading leaderboard...</p>;
  }
  return (
    <div className="leaderboard-wrapper">
      <div className="podium">
        <div className="podium-step second">
          <BalloonIcon size={180} index={balloons[1][0]} color="#4a90e2" />
          <div className="podium-block"></div>
        </div>
        <div className="podium-step first">
          <BalloonIcon size={180} index={balloons[0][0]} color="#ff5a5f" />
          <div className="podium-block"></div>
        </div>
        <div className="podium-step third">
          <BalloonIcon size={180} index={balloons[2][0]} color="#7ed321" />
          <div className="podium-block"></div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>
              {mode === "dist" ? "Total Distance" : "Max Altitude"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balloons.slice(0, 10).map((d, i) => {
            const id = d[0];
            let stat;
            if (mode === "dist") {
              stat = (d[1] / 1000).toFixed(0);
            } else {
              stat = d[1].toFixed(6);
            }
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">{i + 1}</TableCell>
                <TableCell>{id}</TableCell>
                <TableCell>{stat} km</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => {
                      selectBalloonByIndex(id);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
