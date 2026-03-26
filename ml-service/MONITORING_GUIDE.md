# Bid Success Predictor - Monitoring Integration Guide

## Quick Start

**Run the monitoring script to see example report:**
```bash
cd ml-service
python monitor_predictions.py
```

This generates:
- `prediction_log.jsonl` - Each bid prediction logged (one JSON per line)
- `monitoring_metrics.json` - Aggregated accuracy metrics + alerts

---

## Integration Points

### 1. **FastAPI Endpoint** (`app/main.py`)

When making a prediction, log it:

```python
from monitor_predictions import PredictionMonitor

monitor = PredictionMonitor()

@app.post("/predict")
async def predict_bid(features: dict):
    # Load model and make prediction
    prediction_prob = model.predict_proba(features)[0][1]
    prediction_label = 1 if prediction_prob > 0.5 else 0
    
    bid_id = features.get("bid_id", "unknown")
    
    # LOG PREDICTION
    monitor.log_prediction(
        bid_id=bid_id,
        features=features,
        prediction_prob=prediction_prob,
        predicted_label=prediction_label
    )
    
    return {
        "bid_id": bid_id,
        "success_probability": prediction_prob,
        "prediction": "likely_success" if prediction_label == 1 else "likely_failure",
        "confidence": 0.8675  # baseline accuracy
    }
```

---

### 2. **Backend Outcome Recording** (After Bid Completes)

When a bid is marked as complete (success/failure), record the outcome:

```javascript
// Backend route: POST /api/bids/:bidId/outcome
router.post('/bids/:bidId/outcome', async (req, res) => {
    const { bidId } = req.params;
    const { success } = req.body; // true or false
    
    // Call Python monitoring script via subprocess or REST endpoint
    const outcome = await recordBidOutcome(bidId, success);
    
    res.json({
        message: "Outcome recorded for model monitoring",
        bid_id: bidId,
        actual_success: success
    });
});
```

Or create a **REST endpoint in FastAPI** to record outcomes:

```python
@app.post("/record-outcome")
async def record_outcome(bid_id: str, actual_success: bool):
    monitor.record_outcome(bid_id, actual_success)
    return {"status": "recorded", "bid_id": bid_id}
```

Then call from Backend:
```bash
curl -X POST http://localhost:8000/record-outcome?bid_id=BID_001&actual_success=true
```

---

### 3. **Automated Monitoring Job** (Check Daily)

Create a scheduled task to check alerts:

```python
# scheduler.py or FastAPI startup hook
from apscheduler.schedulers.background import BackgroundScheduler
import json

def check_model_health():
    monitor = PredictionMonitor()
    alerts = monitor.check_alerts()
    
    if alerts:
        # Send Slack notification
        send_slack(f"[ML MODEL ALERT] {len(alerts)} active alerts")
        for alert in alerts:
            send_slack(f"  {alert['severity']}: {alert['message']}")
    
    # Optionally save to database
    with open("alert_history.jsonl", "a") as f:
        for alert in alerts:
            f.write(json.dumps({"timestamp": datetime.now().isoformat(), **alert}) + "\n")

# Run daily at 8 AM
scheduler = BackgroundScheduler()
scheduler.add_job(check_model_health, 'cron', hour=8)
scheduler.start()
```

---

### 4. **Generate Reports** (Weekly)

```bash
# Weekly report generation
python monitor_predictions.py > monitoring_reports/week_$(date +%Y_%m_%d).txt
```

Or expose via FastAPI:

```python
@app.get("/monitoring/report")
async def get_report():
    metrics = monitor.get_metrics_summary()
    alerts = monitor.check_alerts()
    
    return {
        "metrics": metrics,
        "alerts": alerts,
        "recommendation": generate_recommendation(metrics, alerts)
    }
```

---

## Monitoring Metrics Explained

### Current Files Generated

**`prediction_log.jsonl`** (grows with each prediction)
```json
{
  "timestamp": "2026-03-24T15:30:00",
  "bid_id": "BID_001",
  "prediction_probability": 0.87,
  "predicted_label": 1,
  "actual_outcome": 1,
  "status": "confirmed"
}
```

**`monitoring_metrics.json`** (updated after each outcome)
```json
{
  "total_predictions": 50,
  "total_confirmed": 35,
  "total_pending": 15,
  "current_accuracy": 0.8571,
  "true_positive_rate": 0.89,
  "true_negative_rate": 0.82,
  "baseline_accuracy": 0.8675,
  "accuracy_threshold": 0.81
}
```

---

## Alert Thresholds

| Alert | Trigger | Action |
|-------|---------|--------|
| **Accuracy Degradation** | Drops below 81% | Review recent predictions, check for data drift |
| **Data Drift** | Success rate differs >15% from 54.55% | Real data differs from synthetic, plan retraining |
| **Retraining Ready** | 200+ bids tracked | Collect real data, retrain model with actual patterns |

---

## When Accuracy Drops - Retraining Workflow

1. **Collect real bid history** (first 200+ confirmed outcomes)
2. **Extract features** from real bids (skillMatchScore, completionRate, etc.)
3. **Create new training dataset** merging real data with synthetic baseline
4. **Retrain model** with updated data
5. **Validate** that accuracy improves on new test set
6. **Deploy** new model version to replace old
7. **Reset monitoring** to track new model performance

Retraining script template:
```bash
# Collect 200 real outcomes
python extract_real_features.py --min_outcomes 200

# Retrain
python retrain_model.py --use_real_data --output_model models/bid_success_model_v6_real_data.pkl

# Validate
python validate_model.py models/bid_success_model_v6_real_data.pkl

# Deploy (update app/main.py to load new model)
```

---

## Integration Checklist

- [ ] Add PredictionMonitor import to FastAPI app
- [ ] Call `monitor.log_prediction()` in `/predict` endpoint
- [ ] Create `/record-outcome` endpoint to log bid results
- [ ] Set up daily alert check (email or Slack)
- [ ] Generate weekly reports
- [ ] Plan retraining workflow (after 200 bids)
- [ ] Document how to deploy new model version

---

## Testing Locally

```bash
cd ml-service
python monitor_predictions.py
```

This runs a demo that:
1. Logs a sample prediction
2. Records a successful outcome
3. Prints monitoring report
4. Shows integration examples

Expected output: Report showing 1 prediction, 100% accuracy (since 1 correct prediction).

---

## Next Steps

1. **Now**: Run `python monitor_predictions.py` to verify it works
2. **Next**: Integrate into FastAPI app
3. **Then**: Deploy to production with bid data flowing through
4. **Finally**: Monitor weekly and retrain after 200 real outcomes
