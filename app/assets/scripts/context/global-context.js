import React, { createContext, useState, useEffect } from 'react';

const GlobalContext = React.createContext({});

export function GlobalProvider (props) {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect( () => {
    window.addEventListener('resize', () => {
      // Store the height to set the page min height. This is needed for mobile
      // devices to account for the address bar, since 100vh does not work.
      // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
      setWindowHeight(window.innerHeight)
    });
  }, [])
  return (
    <>
      <GlobalContext.Provider
        value={{
          windowHeight
        }}
      >
        {props.children}
      </GlobalContext.Provider>
    </>
  );
}

export default GlobalContext;
