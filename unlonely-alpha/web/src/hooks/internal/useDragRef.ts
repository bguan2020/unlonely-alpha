import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { MutableRefObject, useRef, useState } from "react";
import { STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT, STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET, STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET } from "../../components/layout/HomepageBooEventStream";

export const useDragRefs = ({
    containerRef,
    viewState,
}: {
    containerRef: MutableRefObject<HTMLElement | null>;
    viewState: "stream" | "token";
}) => {
    const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
    const dragOriginRef = useRef({ x: 0, y: 0 });
  
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 20,
        },
      })
    );
  
    const handleDragStart = () => {
      dragOriginRef.current = { ...draggablePosition };
    };
  
    const handleDrag = (x: number, y: number) => {
      if (viewState === "stream" && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const terminalWidth = STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT;
        const terminalHeight = STREAM_VIEW_JUPITER_TERMINAL_PIXEL_HEIGHT;
  
        const maxX = container.width - terminalWidth;
        const maxY = container.height - terminalHeight;
  
        // Calculate new position based on drag origin and current drag offset
        const newX = dragOriginRef.current.x + x;
        const newY = dragOriginRef.current.y + y;
  
        // Constrain the new position within the container boundaries
        const constrainedX = Math.max(
          STREAM_VIEW_JUPITER_TERMINAL_MIN_X_OFFSET * 3 - maxX,
          Math.min(newX, 0)
        );
        const constrainedY = Math.max(
          STREAM_VIEW_JUPITER_TERMINAL_MIN_Y_OFFSET * 2 - maxY,
          Math.min(newY, 0)
        );
  
        setDraggablePosition({ x: constrainedX, y: constrainedY });
      }
    };

    return {
        sensors,
        draggablePosition,
        handleDragStart,
        handleDrag,
    }
}