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
