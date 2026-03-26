"""
Bid Success Predictor - Real-Time Monitoring Script
Tracks predictions vs actual outcomes, monitors accuracy degradation, triggers retraining alerts
"""

import json
import os
from datetime import datetime
from pathlib import Path
import pandas as pd


class PredictionMonitor:
    """Monitor model predictions and compare against real outcomes"""
    
    def __init__(self, log_file="prediction_log.jsonl", metrics_file="monitoring_metrics.json"):
        """
        Initialize monitoring system
        
        Args:
            log_file: JSONL file storing bid predictions (one JSON per line)
            metrics_file: JSON file storing aggregated metrics and alerts
        """
        self.log_file = log_file
        self.metrics_file = metrics_file
        self.accuracy_threshold = 0.81  # Alert if drops below this
        self.retraining_threshold_count = 200  # Retrain after 200 tracked bids
        
    def log_prediction(self, bid_id, features, prediction_prob, predicted_label):
        """
        Log a prediction made by the model
        
        Args:
            bid_id: Unique bid identifier
            features: Dict of 10 input features
            prediction_prob: Probability of success (0.0-1.0)
            predicted_label: Binary prediction (0 or 1)
        """
        record = {
            "timestamp": datetime.now().isoformat(),
            "bid_id": bid_id,
            "features": features,
            "prediction_probability": float(prediction_prob),
            "predicted_label": int(predicted_label),
            "actual_outcome": None,  # Will be filled later
            "status": "pending"  # pending, confirmed, incorrect
        }
        
        # Append to log file
        with open(self.log_file, "a") as f:
            f.write(json.dumps(record) + "\n")
        
        return record
    
    def record_outcome(self, bid_id, actual_success):
        """
        Record actual bid outcome after it completes
        
        Args:
            bid_id: Unique bid identifier
            actual_success: Boolean or 0/1 indicating if bid succeeded
        """
        actual_outcome = 1 if actual_success else 0
        
        # Read all predictions
        predictions = self._read_log()
        
        # Find and update the bid
        found = False
        for record in predictions:
            if record["bid_id"] == bid_id:
                record["actual_outcome"] = actual_outcome
                record["status"] = "confirmed"
                found = True
                break
        
        if not found:
            print(f"[WARNING] Bid ID {bid_id} not found in prediction log")
            return None
        
        # Write back updated log
        self._write_log(predictions)
        
        # Recalculate metrics
        self._update_metrics(predictions)
        
        return predictions
    
    def get_accuracy(self):
        """Get current model accuracy on confirmed predictions"""
        predictions = self._read_log()
        confirmed = [p for p in predictions if p["status"] == "confirmed"]
        
        if not confirmed:
            return None
        
        correct = sum(1 for p in confirmed if p["predicted_label"] == p["actual_outcome"])
        accuracy = correct / len(confirmed)
        
        return accuracy
    
    def get_metrics_summary(self):
        """Get comprehensive monitoring metrics"""
        if not os.path.exists(self.metrics_file):
            return None
        
        with open(self.metrics_file, "r") as f:
            return json.load(f)
    
    def check_alerts(self):
        """Check if any alerts should be triggered"""
        metrics = self.get_metrics_summary()
        
        if not metrics:
            return []
        
        alerts = []
        
        # Accuracy degradation alert
        if metrics["current_accuracy"] < self.accuracy_threshold:
            alerts.append({
                "severity": "HIGH",
                "type": "accuracy_degradation",
                "message": f"Accuracy dropped to {metrics['current_accuracy']:.2%} (threshold: {self.accuracy_threshold:.0%})",
                "action": "Consider retraining model with recent real data"
            })
        
        # Retraining threshold alert
        if metrics["total_confirmed"] >= self.retraining_threshold_count:
            alerts.append({
                "severity": "INFO",
                "type": "retraining_recommended",
                "message": f"{metrics['total_confirmed']} bids tracked - good time to retrain",
                "action": "Run retraining script with collected real data"
            })
        
        # Data drift alert (if success rate varies significantly from original 54.55%)
        if metrics["total_confirmed"] >= 50:
            success_rate = metrics["total_successes"] / metrics["total_confirmed"]
            expected_rate = 0.5455
            drift = abs(success_rate - expected_rate)
            
            if drift > 0.15:  # >15% difference
                alerts.append({
                    "severity": "MEDIUM",
                    "type": "data_drift",
                    "message": f"Success rate {success_rate:.2%} differs from expected {expected_rate:.2%}",
                    "action": "Model may need retraining - real data patterns differ from synthetic"
                })
        
        return alerts
    
    def print_report(self):
        """Print monitoring report"""
        metrics = self.get_metrics_summary()
        
        if not metrics:
            print("No monitoring data yet. Start making predictions!")
            return
        
        print("\n" + "="*70)
        print("MODEL PERFORMANCE MONITORING REPORT")
        print("="*70)
        print(f"Generated: {datetime.now().isoformat()}")
        print()
        
        print("PREDICTIONS TRACKED:")
        print(f"  Total predictions:     {metrics['total_predictions']}")
        print(f"  Confirmed outcomes:    {metrics['total_confirmed']}")
        print(f"  Pending outcomes:      {metrics['total_pending']}")
        print()
        
        print("ACCURACY METRICS:")
        if metrics['total_confirmed'] > 0:
            print(f"  Current Accuracy:      {metrics['current_accuracy']:.2%}")
            print(f"  Baseline (Mock Data):  86.75%")
            print(f"  Status:                {'[OK]' if metrics['current_accuracy'] >= 0.81 else '[ALERT]'}")
        else:
            print("  (No confirmed outcomes yet)")
        print()
        
        print("PREDICTION BREAKDOWN:")
        print(f"  Predicted Success:     {metrics['predicted_success']}")
        print(f"  Predicted Failure:     {metrics['predicted_failure']}")
        if metrics['total_confirmed'] > 0:
            print(f"  Actual Successes:      {metrics['total_successes']}")
            print(f"  Actual Failures:       {metrics['total_confirmed'] - metrics['total_successes']}")
            print(f"  True Positive Rate:    {metrics['true_positive_rate']:.2%} (caught successes)")
            print(f"  True Negative Rate:    {metrics['true_negative_rate']:.2%} (caught failures)")
        print()
        
        # Alerts
        alerts = self.check_alerts()
        if alerts:
            print("ACTIVE ALERTS:")
            for alert in alerts:
                print(f"  [{alert['severity']}] {alert['type']}")
                print(f"    Message: {alert['message']}")
                print(f"    Action:  {alert['action']}")
                print()
        else:
            print("ALERTS: None - Model performing well")
        print()
        
        print("RECOMMENDATIONS:")
        if metrics['total_confirmed'] < 50:
            print(f"  • Collect more outcomes ({50 - metrics['total_confirmed']} more bids)")
        elif metrics['total_confirmed'] < 200:
            print(f"  • Continue monitoring ({200 - metrics['total_confirmed']} bids until retraining)")
        else:
            print("  • READY FOR RETRAINING - Collect real data and retrain model")
        print()
        
        print("="*70)
    
    # Private helper methods
    
    def _read_log(self):
        """Read all predictions from log file"""
        if not os.path.exists(self.log_file):
            return []
        
        predictions = []
        with open(self.log_file, "r") as f:
            for line in f:
                if line.strip():
                    predictions.append(json.loads(line))
        
        return predictions
    
    def _write_log(self, predictions):
        """Write predictions back to log file"""
        with open(self.log_file, "w") as f:
            for pred in predictions:
                f.write(json.dumps(pred) + "\n")
    
    def _update_metrics(self, predictions):
        """Calculate and save metrics"""
        confirmed = [p for p in predictions if p["status"] == "confirmed"]
        
        total_predictions = len(predictions)
        total_confirmed = len(confirmed)
        total_pending = len([p for p in predictions if p["status"] == "pending"])
        
        correct = 0
        total_successes = 0
        predicted_success = sum(1 for p in predictions if p["predicted_label"] == 1)
        true_positives = 0
        true_negatives = 0
        
        for p in confirmed:
            if p["predicted_label"] == p["actual_outcome"]:
                correct += 1
            
            if p["actual_outcome"] == 1:
                total_successes += 1
                if p["predicted_label"] == 1:
                    true_positives += 1
            else:
                if p["predicted_label"] == 0:
                    true_negatives += 1
        
        accuracy = correct / total_confirmed if total_confirmed > 0 else 0
        tp_rate = true_positives / total_successes if total_successes > 0 else 0
        tn_rate = true_negatives / (total_confirmed - total_successes) if total_confirmed - total_successes > 0 else 0
        
        metrics = {
            "generated_at": datetime.now().isoformat(),
            "total_predictions": total_predictions,
            "total_confirmed": total_confirmed,
            "total_pending": total_pending,
            "total_successes": total_successes,
            "predicted_success": predicted_success,
            "predicted_failure": total_predictions - predicted_success,
            "current_accuracy": accuracy,
            "true_positive_rate": tp_rate,
            "true_negative_rate": tn_rate,
            "baseline_accuracy": 0.8675,
            "accuracy_threshold": self.accuracy_threshold,
            "retraining_threshold": self.retraining_threshold_count
        }
        
        with open(self.metrics_file, "w") as f:
            json.dump(metrics, f, indent=2)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    monitor = PredictionMonitor()
    
    # Example: Log a prediction
    print("[EXAMPLE] Logging a sample prediction...")
    bid_features = {
        "skillMatchScore": 0.85,
        "creditFairness": 0.9,
        "deadlineRealism": 0.75,
        "completionRate": 0.88,
        "avgRating": 4.5,
        "lateRatio": 0.05,
        "workloadScore": 0.6,
        "experienceLevel": 3,
        "proposalRelevanceScore": 0.92,
        "keywordCoverageScore": 0.88
    }
    
    monitor.log_prediction(
        bid_id="BID_001",
        features=bid_features,
        prediction_prob=0.87,
        predicted_label=1
    )
    print("[OK] Prediction logged for BID_001")
    print()
    
    # Example: Simulate outcome verification
    print("[EXAMPLE] Recording outcome for BID_001 (assume actual success)...")
    monitor.record_outcome(bid_id="BID_001", actual_success=True)
    print("[OK] Outcome recorded - model prediction was correct!")
    print()
    
    # Example: Get metrics
    print("[EXAMPLE] Generating monitoring report...")
    monitor.print_report()
    print()
    
    print("Integration Guide:")
    print("=" * 70)
    print("1. In FastAPI /predict endpoint:")
    print("   monitor.log_prediction(bid_id, features, prob, label)")
    print()
    print("2. When bid completes (from Backend webhook or scheduled job):")
    print("   monitor.record_outcome(bid_id, actual_success)")
    print()
    print("3. Periodic check (daily/weekly):")
    print("   alerts = monitor.check_alerts()")
    print("   if alerts: send_slack_notification(alerts)")
    print()
    print("4. Generate reports:")
    print("   python monitor_predictions.py")
    print("=" * 70)
