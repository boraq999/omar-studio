import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // For action buttons like "Add New"
}

const PageHeaderComponent = ({ title, description, children }: PageHeaderProps) => {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-primary">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
};

export const PageHeader = React.memo(PageHeaderComponent);
