/**
 * ML Model Integration for Bid Success Prediction
 * Calls the FastAPI ML microservice to predict bid success probability
 */

const axios = require('axios');

const ML_API_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_ENABLED = process.env.ML_PREDICTIONS_ENABLED !== 'false';

/**
 * Calculate bid success prediction
 * @param {Object} bidder - User placing the bid
 * @param {Object} task - Task being bid on
 * @param {String} bidId - Unique bid identifier
 * @returns {Object} Prediction result {probability, prediction, confidence, model_version}
 */
async function getBidPrediction(bidder, task, bidId) {
  try {
    if (!ML_ENABLED) {
      return {
        success_probability: null,
        prediction: 'unknown',
        confidence: 0,
        model_version: 'disabled',
        error: 'ML predictions disabled'
      };
    }

    // Calculate features for prediction
    const features = calculateBidFeatures(bidder, task);

    console.log(`[ML] Predicting bid success for ${bidId}...`);
    console.log(`[ML] Features:`, features);

    // Call FastAPI prediction endpoint
    const response = await axios.post(`${ML_API_URL}/predict`, features, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    const prediction = {
      ...response.data,
      bid_id: bidId,
      bidder_id: bidder._id.toString(),
      task_id: task._id.toString(),
      timestamp: new Date().toISOString()
    };

    console.log(`[ML] Prediction successful:`, prediction);
    return prediction;

  } catch (error) {
    console.error(`[ML] Prediction error for ${bidId}:`, error.message);

    // Return graceful fallback
    return {
      success_probability: null,
      prediction: 'unknown',
      confidence: 0,
      model_version: 'v5',
      error: error.message
    };
  }
}

/**
 * Calculate the 10 features needed for the ML model
 * @param {Object} bidder - User placing the bid
 * @param {Object} task - Task being bid on
 * @returns {Object} 10-feature object for ML prediction
 */
function calculateBidFeatures(bidder, task) {
  // 1. skillMatchScore - How well bidder's skills match task requirements (0-1)
  const skillMatchScore = calculateSkillMatch(bidder.skills, task.skills);

  // 2. creditFairness - Ratio of bid credits to task credits (0-1)
  // Higher ratio = bidder asking for fair compensation
  const creditFairness = Math.min(bidder.credits / Math.max(task.credits, 1), 1);

  // 3. deadlineRealism - How realistic is the bidder's proposed timeline (0-1)
  // Based on estimated hours and their historical completion rate
  const deadlineRealism = calculateDeadlineRealism(task.estimatedHours, bidder);

  // 4. completionRate - Percentage of tasks bidder has completed successfully (0-1)
  const totalTasks = Math.max(bidder.tasksCompleted + (bidder.tasksFailed || 0), 1);
  const completionRate = bidder.tasksCompleted / totalTasks;

  // 5. avgRating - Average rating from previous tasks (0-5, normalized to 0-1)
  const avgRating = bidder.rating / 5;

  // 6. lateRatio - Percentage of tasks completed late (0-1)
  const lateRatio = bidder.lateSubmissions ? bidder.lateSubmissions / Math.max(bidder.tasksCompleted, 1) : 0;

  // 7. workloadScore - Current workload (0-1, where 1 = very busy)
  // Based on active tasks
  const workloadScore = calculateWorkload(bidder);

  // 8. experienceLevel - User experience level (0-5, normalized to 0-1)
  // Based on tasks completed
  const experienceLevel = Math.min(bidder.tasksCompleted / 20, 1);

  // 9. proposalRelevanceScore - How relevant is the proposal to the task (0-1)
  // This is somewhat estimated - could be improved with text analysis
  const proposalRelevanceScore = 0.7; // Default moderate relevance

  // 10. keywordCoverageScore - How many task keywords are mentioned in proposal (0-1)
  const keywordCoverageScore = 0.75; // Default moderate coverage

  return {
    skillMatchScore: Math.max(0, Math.min(skillMatchScore, 1)),
    creditFairness: Math.max(0, Math.min(creditFairness, 1)),
    deadlineRealism: Math.max(0, Math.min(deadlineRealism, 1)),
    completionRate: Math.max(0, Math.min(completionRate, 1)),
    avgRating: Math.max(0, Math.min(avgRating, 1)),
    lateRatio: Math.max(0, Math.min(lateRatio, 1)),
    workloadScore: Math.max(0, Math.min(workloadScore, 1)),
    experienceLevel: Math.max(0, Math.min(experienceLevel, 1)),
    proposalRelevanceScore: Math.max(0, Math.min(proposalRelevanceScore, 1)),
    keywordCoverageScore: Math.max(0, Math.min(keywordCoverageScore, 1))
  };
}

/**
 * Calculate skill match between bidder and task requirements
 * @param {Array} bidderSkills - Skills the bidder has
 * @param {Array} taskSkills - Skills required for task
 * @returns {Number} Match score 0-1
 */
function calculateSkillMatch(bidderSkills = [], taskSkills = []) {
  if (!taskSkills || taskSkills.length === 0) return 0.5;
  if (!bidderSkills || bidderSkills.length === 0) return 0.1;

  const matched = taskSkills.filter(skill =>
    bidderSkills.some(bSkill =>
      bSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(bSkill.toLowerCase())
    )
  );

  return matched.length / taskSkills.length;
}

/**
 * Calculate deadline realism - is the proposed timeline reasonable?
 * @param {Number} estimatedHours - Task estimated hours
 * @param {Object} bidder - Bidder user object
 * @returns {Number} Score 0-1 (1 = very realistic)
 */
function calculateDeadlineRealism(estimatedHours, bidder) {
  // If no historical data, assume moderate realism
  if (bidder.tasksCompleted === 0) return 0.6;

  // Assume bidder's average velocity (tasks/month)
  const avgVelocity = Math.max(bidder.tasksCompleted / 12, 0.1); // Conservative estimate

  // Can they realistically complete this in their available capacity?
  // This is a simplified check
  if (estimatedHours > 40) {
    return 0.5; // Long tasks are riskier
  } else if (estimatedHours > 10) {
    return 0.7; // Medium tasks are reasonable
  } else {
    return 0.85; // Short tasks are usually realistic
  }
}

/**
 * Calculate bidder's current workload
 * @param {Object} bidder - Bidder user object
 * @returns {Number} Score 0-1 (0 = not busy, 1 = very busy)
 */
function calculateWorkload(bidder) {
  // This would ideally query active tasks for this bidder
  // For now, use a simple heuristic
  // If they have completed many tasks recently, they might be busy
  // Conservative estimate: assume 20% utilization by default
  return 0.2;
}

module.exports = {
  getBidPrediction,
  calculateBidFeatures,
  ML_API_URL,
  ML_ENABLED
};
