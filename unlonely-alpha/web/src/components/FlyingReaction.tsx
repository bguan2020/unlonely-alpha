import styles from "./FlyingReaction.module.css";

type Props = {
  x: number;
  y: number;
  timestamp: number;
  value: string;
};

export default function FlyingReaction({ x, y, timestamp, value }: Props) {
  console.log("flying reaction");
  return (
    <div
      className={`absolute select-none pointer-events-none`}
      style={{ left: x, top: y }}
    >
      <div className={styles["leftRight" + (timestamp % 3)]}>
        <div className="transform -translate-x-1/2 -translate-y-1/2">
          {value}
        </div>
      </div>
    </div>
  );
}
