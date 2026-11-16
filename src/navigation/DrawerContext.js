import React, { createContext, useState, useCallback, useRef } from 'react';

export const DrawerContext = createContext({
  isOpen:      false,
  openDrawer:  () => {},
  closeDrawer: () => {},
  // Internal — used by DrawerOverlay to signal animation finished
  _setOpen:    () => {},
});

export const DrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  // closeDrawer just flips the flag — DrawerOverlay handles animation then hides
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DrawerProvider');
  return context;
};
