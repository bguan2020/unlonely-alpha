import { useEffect } from "react";

export const useBlastRainAnimation = (
  parentId: string,
  childClass: string,
  config?: {
    vertSpeed?: number;
    horiSpeed?: number;
  }
) => {
  useEffect(() => {
    const parent = document.getElementById(parentId);
    if (!parent) return;

    const elements = parent.getElementsByClassName(childClass);
    const vertSpeed = config?.vertSpeed ?? 3;
    const horiSpeed = config?.horiSpeed ?? 1;

    const height = parent.clientHeight;
    const width = parent.clientWidth;

    const items: any[] = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const elementWidth = 24;
      const elementHeight = element.clientHeight;

      element.style.position = "absolute";

      const item = {
        element: element,
        elementHeight,
        elementWidth,
        ySpeed: -vertSpeed,
        omega: (2 * Math.PI * horiSpeed) / (width * 60),
        random: (Math.random() / 2 + 0.5) * i * 10000,
        x: function (time: number) {
          return (
            ((Math.sin(this.omega * (time + this.random)) + 1) / 2) *
            (width - elementWidth)
          );
        },
        y: height + (Math.random() + 1) * i * elementHeight,
      };
      items.push(item);
    }

    let counter = 0;
    let animationId: number;

    const animationStep = () => {
      const time = +new Date();
      const check = counter % 10 === 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const transformString = `translate3d(${item.x(time)}px, ${
          item.y
        }px, 0px)`;
        item.element.style.transform = transformString;
        item.element.style.webkitTransform = transformString;

        item.y += item.ySpeed;
        if (check && item.y < -item.elementHeight) {
          item.y = height;
        }
      }

      counter %= 10;
      counter++;
      animationId = requestAnimationFrame(animationStep);
    };

    animationId = requestAnimationFrame(animationStep);

    return () => cancelAnimationFrame(animationId); // Cleanup function
  }, []);
};
