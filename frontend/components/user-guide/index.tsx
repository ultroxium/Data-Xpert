// components/JoyrideTour.js
import React, { useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const JoyrideTour = () => {
  const [run, setRun] = useState(false);
  const [steps] = useState([
    {
      target: '#step-1', // The element to highlight
      content: 'This is the first step of the tour!', // Content to display
      disableBeacon: true, // Start the tour immediately
    },
    {
      target: '#step-2',
      content: 'This is the second step of the tour!',
    },
    {
      target: '#step-3',
      content: 'This is the third step of the tour!',
    },
  ]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Tour is finished or skipped
      setRun(false);
    }
  };

  return (
    <>
      <button onClick={() => setRun(true)}>Start Tour</button>
      <Joyride
        steps={steps}
        run={run}
        callback={handleJoyrideCallback}
        continuous={true} // Move to the next step automatically
        showProgress={true} // Show progress bar
        showSkipButton={true} // Show skip button
        styles={{
          options: {
            primaryColor: '#ff0000', // Customize the color
          },
        }}
      />
    </>
  );
};

export default JoyrideTour;