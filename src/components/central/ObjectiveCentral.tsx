import React from 'react';
import IntegratedApp from '../objectives_new/App';

interface ObjectiveCentralProps {
  objectiveId: string;
  onClose: () => void;
  initialView?: 'dashboard' | 'manager' | 'manifestation' | 'goals-overview';
  initialOpenMetaBuilder?: boolean;
  initialOpenTaskBuilder?: boolean;
  initialMetaId?: string;
}

export const ObjectiveCentral: React.FC<ObjectiveCentralProps> = ({ 
  objectiveId, 
  onClose,
  initialView,
  initialOpenMetaBuilder,
  initialOpenTaskBuilder,
  initialMetaId
}) => {
  return (
    <div className="fixed inset-0 z-[999] bg-neutral-black overflow-y-auto overflow-x-hidden">
      <IntegratedApp 
        initialObjectiveId={objectiveId === 'new' ? undefined : objectiveId}
        initialView={objectiveId === 'new' ? 'manager' : (initialView || 'dashboard')}
        initialOpenMetaBuilder={initialOpenMetaBuilder}
        initialOpenTaskBuilder={initialOpenTaskBuilder}
        initialMetaId={initialMetaId}
        onClose={onClose}
      />
    </div>
  );
};
