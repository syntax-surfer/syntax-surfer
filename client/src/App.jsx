import './App.css'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './routes/Login';
import Search from './routes/Search';

function App() {
  const router = createHashRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/search",
      element: <Search />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App








