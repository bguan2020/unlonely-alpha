import React from "react";
import { useDraggable } from "@dnd-kit/core";

function Draggable({
  id,
  children,
  onDrag,
  dragHandleClassName,
  ...props
}: {
  id: string;
  children: React.ReactNode;
  onDrag: (x: number, y: number) => void;
  dragHandleClassName: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  React.useEffect(() => {
    if (transform) {
      onDrag(transform.x, transform.y);
    }
  }, [transform, onDrag]);

  return (
    <div ref={setNodeRef} {...props}>
      <div className={dragHandleClassName} {...attributes} {...listeners}>
        {children}
      </div>
    </div>
  );
}

export default Draggable;
