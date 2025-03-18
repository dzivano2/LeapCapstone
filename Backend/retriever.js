const User = require('./models/User');

const getUserData = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    console.error('Error fetching user data:', err.message);
    return null;
  }
};

module.exports = { getUserData };
