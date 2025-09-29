interface BalloonIconProps {
  color?: string;
  size?: number;
  fontSize?: number;
  index?: number | null;
}

const BalloonIcon: React.FC<BalloonIconProps> = ({
  color = "red",
  size = 280,
  fontSize = 80,
  index,
}) => {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size}>
      <g>
        {/* Balloon string */}
        <rect
          x="247.027"
          y="398.668"
          width="17.946"
          height="113.332"
          fill={color}
        />

        {/* Balloon body */}
        <path
          d="M256.007,0C170.213,0,102.569,65.824,106.25,169.118c3.843,107.508,80.015,174.195,130.395,188.945
        l-14.211,26.225h67.132l-14.204-26.225c50.373-14.744,126.559-81.424,130.388-188.945
        C409.444,65.824,341.786,0,256.007,0z"
          fill={color}
        />

        {/* Reflection (white highlight) */}
        <path
          d="M221.274,84.154c-6.121,3.573-11.69,7.928-16.598,13.018
        c-10.813,11.218-18.444,25.49-22.597,42.856
        c-1.767,7.416-9.209,11.994-16.625,10.227
        c-7.416-1.766-12-9.216-10.233-16.631
        c5.11-21.526,15.047-40.577,29.581-55.632
        c6.688-6.93,14.292-12.863,22.558-17.69
        c6.593-3.842,15.047-1.618,18.89,4.968
        C230.092,71.858,227.867,80.312,221.274,84.154z"
          fill="white"
        />

        {/* Balloon index text */}
        {index !== null && (
          <text
            x="256"
            y="220"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="white"
            fontSize={fontSize}
            fontWeight="bold"
          >
            {`#${index}`}
          </text>
        )}
      </g>
    </svg>
  );
};

export default BalloonIcon;
