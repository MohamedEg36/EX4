const User = require('../models/User');

exports.addOrUpdatePreferences = async (req, res) => {
  const { startDate, endDate, destination, holidayType, accessCode } = req.body;
  try {
    let user = await User.findOne({ accessCode });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid access code' });
    }

    user.preferences = { startDate, endDate, destination, holidayType };
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const users = await User.find();
    const preferences = users.map(user => user.preferences);
    res.json(preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.calculateHoliday = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length < 5) {
      return res.status(400).json({ msg: 'All users have not submitted their preferences' });
    }

    const destinations = users.map(user => user.preferences.destination);
    const holidayTypes = users.map(user => user.preferences.holidayType);
    const startDates = users.map(user => user.preferences.startDate);
    const endDates = users.map(user => user.preferences.endDate);

    const majorityDestination = getMajority(destinations);
    const majorityHolidayType = getMajority(holidayTypes);
    const overlapDates = getOverlapDates(startDates, endDates);

    if (!overlapDates) {
      return res.status(400).json({ msg: 'No overlapping dates found' });
    }

    res.json({
      destination: majorityDestination,
      holidayType: majorityHolidayType,
      startDate: overlapDates[0],
      endDate: overlapDates[1],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getMajority = (arr) => {
  const counts = {};
  arr.forEach(val => counts[val] = (counts[val] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

const getOverlapDates = (startDates, endDates) => {
  const latestStartDate = new Date(Math.max(...startDates.map(date => new Date(date))));
  const earliestEndDate = new Date(Math.min(...endDates.map(date => new Date(date))));
  if (latestStartDate <= earliestEndDate) {
    return [latestStartDate, earliestEndDate];
  }
  return null;
};
