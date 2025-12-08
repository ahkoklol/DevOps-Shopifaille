// src/App.tsx
//pas sûre de si c'est la bonne version
import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";

// Optional providers (uncomment if you created them)
// import QueryProvider from "./app/providers/QueryProvider";
// import ThemeProvider from "./app/providers/ThemeProvider";

export default function App() {
  return (
    // Wrap with your providers here if you have them (ThemeProvider, QueryProvider, etc.)
    // <ThemeProvider>
    //   <QueryProvider>
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
    //   </QueryProvider>
    // </ThemeProvider>
  );
}
