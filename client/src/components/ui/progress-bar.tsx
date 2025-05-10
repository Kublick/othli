import { cn } from "@/lib/utils";

export type ProgressSegment = {
  value: number;
  color: string;
  pattern?: "solid" | "striped" | "dotted";
  label?: string;
};

export type ProgressBarProps = {
  segments?: ProgressSegment[];
  value?: number;
  max: number;
  height?: number;
  label?: string;
  labelPosition?: "left" | "right";
  valueDisplay?: "currency" | "percentage" | "value" | "none";
  currencyCode?: string;
  className?: string;
  backgroundColor?: string;
  color?: string;
  showMax?: boolean;
  maxSeparator?: string;
};

export function ProgressBar({
  segments,
  value,
  max,
  height = 40,
  label,
  labelPosition = "left",
  valueDisplay = "currency",
  currencyCode = "MX$",
  className,
  backgroundColor = "#333",
  color = "#26B99A",
  showMax = false,
  maxSeparator = "/",
}: ProgressBarProps) {
  const formatValue = (val: number) => {
    if (valueDisplay === "currency") {
      return `${currencyCode}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (valueDisplay === "percentage") {
      return `${Math.round((val / max) * 100)}%`;
    } else if (valueDisplay === "value") {
      return val.toLocaleString("en-US");
    }
    return "";
  };

  const renderSegments = () => {
    if (!segments || segments.length === 0) {
      // Single segment progress bar
      const percentage = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
      return (
        <div
          className="h-full rounded-md transition-all duration-300 ease-in-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      );
    }

    // Calculate total value of all segments
    const totalValue = segments.reduce(
      (sum, segment) => sum + segment.value,
      0
    );

    // Multi-segment progress bar
    return segments.map((segment, index) => {
      const percentage = (segment.value / max) * 100;

      let patternStyle = {};
      if (segment.pattern === "striped") {
        patternStyle = {
          backgroundImage: `linear-gradient(45deg, ${segment.color} 25%, transparent 25%, transparent 50%, ${segment.color} 50%, ${segment.color} 75%, transparent 75%, transparent)`,
          backgroundSize: `${height}px ${height}px`,
        };
      } else if (segment.pattern === "dotted") {
        patternStyle = {
          backgroundImage: `radial-gradient(circle, ${segment.color} 30%, transparent 30%)`,
          backgroundSize: `${height / 2}px ${height / 2}px`,
        };
      }

      return (
        <div
          key={index}
          className="h-full transition-all duration-300 ease-in-out first:rounded-l-md last:rounded-r-md"
          style={{
            width: `${percentage}%`,
            backgroundColor: segment.pattern ? "transparent" : segment.color,
            ...patternStyle,
          }}
          title={segment.label}
        />
      );
    });
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center">
        {labelPosition === "left" && label && (
          <div className="font-bold text-lg text-yellow-500">{label}</div>
        )}
        <div
          className={cn(
            "font-mono text-lg",
            labelPosition === "left" ? "ml-auto" : "mr-auto"
          )}
        >
          {value !== undefined && valueDisplay !== "none" && (
            <>
              <span className="text-green-400">{formatValue(value)}</span>
              {showMax && (
                <>
                  <span className="mx-2 text-gray-400">{maxSeparator}</span>
                  <span className="text-gray-400">{formatValue(max)}</span>
                </>
              )}
            </>
          )}
        </div>
        {labelPosition === "right" && label && (
          <div className="font-bold text-lg text-yellow-500">{label}</div>
        )}
      </div>

      <div
        className="w-full rounded-md overflow-hidden flex"
        style={{
          height: `${height}px`,
          backgroundColor: backgroundColor,
        }}
      >
        {renderSegments()}
      </div>
    </div>
  );
}
