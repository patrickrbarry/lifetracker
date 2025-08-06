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
  const [timeRange, setTimeRange] = useState(7);

  // Category icons mapping
  const categoryIcons = {
    gym: Dumbbell,
    walks: MapPin,
    intake: Pill,
    games: Gamepad2,
    reading: BookOpen,
    social: Users,
    entertainment: BarChart3
  };

  const getCategoryIcon = (iconName) => {
    const IconComponent = categoryIcons[iconName];
    return IconComponent ? <IconComponent size={24} /> : null;
  };

  const getCategoryColor = (categoryId) => {
    const colorMap = {
      gym: '#2563eb',        // Blue family
      walks: '#16a34a',      // Green family  
      intake: '#dc2626',     // Red family
      games: '#7c3aed',      // Purple family
      reading: '#ea580c',    // Orange family
      social: '#0891b2',     // Cyan family
      entertainment: '#be185d' // Pink family
    };
    return colorMap[categoryId] || '#6b7280'; // Default gray
  };

  const loadStoredData = () => {
    try {
      const storedCategories = getFromStorage('categories');
      const storedEntries = getFromStorage('dailyEntries');
      
      if (storedCategories && storedCategories.length > 0) {
        // Check if Entertainment category exists, add it if missing
        const hasEntertainment = storedCategories.some(cat => cat.id === 'entertainment');
        if (!hasEntertainment) {
          const entertainmentCategory = {
            id: 'entertainment',
            name: 'Entertainment',
            icon: 'entertainment',
            activities: [
              { id: 'livemusic', name: 'Live Music', inputType: 'toggleWithText', parameters: {} },
              { id: 'movies', name: 'Movies', inputType: 'toggleWithText', parameters: {} },
              { id: 'art', name: 'Art', inputType: 'toggleWithText', parameters: {} }
            ]
          };
          storedCategories.push(entertainmentCategory);
        }
        
        // Remove old "Music" category that's now duplicative
        const filteredCategories = storedCategories.filter(cat => 
          cat.id !== 'music' && cat.name.toLowerCase() !== 'music'
        );
        
        // Save if we made any changes
        if (filteredCategories.length !== storedCategories.length || !hasEntertainment) {
          saveToStorage('categories', filteredCategories);
        }
        
        setCategories(filteredCategories);
      } else {
        const initialCategories = [
          {
            id: 'gym',
            name: 'Gym',
            icon: 'gym',
            activities: [
              { id: 'pushups', name: 'Pushups', inputType: 'numberPicker', parameters: { min: 0, max: 4 } },
              { id: 'pullups', name: 'Pull-ups', inputType: 'numberPicker', parameters: { min: 0, max: 4 } },
              { id: 'planks', name: 'Planks/Crunches', inputType: 'numberPicker', parameters: { min: 0, max: 4 } },
              { id: 'bench', name: 'Bench', inputType: 'numberPicker', parameters: { min: 0, max: 4 } }
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
          },
          {
            id: 'entertainment',
            name: 'Entertainment',
            icon: 'entertainment',
            activities: [
              { id: 'livemusic', name: 'Live Music', inputType: 'toggleWithText', parameters: {} },
              { id: 'movies', name: 'Movies', inputType: 'toggleWithText', parameters: {} },
              { id: 'art', name: 'Art', inputType: 'toggleWithText', parameters: {} }
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
      
      case 'numberPicker':
        return (
          <div className="number-picker-container">
            {[...Array(5)].map((_, index) => (
              <button
                key={index}
                onClick={() => updateDailyEntry(category.id, activity.id, index)}
                className={`number-picker-button ${currentValue === index ? 'selected' : ''}`}
              >
                {index}
              </button>
            ))}
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

      case 'toggleWithText':
        const toggleValue = currentValue && typeof currentValue === 'object' ? currentValue.enabled : false;
        const textValue = currentValue && typeof currentValue === 'object' ? currentValue.text : '';
        
        return (
          <div className="toggle-with-text-container">
            <button
              onClick={() => {
                const newValue = {
                  enabled: !toggleValue,
                  text: textValue
                };
                updateDailyEntry(category.id, activity.id, newValue);
              }}
              className={`toggle-button ${toggleValue ? 'active' : ''}`}
            >
              {toggleValue ? 'YES' : 'NO'}
            </button>
            <input
              type="text"
              placeholder={`${activity.name} details...`}
              value={textValue}
              onChange={(e) => {
                const newValue = {
                  enabled: toggleValue,
                  text: e.target.value
                };
                updateDailyEntry(category.id, activity.id, newValue);
              }}
              className="toggle-text-input"
            />
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

  const exportToCSV = () => {
    // Create CSV header
    const allActivities = [];
    categories.forEach(category => {
      category.activities.forEach(activity => {
        allActivities.push(`${category.name}: ${activity.name}`);
      });
    });
    
    const csvHeaders = ['Date', ...allActivities];
    
    // Get all dates and sort them
    const allDates = Object.keys(dailyEntries).sort((a, b) => new Date(a) - new Date(b));
    
    // Create CSV rows
    const csvRows = [csvHeaders.join(',')]; // Header row
    
    allDates.forEach(date => {
      const dayData = dailyEntries[date] || {};
      const row = [date];
      
      categories.forEach(category => {
        category.activities.forEach(activity => {
          const key = `${category.id}_${activity.id}`;
          let value = dayData[key];
          
          // Format different value types for CSV
          if (value === undefined || value === null) {
            value = '';
          } else if (typeof value === 'boolean') {
            value = value ? 'Yes' : 'No';
          } else if (typeof value === 'object' && value.enabled !== undefined) {
            // Handle toggleWithText format
            value = value.enabled ? `Yes: ${value.text || ''}` : 'No';
          } else if (typeof value === 'string') {
            // Escape commas and quotes in text
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          row.push(value);
        });
      });
      
      csvRows.push(row.join(','));
    });
    
    // Create and download the file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lifetracker-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getHistoryData = (timeRange = 7) => {
    const dates = Object.keys(dailyEntries).sort((a, b) => new Date(a) - new Date(b));
    const selectedDays = dates.slice(-timeRange);
    
    const historyByCategory = {};
    
    categories.forEach(category => {
      const categoryData = [];
      
      category.activities.forEach(activity => {
        const activityData = selectedDays.map(date => {
          const dayData = dailyEntries[date] || {};
          const key = `${category.id}_${activity.id}`;
          let value = dayData[key];
          
          // Convert different value types to numbers for charting
          if (typeof value === 'boolean') {
            value = value ? 1 : 0;
          } else if (typeof value === 'string' && value !== '') {
            value = 1; // For dropdown/text selections, count as 1 if selected
          } else if (typeof value !== 'number') {
            value = 0;
          }
          // If value is already a number, keep it as is
          
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: date,
            value: value
          };
        });
        
        categoryData.push({
          activityName: activity.name,
          activityId: activity.id,
          inputType: activity.inputType,
          data: activityData
        });
      });
      
      historyByCategory[category.id] = {
        name: category.name,
        icon: category.icon,
        activities: categoryData
      };
    });
    
    return historyByCategory;
  };

  const getAllActivitiesData = (timeRange = 7) => {
    const dates = Object.keys(dailyEntries).sort((a, b) => new Date(a) - new Date(b));
    const selectedDays = timeRange === 'all' ? dates : dates.slice(-timeRange);
    
    const allActivities = [];
    let colorIndex = 0;
    
    categories.forEach(category => {
      const baseColor = getCategoryColor(category.id);
      
      category.activities.forEach((activity, activityIndex) => {
        const activityData = selectedDays.map(date => {
          const dayData = dailyEntries[date] || {};
          const key = `${category.id}_${activity.id}`;
          let value = dayData[key];
          
          // Convert different value types to numbers for charting
          if (typeof value === 'boolean') {
            value = value ? 1 : 0;
          } else if (typeof value === 'object' && value.enabled !== undefined) {
            value = value.enabled ? 1 : 0;
          } else if (typeof value === 'string' && value !== '') {
            value = 1;
          } else if (typeof value !== 'number') {
            value = 0;
          }
          
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: date,
            value: value
          };
        });
        
        // Create variations of the base color for multiple activities in same category
        const colorVariations = [
          baseColor,
          baseColor + '99', // Add transparency
          baseColor.replace(')', ', 0.7)').replace('rgb', 'rgba'), // More transparent
        ];
        
        allActivities.push({
          categoryName: category.name,
          activityName: activity.name,
          fullName: `${category.name}: ${activity.name}`,
          data: activityData,
          color: activityIndex < colorVariations.length ? 
                 baseColor : 
                 `hsl(${(colorIndex * 137.5) % 360}, 70%, 50%)`, // Fallback to HSL
          categoryId: category.id
        });
        
        colorIndex++;
      });
    });
    
    return allActivities;
  };

  const renderHistoryView = () => {
    const historyData = getHistoryData(timeRange);
    
    if (Object.keys(dailyEntries).length === 0) {
      return (
        <div className="history-empty">
          <h3>No data yet</h3>
          <p>Start tracking activities to see your progress here!</p>
        </div>
      );
    }

    return (
      <div className="history-container">
        <div className="history-header">
          <h2 className="history-title">Your Progress</h2>
          <div className="time-range-selector">
            <button 
              onClick={() => setTimeRange(7)} 
              className={`time-range-button ${timeRange === 7 ? 'active' : ''}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange(14)} 
              className={`time-range-button ${timeRange === 14 ? 'active' : ''}`}
            >
              14 Days
            </button>
            <button 
              onClick={() => setTimeRange(30)} 
              className={`time-range-button ${timeRange === 30 ? 'active' : ''}`}
            >
              30 Days
            </button>
          </div>
        </div>
        
        {Object.entries(historyData).map(([categoryId, categoryHistory]) => (
          <div key={categoryId} className="history-category-card">
            <div className="history-category-header">
              {getCategoryIcon(categoryHistory.icon)}
              <h3>{categoryHistory.name}</h3>
            </div>
            
            <div className="history-activities-grid">
              {categoryHistory.activities.map((activity) => (
                <div key={activity.activityId} className="history-activity-chart">
                  <h4 className="activity-chart-title">{activity.activityName}</h4>
                  <div className="simple-line-chart">
                    <svg width="100%" height="80" viewBox="0 0 300 80">
                      {/* Chart background */}
                      <rect width="300" height="80" fill="#f8f9fa" rx="4"/>
                      
                      {/* Chart lines and points */}
                      {activity.data.length > 1 && (() => {
                        const maxValue = Math.max(...activity.data.map(d => d.value), 1);
                        const points = activity.data.map((d, i) => ({
                          x: (i / (activity.data.length - 1)) * 280 + 10,
                          y: 70 - (d.value / maxValue) * 60
                        }));
                        
                        const pathData = points.map((p, i) => 
                          i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                        ).join(' ');
                        
                        return (
                          <>
                            {/* Grid lines */}
                            {[...Array(4)].map((_, i) => (
                              <line
                                key={i}
                                x1="10"
                                y1={10 + (i * 15)}
                                x2="290"
                                y2={10 + (i * 15)}
                                stroke="#e9ecef"
                                strokeWidth="1"
                              />
                            ))}
                            {/* Line */}
                            <path 
                              d={pathData} 
                              stroke="#2563eb" 
                              strokeWidth="3" 
                              fill="none"
                            />
                            {/* Points */}
                            {points.map((p, i) => (
                              <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="#2563eb"
                                stroke="white"
                                strokeWidth="2"
                              />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDashboardView = () => {
    const allActivitiesData = getAllActivitiesData(timeRange);
    
    if (allActivitiesData.length === 0 || Object.keys(dailyEntries).length === 0) {
      return (
        <div className="dashboard-empty">
          <h3>No data yet</h3>
          <p>Start tracking activities to see your unified dashboard!</p>
        </div>
      );
    }

    // Get the date range for x-axis
    const dateRange = allActivitiesData[0]?.data || [];
    const maxValue = Math.max(...allActivitiesData.flatMap(activity => 
      activity.data.map(d => d.value)
    ), 1);

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Activity Dashboard</h2>
          <div className="time-range-selector">
            <button 
              onClick={() => setTimeRange(7)} 
              className={`time-range-button ${timeRange === 7 ? 'active' : ''}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange(14)} 
              className={`time-range-button ${timeRange === 14 ? 'active' : ''}`}
            >
              14 Days
            </button>
            <button 
              onClick={() => setTimeRange(30)} 
              className={`time-range-button ${timeRange === 30 ? 'active' : ''}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setTimeRange('all')} 
              className={`time-range-button ${timeRange === 'all' ? 'active' : ''}`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="unified-chart-container">
          <div className="chart-main">
            <svg width="100%" height="400" viewBox="0 0 800 400" className="unified-chart">
              {/* Background */}
              <rect width="800" height="400" fill="#f8f9fa" rx="8"/>
              
              {/* Grid lines */}
              {[...Array(6)].map((_, i) => (
                <g key={i}>
                  <line
                    x1="60"
                    y1={60 + (i * 50)}
                    x2="740"
                    y2={60 + (i * 50)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </g>
              ))}
              
              {/* Y-axis labels */}
              {[...Array(6)].map((_, i) => (
                <text
                  key={i}
                  x="45"
                  y={65 + (i * 50)}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {Math.round(maxValue - (i * maxValue / 5))}
                </text>
              ))}
              
              {/* X-axis labels */}
              {dateRange.map((datePoint, i) => {
                if (i % Math.max(1, Math.floor(dateRange.length / 8)) === 0) {
                  return (
                    <text
                      key={i}
                      x={60 + (i / (dateRange.length - 1)) * 680}
                      y="385"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {datePoint.date}
                    </text>
                  );
                }
                return null;
              })}
              
              {/* Activity lines */}
              {allActivitiesData.map((activity, activityIndex) => {
                if (activity.data.length > 1) {
                  const points = activity.data.map((d, i) => ({
                    x: 60 + (i / (activity.data.length - 1)) * 680,
                    y: 310 - (d.value / maxValue) * 250
                  }));
                  
                  const pathData = points.map((p, i) => 
                    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                  ).join(' ');
                  
                  return (
                    <g key={activityIndex}>
                      <path 
                        d={pathData} 
                        stroke={activity.color} 
                        strokeWidth="2.5" 
                        fill="none"
                        opacity="0.8"
                      />
                      {points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r="3"
                          fill={activity.color}
                          stroke="white"
                          strokeWidth="1"
                        />
                      ))}
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>
          
          <div className="chart-legend">
            <h4>Activities</h4>
            <div className="legend-items">
              {allActivitiesData.map((activity, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <span className="legend-text">{activity.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'dashboard') {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Dashboard</h1>
          <button onClick={() => setCurrentView('entry')} className="back-button">
            Back
          </button>
        </div>
        {renderDashboardView()}
        
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
          <button 
            onClick={() => setCurrentView('dashboard')} 
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">History</h1>
          <button onClick={() => setCurrentView('entry')} className="back-button">
            Back
          </button>
        </div>
        {renderHistoryView()}
        
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
          <button 
            onClick={() => setCurrentView('dashboard')} 
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

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
                  <option value="numberPicker">Number Picker (0-4)</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="toggleWithText">Toggle with Text</option>
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
          <button onClick={exportToCSV} className="header-button" title="Export Data">
            <Calendar size={20} />
          </button>
          <button onClick={saveAllData} className="header-button" title="Save Data">
            <Save size={20} />
          </button>
          <button onClick={() => setCurrentView('settings')} className="header-button" title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="date-selector">
        <input
          type="date"
          value={(() => {
            // Fix timezone issue by ensuring we get the local date
            const date = new Date(currentDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()}
          onChange={(e) => {
            // Fix timezone issue by creating date in local timezone
            const selectedDate = new Date(e.target.value + 'T00:00:00');
            setCurrentDate(selectedDate.toDateString());
          }}
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
        <button 
          onClick={() => setCurrentView('dashboard')} 
          className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Lifetracker;