import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Download, Upload, Trash2, Moon, Sun, RotateCcw } from 'lucide-react';
import { Lists } from './types';
import './App.css';

const App: React.FC = () => {
  // State management
  const [lists, setLists] = useState<Lists>(() => {
    const saved = localStorage.getItem('taskLists');
    return saved ? JSON.parse(saved) : {
      'Bedtime Routine': {
        tasks: [
          { id: '1', text: 'Take supplements', checked: false },
          { id: '2', text: 'Brush teeth', checked: false },
          { id: '3', text: 'Set alarm', checked: false }
        ]
      }
    };
  });
  
  const [currentList, setCurrentList] = useState<string>(Object.keys(lists)[0] || '');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [newTask, setNewTask] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Save to localStorage whenever lists change
  useEffect(() => {
    localStorage.setItem('taskLists', JSON.stringify(lists));
  }, [lists]);

  // Dark mode listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Add new list
  const addList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      setLists(prev => ({
        ...prev,
        [newListName]: { tasks: [] }
      }));
      setCurrentList(newListName);
      setNewListName('');
      setMenuOpen(false);
    }
  };

  // Add new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setLists(prev => ({
        ...prev,
        [currentList]: {
          tasks: [
            ...prev[currentList].tasks,
            { id: Date.now().toString(), text: newTask, checked: false }
          ]
        }
      }));
      setNewTask('');
    }
  };

  // Toggle task
  const toggleTask = (taskId: string) => {
    setLists(prev => ({
      ...prev,
      [currentList]: {
        tasks: prev[currentList].tasks.map(task =>
          task.id === taskId ? { ...task, checked: !task.checked } : task
        )
      }
    }));
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setLists(prev => ({
      ...prev,
      [currentList]: {
        tasks: prev[currentList].tasks.filter(task => task.id !== taskId)
      }
    }));
  };

  // Delete list
  const deleteList = (listName: string) => {
    setLists(prev => {
      const { [listName]: _, ...rest } = prev;
      return rest;
    });
    setCurrentList(Object.keys(lists)[0] || '');
  };

  // Reset current list
  const resetList = () => {
    setLists(prev => ({
      ...prev,
      [currentList]: {
        tasks: prev[currentList].tasks.map(task => ({ ...task, checked: false }))
      }
    }));
  };

  // Export lists
  const exportLists = () => {
    const dataStr = JSON.stringify(lists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'task-lists.json');
    linkElement.click();
  };

  // Import lists
  const importLists = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result as string);
          setLists(imported);
          setCurrentList(Object.keys(imported)[0] || '');
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`p-4 flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-opacity-80"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold">{currentList || 'Task Lists'}</h1>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-opacity-80"
        >
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div className={`fixed inset-0 z-50 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Lists</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-opacity-80"
              >
                <X size={24} />
              </button>
            </div>

            {/* New List Form */}
            <form onSubmit={addList} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className={`flex-1 p-2 rounded-lg ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                />
                <button 
                  type="submit"
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus size={24} />
                </button>
              </div>
            </form>

            {/* Lists */}
            <div className="space-y-2">
              {Object.keys(lists).map(listName => (
                <div 
                  key={listName}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-opacity-80"
                >
                  <button
                    onClick={() => {
                      setCurrentList(listName);
                      setMenuOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    {listName}
                  </button>
                  <button
                    onClick={() => deleteList(listName)}
                    className="p-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Import/Export */}
            <div className="mt-6 space-y-2">
              <button
                onClick={exportLists}
                className="w-full p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Export Lists
              </button>
              <label className="w-full p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={20} />
                Import Lists
                <input
                  type="file"
                  accept=".json"
                  onChange={importLists}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {currentList && (
          <>
            {/* New Task Form */}
            <form onSubmit={addTask} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="New task"
                  className={`flex-1 p-2 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                />
                <button 
                  type="submit"
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus size={24} />
                </button>
              </div>
            </form>

            {/* Tasks */}
            <div className="space-y-2">
              {lists[currentList].tasks.map(task => (
                <div 
                  key={task.id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5"
                  />
                  <span className={task.checked ? 'line-through' : ''}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-auto p-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            {lists[currentList].tasks.some(task => task.checked) && (
              <button
                onClick={resetList}
                className="mt-4 w-full p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Reset Checklist
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;