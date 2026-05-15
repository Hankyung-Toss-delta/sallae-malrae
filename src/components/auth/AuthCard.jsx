import Card from "@/components/ui/Card";

export default function AuthCard({ children, className = "" }) {
  return (
    <Card className={`w-full max-w-md p-8 ${className}`}>
      {children}
    </Card>
  );
}
