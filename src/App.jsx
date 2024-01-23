import "./App.css";

import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import {toast, Toaster} from "sonner";
import {io} from "socket.io-client";
import MyRooms from "./components/MyRooms.jsx";


const socket = io("http://192.168.29.44:3155");
socket.on("connect",()=>{
    toast.success("Connected to server");
})

const routes = createBrowserRouter([
    {
        path:'/',
        element:<Home socket={socket}/>
    },
    {
        path:'/editor/:roomId',
        element:<EditorPage socket={socket}/>
    },
    {
        path:'/login',
        element:<LoginPage/>
    },
    {
        path:'/signUp',
        element:<SignUpPage/>
    },
    {
        path:"/myRooms",
        element:<MyRooms/>
    }
])
const App = () => {
  return (
    <>
      <Toaster richColors position="top-right" />
        <RouterProvider router={routes}/>
    </>
  );
};

export default App;
