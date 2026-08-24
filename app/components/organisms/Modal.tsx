import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="h-full max-h-[500px] relative bg-white w-full max-w-[500px] rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col">
        {children}
      </div>
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
    </div>
  );
};