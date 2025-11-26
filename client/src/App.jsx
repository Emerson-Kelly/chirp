import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "./components/ui/button"
import './App.css'

function App() {
  return (
    <>
      <h1 className="text-5xl font-bold text-blue-500">
        Tailwind is working!
      </h1>

      <Button>Click me</Button>
    </>
  );
}

export default App
