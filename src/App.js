import React, { useState, useEffect } from 'react';
import { Plus, Settings, BarChart3, Calendar, ChevronDown, ChevronUp, Save, Dumbbell, MapPin, Pill, Gamepad2, BookOpen, Users } from 'lucide-react';
import './App.css';

const Lifetracker = () => {
  const [currentView, setCurrentView] = useState('entry');
  const [categories, setCategories] = useState([]);
  const [dailyEntries, setDailyEntries] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedCategoryForActivity, setSelectedCategoryForActivity] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newActivity, setNewActivity] = useState({
    name: '',
    inputType: 'checkbox',
    parameters: {}
  });
  const [newReadingLabel, setNewReadingLabel] = useState('');

  // Category icons mapping
  const categoryIcons = {
    gym: Dumbbell,
    walks: MapPin,
    intake: Pill,
    games: Gamepad2,
    reading: BookOpen,
    social: Users
  };

  const loadStoredData = () => {
    try {
      const storedCategories = getFromStorage('categories');
      const storedEntries = getFromStorage('dailyEntries');
      
      if (storedCategories && storedCategories.length > 0) {
        setCategories(storedCategories);
      } else {
        const initialCategories = [
          {
            id: 'gym',
            name: 'Gym',
            icon: 'gym',
            activities: [
              { id: 'pushups', name: 'Pushups', inputType: 'number', parameters: { min: 0, max: 3 } },
              { id: 'pullups', name: 'Pull-ups', inputType: 'number', parameters: { min: 0, max: 3 } },
              { id: 'planks', name: 'Planks/Crunches', inputType: 'number', parameters: { min: 0, max: 3 } },
              { id: 'bench', name: 'Bench', inputType: 'number', parameters: { min: 0, max: 3 } }
            ]
          },
          {
            id: 'walks',
            name: 'Walks',
            icon: 'walks',
            activities: [
              { id: 'walks', name: 'Walk Type', inputType: 'radio', parameters: { options: ['neighborhood', 'dish', 'adventure'] } }
            ]
          },
          {
            id: 'intake',
            name: 'Intake',
            icon: 'intake',
            activities: [
              { id: 'meds', name: 'Meds', inputType: 'toggle', parameters: {} },
              { id: 'electrolytes', name: 'Electrolytes', inputType: 'toggle', parameters: {} },
              { id: 'alcohol', name: 'Alcohol >1', inputType: 'checkbox', parameters: {} }
            ]
          },
          {
            id: 'games',
            name: 'Games',
            icon: 'games',
            activities: [
              { id: 'bird', name: 'Bird', inputType: 'checkbox', parameters: {} },
              { id: 'golf', name: 'Golf', inputType: 'checkbox', parameters: {} },
              { id: 'civ', name: 'Civ', inputType: 'checkbox', parameters: {} },
              { id: 'other', name: 'Other', inputType: 'checkbox', parameters: {} }
            ]
          },
          {
            id: 'reading',
            name: 'Reading',
            icon: 'reading',
            activities: [
              { id: 'audio', name: 'Audio', inputType: 'checkbox', parameters: {} },
              { id: 'physical', name: 'Physical', inputType: 'checkbox', parameters: {} },
              { id: 'digital', name: 'Digital', inputType: 'checkbox', parameters: {} },
              { id: 'content', name: 'Content', inputType: 'learningDropdown', parameters: { options: ['Book: Example Title', 'Article: Sample Article'], allowNew: true } }
            ]
          },
          {
            id: 'social',
            name: 'Social',
            icon: 'social',
            activities: [
              { id: 'friends', name: 'Friends', inputType: 'checkbox', parameters: {} },
              { id: 'family', name: 'Family', inputType: 'checkbox', parameters: {} },
              { id: 'work', name: 'Work', inputType: 'checkbox', parameters: {} }
            ]
          }
        ];
        setCategories(initialCategories);
      }

      if (storedEntries) {
        setDailyEntries(storedEntries);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  useEffect(() => {
    loadStoredData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Expand all categories by default for better UX
    const defaultExpanded = {};
    categories.forEach(cat => {
      defaultExpanded[cat.id] = true;
    });
    setExpandedCategories(defaultExpanded);
  }, [categories]);

  useEffect(() => {
    saveToStorage('categories', categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage('dailyEntries', dailyEntries);
  }, [dailyEntries]);

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(`lifetracker_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const getFromStorage = (key) => {
    try {
      const item = localStorage.getItem(`lifetracker_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  };

  const getCurrentDateEntry = () => {
    return dailyEntries[currentDate] || {};
  };

  const updateDailyEntry = (categoryId, activityId, value) => {
    setDailyEntries(prev => ({
      ...prev,
      [currentDate]: {
        ...prev[currentDate],
        [`${categoryId}_${activityId}`]: value
      }
    }));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const addNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
        name: newCategoryName,
        icon: null,
        activities: []
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const addNewActivity = () => {
    if (newActivity.name.trim() && selectedCategoryForActivity) {
      const activity = {
        id: newActivity.name.toLowerCase().replace(/\s+/g, '_'),
        name: newActivity.name,
        inputType: newActivity.inputType,
        parameters: newActivity.parameters
      };
      
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategoryForActivity 
          ? { ...cat, activities: [...cat.activities, activity] }
          : cat
      ));
      
      setNewActivity({ name: '', inputType: 'checkbox', parameters: {} });
      setSelectedCategoryForActivity('');
      setShowAddActivity(false);
    }
  };

  const addNewReadingLabel = (categoryId, activityId) => {
    if (newReadingLabel.trim()) {
      // Add the new label to the dropdown options
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? {
              ...cat,
              activities: cat.activities.map(act => 
                act.id === activityId
                  ? {
                      ...act,
                      parameters: {
                        ...act.parameters,
                        options: [...(act.parameters.options || []), newReadingLabel]
                      }
                    }
                  : act
              )
            }
          : cat
      ));
      
      // Set this as the current value
      updateDailyEntry(categoryId, activityId, newReadingLabel);
      setNewReadingLabel('');
    }
  };

  const renderActivityInput = (category, activity, currentValue) => {
    switch (activity.inputType) {
      case 'number':
        return (
          <div className="number-input">
            <span className="number-label">Sets: {activity.parameters.min || 0}-{activity.parameters.max || 10}</span>
            <input
              type="number"
              min={activity.parameters.min || 0}
              max={activity.parameters.max || 10}
              value={currentValue || 0}
              onChange={(e) => updateDailyEntry(category.id, activity.id, parseInt(e.target.value))}
              className="number-field"
            />
          </div>
        );
      
      case 'toggle':
        return (
          <button
            onClick={() => updateDailyEntry(category.id, activity.id, !currentValue)}
            className={`toggle-button ${currentValue ? 'active' : ''}`}
          >
            {currentValue ? 'YES' : 'NO'}
          </button>
        );
      
      case 'checkbox':
        return (
          <button
            onClick={() => updateDailyEntry(category.id, activity.id, !currentValue)}
            className={`checkbox-button ${currentValue ? 'checked' : ''}`}
          >
            {currentValue ? '✓' : '○'}
          </button>
        );
      
      case 'radio':
        return (
          <div className="radio-group">
            {activity.parameters.options?.map(option => (
              <button
                key={option}
                onClick={() => updateDailyEntry(category.id, activity.id, option)}
                className={`radio-button ${currentValue === option ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => updateDailyEntry(category.id, activity.id, e.target.value)}
            className="dropdown-select"
          >
            <option value="">Select...</option>
            {activity.parameters.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'learningDropdown':
        return (
          <div className="learning-dropdown-container">
            <select
              value={currentValue || ''}
              onChange={(e) => updateDailyEntry(category.id, activity.id, e.target.value)}
              className="dropdown-select"
            >
              <option value="">Select or add below...</option>
              {activity.parameters.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="add-reading-container">
              <input
                type="text"
                placeholder="Add new content (e.g., 'Book: Title' or 'Article: Name')"
                value={newReadingLabel}
                onChange={(e) => setNewReadingLabel(e.target.value)}
                className="reading-input"
              />
              <button
                onClick={() => addNewReadingLabel(category.id, activity.id)}
                className="add-reading-button"
                disabled={!newReadingLabel.trim()}
              >
                Add
              </button>
            </div>
          </div>
        );
      
      default:
        return <span>Unknown input type</span>;
    }
  };

  const saveAllData = () => {
    saveToStorage('categories', categories);
    saveToStorage('dailyEntries', dailyEntries);
    alert('Data saved successfully!');
  };

  const getCategoryIcon = (iconName) => {
    const IconComponent = categoryIcons[iconName];
    return IconComponent ? <IconComponent size={24} /> : null;
  };

  if (currentView === 'settings') {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Settings</h1>
          <button onClick={() => setCurrentView('entry')} className="back-button">
            Back
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-card">
            <h3>Categories & Activities</h3>
            
            <button 
              onClick={() => setShowAddCategory(true)} 
              className="primary-button"
            >
              <Plus size={16} /> Add Category
            </button>

            {showAddCategory && (
              <div className="add-form">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="form-input"
                />
                <div className="form-buttons">
                  <button onClick={addNewCategory} className="primary-button">Add</button>
                  <button onClick={() => setShowAddCategory(false)} className="secondary-button">Cancel</button>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowAddActivity(true)} 
              className="primary-button"
            >
              <Plus size={16} /> Add Activity
            </button>

            {showAddActivity && (
              <div className="add-form">
                <select
                  value={selectedCategoryForActivity}
                  onChange={(e) => setSelectedCategoryForActivity(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Activity name"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
                
                <select
                  value={newActivity.inputType}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, inputType: e.target.value }))}
                  className="form-input"
                >
                  <option value="checkbox">Checkbox</option>
                  <option value="toggle">Yes/No Toggle</option>
                  <option value="number">Number Range</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="learningDropdown">Learning Dropdown</option>
                </select>

                <div className="form-buttons">
                  <button onClick={addNewActivity} className="primary-button">Add</button>
                  <button onClick={() => setShowAddActivity(false)} className="secondary-button">Cancel</button>
                </div>
              </div>
            )}

            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-item-header">
                    {getCategoryIcon(category.icon)}
                    <h4>{category.name}</h4>
                  </div>
                  <ul>
                    {category.activities.map(activity => (
                      <li key={activity.id}>{activity.name} ({activity.inputType})</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Lifetracker</h1>
        <div className="header-buttons">
          <button onClick={saveAllData} className="header-button">
            <Save size={20} />
          </button>
          <button onClick={() => setCurrentView('settings')} className="header-button">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="date-selector">
        <input
          type="date"
          value={new Date(currentDate).toISOString().split('T')[0]}
          onChange={(e) => setCurrentDate(new Date(e.target.value).toDateString())}
          className="date-input"
        />
      </div>

      <div className="categories-container">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="category-title">
                {getCategoryIcon(category.icon)}
                <h3>{category.name}</h3>
              </div>
              {expandedCategories[category.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedCategories[category.id] && (
              <div className="category-content">
                {category.activities.map(activity => (
                  <div key={activity.id} className="activity-row">
                    <span className="activity-name">{activity.name}</span>
                    <div className="activity-input">
                      {renderActivityInput(category, activity, getCurrentDateEntry()[`${category.id}_${activity.id}`])}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bottom-nav">
        <button 
          onClick={() => setCurrentView('entry')} 
          className={`nav-button ${currentView === 'entry' ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Entry</span>
        </button>
        <button 
          onClick={() => setCurrentView('history')} 
          className={`nav-button ${currentView === 'history' ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>History</span>
        </button>
      </div>
    </div>
  );
};

export default Lifetracker;