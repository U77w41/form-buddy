import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge: string;
  badgeClass: string;
  index?: number;
}

const ToolCard = ({ title, description, icon: Icon, href, badge, badgeClass, index = 0 }: ToolCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={href}
        className="group flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-card card-hover"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
            {badge}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
