import React from "react";
import "./App.css";

const CircularTimer = ({ timeLeft, totalTime }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="circular-timer">
      <svg width="100" height="100">
        <circle
          className="circle background-circle"
          cx="50"
          cy="50"
          r={radius}
        />
        <circle
          className="circle foreground-circle"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
        <text x="50" y="50" className="timer-text">
          {timeLeft}
        </text>
      </svg>
    </div>
  );
};

export default CircularTimer;
