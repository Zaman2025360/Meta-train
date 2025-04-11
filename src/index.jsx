
import ReactDOM from "react-dom/client";
import App from './App';

// Add some global styles
const style = document.createElement('style');
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: Arial, sans-serif;
    overflow-x: hidden;
  }
  
  a {
    color: #4cc9f0;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);