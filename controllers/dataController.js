const { countries, usStates, canadianProvinces } = require('../utils/countries');

exports.getCountries = (req, res) => {
  try {
    res.json({ 
      success: true, 
      countries: countries.sort()
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getStates = (req, res) => {
  try {
    const { country } = req.query;
    
    let states = {};
    
    if (country === 'United States') {
      states = usStates;
    } else if (country === 'Canada') {
      states = canadianProvinces;
    }
    
    res.json({ 
      success: true, 
      states 
    });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

