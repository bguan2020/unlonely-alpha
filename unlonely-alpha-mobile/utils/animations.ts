export const fadeInScale: any = {
  from: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  transition: {
    scale: {
      type: 'spring',
      stiffness: 750,
      mass: 0.75,
    },
    opacity: {
      type: 'timing',
      duration: 150,
    },
  },
};
