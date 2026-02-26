// App component is no longer used by current routes
import React from "react";
import { Outlet } from "react-router-dom";

function App() {
  return <Outlet />;
}

export default App;
