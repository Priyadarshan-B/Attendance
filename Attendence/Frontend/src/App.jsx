import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./Routes/index";
import { ThemeProviderComponent } from "./components/applayout/dateTheme";
import Loader from "./components/Loader/loader";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ThemeProviderComponent>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProviderComponent>
  );
}

export default App;
