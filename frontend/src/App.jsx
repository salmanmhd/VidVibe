import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;

// function AppLayout() {
//   return (
//     <div>
//       <Header />
//       <main>
//         <Outlet />
//       </main>
//       <CartOverview />
//     </div>
//   );
// }
