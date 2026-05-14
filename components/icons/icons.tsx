
import React from 'react';

const MaterialIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={`material-symbols-outlined align-middle ${className}`}>{name}</span>
);

export const MessageCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="chat" className={className} />
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="close" className={className} />
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="send" className={className} />
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="screen_share" className={className} />
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="stop" className={className} />
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="open_in_full" className={className} />
);

export const ContractIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="close_fullscreen" className={className} />
);

export const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="mic" className={className} />
);

export const MicOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="mic_off" className={className} />
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="content_copy" className={className} />
);

export const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="text_fields" className={className} />
);

export const AudioIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="graphic_eq" className={className} />
);

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="settings" className={className} />
);

export const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MaterialIcon name="warning" className={className} />
);
