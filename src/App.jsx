import { useState, useEffect, useRef } from 'react';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import './App.css';

function App() {
  const [texts, setTexts] = useState([
    { value: '', fontSize: 16, fontColor: '#000000', key: Date.now(), x: 50, y: 50 }
  ]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const canvasRef = useRef(null);
  const [currentFont, setCurrentFont] = useState('Roboto');
  const [currentFontColor, setCurrentFontColor] = useState('#000000');
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [currentInputText, setCurrentInputText] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const fonts = ['Roboto', 'Montserrat', 'Lobster']; 

  const addToUndoStack = () => {
    setUndoStack([...undoStack, texts]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([texts, ...redoStack]);
      setTexts(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack([...undoStack, texts]);
      setTexts(nextState);
      setRedoStack(redoStack.slice(1));
    }
  };

  const handleAddText = () => {
    const newText = {
      value: '',
      fontSize: currentFontSize,
      fontColor: currentFontColor,
      key: Date.now(),
      x: 50,
      y: 50
    };
    const updatedTexts = [...texts, newText];
    setTexts(updatedTexts);
    addToUndoStack();
    setCurrentInputText(newText);
  };

  const handleFontSizeChange = (change) => {
    if (!currentInputText) return;

    const updatedTexts = texts.map((text) =>
      text.key === currentInputText.key
        ? { ...text, fontSize: text.fontSize + change }
        : text
    );
    setTexts(updatedTexts);
    addToUndoStack(updatedTexts);
  };

  const handleFontColorChange = (color) => {
    if (!currentInputText) return;

    const updatedTexts = texts.map((text) =>
      text.key === currentInputText.key
        ? { ...text, fontColor: color }
        : text
    );
    setTexts(updatedTexts);
    addToUndoStack(updatedTexts);
  };

  const handleFontChange = (font) => {
    setCurrentFont(font);
    if (!currentInputText) return;

    const updatedTexts = texts.map((text) =>
      text.key === currentInputText.key
        ? { ...text, font }
        : text
    );
    setTexts(updatedTexts);
    addToUndoStack(updatedTexts);
  };

  const handleMouseDown = (index) => {
    setDraggingIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const updatedTexts = [...texts];
      updatedTexts[draggingIndex].x = e.clientX - canvasRect.left;
      updatedTexts[draggingIndex].y = e.clientY - canvasRect.top;
      setTexts(updatedTexts);
    }
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null) {
      addToUndoStack(texts);
      setDraggingIndex(null);
    }
  };

  const drawOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    texts.forEach((text) => {
      ctx.font = `${text.fontSize}px ${currentFont}`;
      ctx.fillStyle = text.fontColor;
      ctx.fillText(text.value || 'Enter text...', text.x, text.y);
    });
  };

  useEffect(() => {
    drawOnCanvas(); 
  }, [texts, currentFont]); 

  return (
    <div className="app-container flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2">
      <div className="flex flex-row bg-gray-300 w-1/2 p-3 rounded-full justify-around mb-2">
        <h2 className="text-2xl font-bold my-auto">Canvas Text Editor</h2>
        <div className="flex space-x-4 my-auto">
          <button onClick={handleUndo} className="btn bg-gray-100 hover:bg-gray-500 text-black p-2 rounded">
          <UndoIcon/>
            Undo
          </button>
          <button onClick={handleRedo} className="btn bg-gray-100 hover:bg-gray-500 text-black p-2 rounded">
          Redo
          <RedoIcon/>
            
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ position: 'relative' }}
      >
        <canvas ref={canvasRef} width={600} height={400} className="border border-black my-4 rounded-xl"></canvas>

        {/* Render Text Input Fields */}
        {texts.map((text, index) => (
          <input
            key={text.key}
            type="text"
            value={text.value}
            style={{
              position: 'absolute',
              top: `${text.y}px`,
              left: `${text.x}px`,
              fontSize: `${text.fontSize}px`,
              color: text.fontColor,
              cursor: 'move',
              fontFamily: currentFont,
              backgroundColor:'#f3f4f6'
            }}
            onChange={(e) => {
              const updatedTexts = texts.map((t) =>
                t.key === text.key ? { ...t, value: e.target.value } : t
              );
              setTexts(updatedTexts);
              setCurrentInputText({ ...text, value: e.target.value });
            }}
            onMouseDown={() => handleMouseDown(index)}
            className="block p-2 border border-none rounded"
            placeholder='TEXT'
          />
        ))}
      </div>

      {/* Text Editor Controls */}
      <div className="flex flex-col md:flex-row md:space-x-4 items-center space-y-4 md:space-y-0">
        <button onClick={handleAddText} className="btn bg-gray-300 hover:bg-gray-500 text-black p-2 rounded">
          Add Text
        </button>

        <div className="flex items-center space-x-2 p-2 bg-gray-300 rounded">
          <label className="font-semibold">Color</label>
          <input
            type="color"
            onChange={(e) => handleFontColorChange(e.target.value)}
            value={currentFontColor}
            className="w-6 h-7"
          />
        </div>

        <div className="flex items-center space-x-2 gap-2">
          <button onClick={() => handleFontSizeChange(2)} className="btn bg-gray-300 hover:bg-gray-500 text-black p-2 rounded">
            <TextIncreaseIcon/>
          </button>
          <button onClick={() => handleFontSizeChange(-2)} className="btn bg-gray-300 hover:bg-gray-500 text-black p-2 rounded">
            <TextDecreaseIcon/>
          </button>
        </div>

        {/* Font Selector */}
        <div className="flex items-center space-x-2">
          <label className="font-semibold">Font</label>
          <select
            onChange={(e) => handleFontChange(e.target.value)}
            value={currentFont}
            className="p-2 bg-gray-300 rounded"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
