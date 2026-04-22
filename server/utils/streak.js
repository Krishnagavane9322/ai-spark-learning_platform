const updateStreak = async (user) => {
  try {
    const now = new Date();
    // Use local date string to avoid timezone issues for simple streaks
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    if (user.lastActiveDate === today) {
      return user; // Already updated today
    }

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.getFullYear() + '-' + String(yesterdayDate.getMonth() + 1).padStart(2, '0') + '-' + String(yesterdayDate.getDate()).padStart(2, '0');

    if (user.lastActiveDate === yesterday) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = today;

    // Ensure weeklyActivity exists and has entries
    if (user.weeklyActivity && user.weeklyActivity.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayDay = dayNames[now.getDay()];
      const dayEntry = user.weeklyActivity.find(d => d.day === todayDay);
      if (dayEntry) {
        // Increment activity slightly for the login/visit
        dayEntry.hours = Math.min(5, dayEntry.hours + 0.2);
      }
    }

    await user.save();
    return user;
  } catch (error) {
    console.error("Error updating streak:", error);
    return user;
  }
};

module.exports = updateStreak;
