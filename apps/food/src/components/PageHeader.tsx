import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, IconButton } from "@portfolio/ui";

export function PageHeader({
  title,
  subtitle,
  backTo,
}: {
  title: string;
  subtitle?: string;
  backTo: string;
}) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-4 px-6 pt-6">
      <IconButton aria-label="Back" onClick={() => navigate(backTo)}>
        <ArrowLeftIcon size={20} />
      </IconButton>
      <div className="min-w-0">
        <h1 className="truncate text-xl leading-6 font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
