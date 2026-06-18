import { motion } from 'motion/react';
import { Card, Badge } from '@/design-system/components';
import { MapPin, Calendar, Wallet, Trash2, ExternalLink, User } from 'lucide-react';
import { formatRelative } from '@/shared/utils/dates';
import clsx from 'clsx';

const statusConfig = {
  SAVED: { color: 'default', label: 'Saved' },
  APPLIED: { color: 'info', label: 'Applied' },
  PHONE_SCREEN: { color: 'accent', label: 'Phone Screen' },
  INTERVIEW: { color: 'warning', label: 'Interview' },
  OFFER: { color: 'success', label: 'Offer 🎉' },
  REJECTED: { color: 'danger', label: 'Rejected' },
  WITHDRAWN: { color: 'default', label: 'Withdrawn' },
};

export function JobCard({ job, onDelete, onStatusChange }) {
  const status = statusConfig[job.status] || statusConfig.SAVED;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="group">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white truncate">{job.role}</h3>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-accent transition-colors shrink-0">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{job.company}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={status.color} size="sm">{status.label}</Badge>
            <button onClick={() => onDelete?.(job.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-600 hover:text-danger transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[10px] text-zinc-500">
          {job.location && (
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
          )}
          {job.salary && (
            <span className="flex items-center gap-0.5"><Wallet className="w-3 h-3" />{job.salary}</span>
          )}
          {job.appliedDate && (
            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />Applied {formatRelative(job.appliedDate)}</span>
          )}
          {job.contactName && (
            <span className="flex items-center gap-0.5"><User className="w-3 h-3" />{job.contactName}</span>
          )}
        </div>

        {job.notes && (
          <p className="text-xs text-zinc-500 mt-2.5 pt-2 border-t border-white/[0.04] line-clamp-2">{job.notes}</p>
        )}

        {/* Status pipeline indicator */}
        <div className="flex gap-0.5 mt-3">
          {['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER'].map((s, i) => {
            const stages = ['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER'];
            const currentIdx = stages.indexOf(job.status);
            const isRejected = job.status === 'REJECTED' || job.status === 'WITHDRAWN';
            const isActive = !isRejected && i <= currentIdx;
            return (
              <div key={s} className={clsx(
                'h-1 flex-1 rounded-full transition-all',
                isActive ? 'bg-accent' : isRejected && i <= 1 ? 'bg-danger/30' : 'bg-zinc-800'
              )} />
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
