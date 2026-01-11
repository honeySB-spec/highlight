import React from 'react';
import { ProcessingStatus } from '../types';
import { Loader2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface StatusCardProps {
  status: ProcessingStatus;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  if (status.step === 'idle') return null;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {status.step === 'complete' ? (
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          ) : status.step === 'error' ? (
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          ) : (
            <div className="p-2 bg-indigo-100 rounded-full">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-slate-900">
              {status.step === 'extracting' && 'Reading Document...'}
              {status.step === 'analyzing' && 'AI Analysis in Progress...'}
              {status.step === 'highlighting' && 'Applying Highlights...'}
              {status.step === 'complete' && 'Ready!'}
              {status.step === 'error' && 'Something went wrong'}
            </h3>
            {status.progress !== undefined && status.step !== 'complete' && status.step !== 'error' && (
              <span className="text-sm font-medium text-indigo-600">{status.progress}%</span>
            )}
          </div>
          
          <p className="text-sm text-slate-500 mb-4">
            {status.message}
          </p>

          {status.step !== 'complete' && status.step !== 'error' && (
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}
          
          {status.step === 'analyzing' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span>Gemini is identifying key concepts in your notes</span>
            </div>
          )}

          {status.step === 'error' && status.errorDetails && (
             <div className="mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
               {status.errorDetails}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};