import React from "react";

interface TimerContextType {
  isFinish: boolean;
  handleFinish: () => void;
  handleReset: () => void;
}

const TimerContext = React.createContext<TimerContextType | undefined>(
  undefined
);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFinish, setIsFinish] = React.useState(true);

  const handleFinish = () => {
    setIsFinish(true);
  };

  const handleReset = () => {
    setIsFinish(false);
  };

  return (
    <TimerContext.Provider value={{ isFinish, handleFinish, handleReset }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = React.useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
