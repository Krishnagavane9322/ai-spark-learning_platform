const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const categorySkillMap = {
  "Frontend": ["JavaScript", "React", "CSS/Tailwind"],
  "Backend": ["Node.js", "SQL"],
  "ML": ["Python", "TensorFlow", "Data Science"],
  "Foundations": ["Python", "JavaScript"],
  "NLP": ["Python", "TensorFlow"],
  "Mobile": ["React Native", "TypeScript", "Mobile UI"],
  "DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
  "Cloud": ["AWS", "Docker", "Kubernetes"],
  "Research": ["Design Systems", "Figma"],
  "Design": ["Figma", "Design Systems"],
  "Tools": ["Figma"],
  "Database": ["SQL"],
  "Analysis": ["Python", "SQL", "Statistics", "Visualization"],
  "Security": ["Networking", "Linux", "Ethical Hacking"],
  "AppSec": ["Networking", "Ethical Hacking"],
  "Offensive": ["Ethical Hacking", "Networking"],
  "Crypto": ["Networking"],
  "Math": ["Statistics"],
  "Project": []
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({});
    console.log(`Found ${users.length} users to backfill.`);
    
    for (const user of users) {
      if (!user.personalizedPath || user.personalizedPath.length === 0) continue;
      
      const completedSteps = user.personalizedPath.filter(s => s.status === 'completed');
      if (completedSteps.length === 0) continue;
      
      console.log(`Backfilling skills for user: ${user.email} (${completedSteps.length} completed steps)`);
      console.log(`Before:`, JSON.stringify(user.skills));
      
      // Keep track of which skills we increment so we don't double count if we run multiple times
      // However, since we are doing a one-off backfill, we can reset skill levels that grow from path steps to 0
      // first, then recalculate. But wait, if they have manual edits, we shouldn't wipe everything.
      // Actually, a safe recalculation:
      // 1. Identify skills associated with completed step categories.
      // 2. Start them at 0, then add 5 for each completed step of that category.
      // 3. For any other skills (not in the completed categories), leave their levels as-is.
      
      // Let's construct a map of category counts
      const categoryCounts = {};
      for (const step of completedSteps) {
        categoryCounts[step.category] = (categoryCounts[step.category] || 0) + 1;
      }
      
      // For each skill, if it is in the categorySkillMap of a completed category,
      // we recalculate its contribution.
      // Let's find all skills affected by completed steps
      const affectedSkills = new Set();
      for (const cat of Object.keys(categoryCounts)) {
        const skills = categorySkillMap[cat] || [];
        skills.forEach(s => affectedSkills.add(s));
      }
      
      // Reset affected skills to 0 first in the user's array, or add them if missing
      for (const skillName of affectedSkills) {
        const skillIndex = user.skills.findIndex(s => s.name === skillName);
        if (skillIndex !== -1) {
          user.skills[skillIndex].level = 0;
        } else {
          user.skills.push({ name: skillName, level: 0 });
        }
      }
      
      // Now grow them based on completed steps
      for (const step of completedSteps) {
        const relatedSkills = categorySkillMap[step.category] || [];
        for (const skillName of relatedSkills) {
          const skill = user.skills.find(s => s.name === skillName);
          if (skill) {
            skill.level = Math.min(100, skill.level + 5);
          }
        }
      }
      
      user.markModified('skills');
      await user.save();
      console.log(`After:`, JSON.stringify(user.skills));
    }
    
    console.log('Backfill finished successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
  });
