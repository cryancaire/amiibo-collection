import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "../../lib/utils";
import { useTheme } from "../../contexts/ThemeContext";

export function AmiiboCard({
  title,
  description,
  content,
  width = "320px",
  height = "auto",
  className = "",
  borderRadius = "10px",
}) {
  const { colors } = useTheme();
  
  return (
    <Card
      className={cn("border-dashed p-1", className)}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        padding: "10px",
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: colors.text.primary }}>{title}</CardTitle>
        <hr 
          className="border-dashed my-2 mx-4" 
          style={{ borderColor: colors.border }}
        />
        <CardDescription style={{ color: colors.text.secondary }}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-3 items-center">
          <img
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=48&h=48&fit=crop&crop=center"
            alt="Amiibo placeholder"
            className="w-12 h-12 rounded object-cover col-span-2"
          />
          <p 
            className="text-sm col-span-10"
            style={{ color: colors.text.secondary }}
          >
            {content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
