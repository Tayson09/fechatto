'use client';

import { Badge } from '@/components/ui/badge';
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_COLORS } from '@/types/property';
import type { PropertyType } from '@prisma/client';

interface PropertyTypeBadgeProps {
  type: PropertyType;
  className?: string;
}

export function PropertyTypeBadge({ type, className }: PropertyTypeBadgeProps) {
  const colors = PROPERTY_TYPE_COLORS[type];
  
  return (
    <Badge className={`${colors} ${className ?? ''}`}>
      {PROPERTY_TYPE_LABELS[type]}
    </Badge>
  );
}