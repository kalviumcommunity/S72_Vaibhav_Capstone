"""
CredBuzz Mock Dataset Generator
Generates realistic bid/task/worker data for ML model training
Based on actual CredBuzz auction mechanics
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from pathlib import Path

np.random.seed(42)
random.seed(42)

# Output path
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ============================================================================
# REALISTIC DATA GENERATION
# ============================================================================

def generate_worker_profiles(n_workers=500):
    """Generate realistic worker profiles"""
    workers = []
    for i in range(n_workers):
        # Skill distribution - some workers specialized, some generalists
        num_skills = np.random.choice([1, 2, 3, 4, 5], p=[0.15, 0.25, 0.35, 0.18, 0.07])
        skills = list(np.random.choice(
            ["Python", "React", "Node.js", "Design", "Writing", "Video", "Marketing", "Data Analysis", "DevOps", "UI/UX"],
            size=num_skills,
            replace=False
        ))
        
        # Experience: beta distribution (realistic - most are mid-level)
        experience_score = np.random.beta(2, 5)  # Skewed toward 0-0.5
        completed_tasks = int(experience_score * 100)  # 0-100 tasks
        
        # Reliability: highly correlated with experience for realism
        if experience_score > 0.7:
            completion_rate = np.random.beta(9, 1)  # 90%+ completion rate
            avg_rating = np.random.beta(8, 1.5)  # 4.5-5.0 stars
        elif experience_score > 0.4:
            completion_rate = np.random.beta(5, 2)  # 60-85%
            avg_rating = np.random.beta(5, 2)  # 3-4.5 stars
        else:
            completion_rate = np.random.beta(3, 3)  # 30-70%
            avg_rating = np.random.beta(3, 4)  # 2-4 stars
        
        late_deliveries = max(0, int(completed_tasks * (1 - completion_rate) * 0.3))
        late_ratio = late_deliveries / max(1, completed_tasks)
        
        workers.append({
            'worker_id': f'WORKER_{i:04d}',
            'skills': '|'.join(skills),
            'completed_tasks': completed_tasks,
            'completion_rate': min(1.0, completion_rate),
            'avg_rating': min(5.0, avg_rating * 5),  # Scale to 0-5
            'late_ratio': min(1.0, late_ratio),
            'current_active_tasks': np.random.poisson(2),  # Poisson for realistic active workload
            'total_credits_earned': int(experience_score * 5000),
        })
    return pd.DataFrame(workers)


def generate_tasks(n_tasks=300):
    """Generate realistic task postings"""
    tasks = []
    categories = ["Design", "Development", "Writing", "Marketing", "Data Analysis", "Video", "DevOps", "UI/UX"]
    
    for i in range(n_tasks):
        category = random.choice(categories)
        
        # Task complexity/credits: realistic distribution
        if random.random() < 0.6:  # 60% small tasks
            credits = np.random.randint(50, 200)
        elif random.random() < 0.3:  # 30% medium
            credits = np.random.randint(200, 500)
        else:  # 10% high-value
            credits = np.random.randint(500, 2000)
        
        # Deadline: 3-30 days from now
        days_to_deadline = np.random.randint(3, 31)
        deadline = (datetime.now() + timedelta(days=days_to_deadline)).isoformat()
        
        # Complexity (inferred from credits and category)
        complexity = min(10, 1 + credits // 200)
        
        tasks.append({
            'task_id': f'TASK_{i:04d}',
            'category': category,
            'title': f'{category} Task #{i}',
            'credits': credits,
            'days_to_deadline': days_to_deadline,
            'complexity': complexity,
            'max_bidders': np.random.choice([3, 5, 8, 10]),  # Your maxBidders field
            'num_bids_received': np.random.poisson(4),  # Average 4 bids per task
        })
    return pd.DataFrame(tasks)


def generate_bids_with_outcomes(workers_df, tasks_df, n_bids=2000):
    """Generate individual bids + whether they were selected + task success"""
    bids = []
    
    for _ in range(n_bids):
        worker = workers_df.sample(1).iloc[0]
        task = tasks_df.sample(1).iloc[0]
        
        # Worker proposes credits and timeline
        min_credits = task['credits'] * np.random.uniform(0.5, 1.0)  # Some negotiate down
        max_credits = task['credits'] * np.random.uniform(1.0, 1.5)  # Some ask more
        proposed_credits = int(np.random.uniform(min_credits, max_credits))
        
        proposed_days = int(task['days_to_deadline'] * np.random.uniform(0.5, 1.2))
        proposed_days = max(1, min(proposed_days, task['days_to_deadline']))
        
        # Proposal message quality (word count proxy)
        message_quality = np.random.randint(10, 300)  # Words in proposal
        
        # Feature engineering: score this bid
        skill_match = 0.7 if len(task['category'].split()) > 0 else 0.3
        for skill in worker['skills'].split('|'):
            if task['category'].lower() in skill.lower() or skill.lower() in task['category'].lower():
                skill_match = 0.9
                break
        
        credit_fairness = 1.0 - abs(proposed_credits - task['credits']) / max(1, task['credits'])
        deadline_realism = min(1.0, proposed_days / max(1, task['days_to_deadline']))
        
        # Outcome: was bid selected? Did task complete successfully?
        # This is the TARGET LABEL
        selection_prob = (
            0.3 * skill_match +
            0.3 * credit_fairness +
            0.2 * deadline_realism +
            0.2 * worker['completion_rate']
        )
        bid_selected = random.random() < selection_prob
        
        task_success = bid_selected and (random.random() < worker['completion_rate'])
        
        bids.append({
            'bid_id': f'BID_{len(bids):05d}',
            'task_id': task['task_id'],
            'worker_id': worker['worker_id'],
            'proposed_credits': proposed_credits,
            'proposed_days': proposed_days,
            'message_length': message_quality,
            'worker_completed_tasks': worker['completed_tasks'],
            'worker_completion_rate': worker['completion_rate'],
            'worker_avg_rating': worker['avg_rating'],
            'worker_late_ratio': worker['late_ratio'],
            'worker_active_tasks': worker['current_active_tasks'],
            'task_credits': task['credits'],
            'task_days': task['days_to_deadline'],
            'task_complexity': task['complexity'],
            'bid_selected': 1 if bid_selected else 0,
            'task_completed_successfully': 1 if task_success else 0,
        })
    
    return pd.DataFrame(bids)


def generate_training_features(bids_df):
    """Convert raw bids into ML-ready features"""
    df = bids_df.copy()
    
    # Feature 1: Skill match (simplified for mock data)
    df['skillMatchScore'] = np.random.uniform(0.3, 1.0, len(df))
    
    # Feature 2: Credit fairness
    df['creditFairness'] = 1.0 - np.abs(df['proposed_credits'] - df['task_credits']) / df['task_credits'].clip(lower=1)
    df['creditFairness'] = df['creditFairness'].clip(0, 1)
    
    # Feature 3: Deadline realism
    df['deadlineRealism'] = (df['proposed_days'] / df['task_days']).clip(0, 1)
    
    # Feature 4-6: Worker features (already in df)
    df['completionRate'] = df['worker_completion_rate']
    df['avgRating'] = df['worker_avg_rating'] / 5.0  # Normalize to 0-1
    df['lateRatio'] = df['worker_late_ratio']
    
    # Feature 7: Workload score (0 = new, 1 = max workload)
    df['workloadScore'] = (df['worker_active_tasks'] / 10).clip(0, 1)
    
    # Feature 8: Experience level (log scale)
    df['experienceLevel'] = np.log1p(df['worker_completed_tasks']) / np.log1p(100)
    
    # Feature 9-10: Proposal sentiment/relevance (simulated)
    df['proposalRelevanceScore'] = np.random.uniform(0.2, 1.0, len(df))
    df['keywordCoverageScore'] = np.random.uniform(0.2, 1.0, len(df))
    
    # Target label: bid success (selected + completed)
    df['success'] = df['task_completed_successfully']
    
    return df[[
        'skillMatchScore', 'creditFairness', 'deadlineRealism',
        'completionRate', 'avgRating', 'lateRatio',
        'workloadScore', 'experienceLevel', 'proposalRelevanceScore',
        'keywordCoverageScore', 'success'
    ]]


def main():
    print("🤖 Generating CredBuzz Mock Dataset...")
    print("=" * 60)
    
    # Step 1: Workers
    print("\n📊 Generating 500 worker profiles...")
    workers = generate_worker_profiles(500)
    print(f"   ✓ Generated {len(workers)} workers")
    print(f"   - Avg completed tasks: {workers['completed_tasks'].mean():.1f}")
    print(f"   - Avg completion rate: {workers['completion_rate'].mean():.1%}")
    print(f"   - Avg rating: {workers['avg_rating'].mean():.2f}/5")
    
    # Step 2: Tasks
    print("\n📋 Generating 300 task postings...")
    tasks = generate_tasks(300)
    print(f"   ✓ Generated {len(tasks)} tasks")
    print(f"   - Avg credits: {tasks['credits'].mean():.0f}")
    print(f"   - Avg deadline: {tasks['days_to_deadline'].mean():.1f} days")
    
    # Step 3: Bids + Outcomes
    print("\n💬 Generating 2000 bids with success labels...")
    bids = generate_bids_with_outcomes(workers, tasks, 2000)
    print(f"   ✓ Generated {len(bids)} bids")
    print(f"   - Bid success rate: {bids['bid_selected'].mean():.1%}")
    print(f"   - Task completion rate: {bids['task_completed_successfully'].mean():.1%}")
    
    # Step 4: Feature engineering
    print("\n⚙️  Engineering ML features...")
    training_data = generate_training_features(bids)
    print(f"   ✓ Created {len(training_data)} training samples")
    print(f"   - Features: {list(training_data.columns[:-1])}")
    print(f"   - Label distribution:")
    print(f"     Success=1: {(training_data['success']==1).sum()} ({training_data['success'].mean():.1%})")
    print(f"     Success=0: {(training_data['success']==0).sum()} ({(1-training_data['success'].mean()):.1%})")
    
    # Step 5: Save
    print("\n💾 Saving datasets...")
    training_data.to_csv(DATA_DIR / "mock_training_data.csv", index=False)
    workers.to_csv(DATA_DIR / "mock_workers.csv", index=False)
    tasks.to_csv(DATA_DIR / "mock_tasks.csv", index=False)
    bids.to_csv(DATA_DIR / "mock_bids.csv", index=False)
    
    print(f"   ✓ Saved to {DATA_DIR}/")
    print(f"     - mock_training_data.csv ({len(training_data)} rows)")
    print(f"     - mock_workers.csv ({len(workers)} rows)")
    print(f"     - mock_tasks.csv ({len(tasks)} rows)")
    print(f"     - mock_bids.csv ({len(bids)} rows)")
    
    print("\n" + "="*60)
    print("✅ Mock dataset ready for training!")
    print("="*60)


if __name__ == "__main__":
    main()
