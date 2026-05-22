import { Line, LineChart, ResponsiveContainer } from "recharts";
import { replySparklineToChartData } from "@/lib/analytics";

type ReplySparklineProps = {
  values: number[];
};

export function ReplySparkline({ values }: ReplySparklineProps) {
  const data = replySparklineToChartData(values);
  if (data.length === 0) return null;

  return (
    <div className="h-6 w-20">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="replies"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
