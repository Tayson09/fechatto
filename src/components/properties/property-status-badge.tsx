'use client';

import { Badge } from '@/components/ui/badge';
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS } from '@/types/property';
import type { PropertyStatus } from '@prisma/client';

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
  className?: string;
}

export function PropertyStatusBadge({ status, className }: PropertyStatusBadgeProps) {
  const colors = PROPERTY_STATUS_COLORS[status];
  
  return (
    <Badge className={`${colors} ${className ?? ''}`}>
      {PROPERTY_STATUS_LABELS[status]}
    </Badge>
  );
}