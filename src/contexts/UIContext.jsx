import { createContext, useContext, useState } from "react";

const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);

export function UIProvider({ children }) {
  const [modal, setModal] = useState(null);          // { type, props }
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [toast, setToast] = useState(null);          // { type: 'success'|'error'|'info', msg }

  const openModal = (type, props) => setModal({ type, props });
  const closeModal = () => setModal(null);

  return (
    <UICtx.Provider value={{ modal, openModal, closeModal, loadingGlobal, setLoadingGlobal, toast, setToast }}>
      {children}
    </UICtx.Provider>
  );
}
