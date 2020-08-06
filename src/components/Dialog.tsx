import React from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ children, open, onClose }) => {
  if (!open) {
    return null;
  }
  return (
    <div className="dialog">
      <div className="dialog-background" onClick={onClose}></div>
      <div className="dialog-box">{children}</div>
    </div>
  );
};

export default Dialog;
