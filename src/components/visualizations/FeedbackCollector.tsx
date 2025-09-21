import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send, BarChart3, Plane, Zap, Scale, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Aircraft, CalculationResult, Settings, LoadingState } from '@/types/aircraft';

interface FeedbackCollectorProps {
  aircraft: Aircraft;
  calculations: CalculationResult;
  settings: Settings;
  loadingState?: LoadingState;
}

interface VisualizationRating {
  id: string;
  name: string;
  icon: React.ReactNode;
  rating: number;
  comments: string;
}

const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  aircraft,
  calculations,
  settings: _settings,
  loadingState: _loadingState
}) => {
  const [ratings, setRatings] = useState<VisualizationRating[]>([
    { id: 'envelope', name: 'CG Envelope Chart', icon: <BarChart3 className="h-5 w-5" />, rating: 0, comments: '' },
    { id: 'sideview', name: 'Aircraft Side View', icon: <Plane className="h-5 w-5" />, rating: 0, comments: '' },
    { id: 'animated', name: 'Loading Animation', icon: <Zap className="h-5 w-5" />, rating: 0, comments: '' },
    { id: 'balance', name: 'Balance Beam', icon: <Scale className="h-5 w-5" />, rating: 0, comments: '' }
  ]);

  const [overallFeedback, setOverallFeedback] = useState('');
  const [preferredVisualization, setPreferredVisualization] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateRating = (id: string, rating: number) => {
    setRatings(prev => prev.map(item =>
      item.id === id ? { ...item, rating } : item
    ));
  };

  const updateComments = (id: string, comments: string) => {
    setRatings(prev => prev.map(item =>
      item.id === id ? { ...item, comments } : item
    ));
  };

  const handleSubmit = () => {
    // Here you would typically send data to your backend
    console.log('Feedback submitted:', {
      ratings,
      overallFeedback,
      preferredVisualization,
      experienceLevel,
      aircraft: aircraft.registration,
      timestamp: new Date().toISOString()
    });
    setSubmitted(true);
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className={cn(
              "transition-colors",
              star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
            )}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <ThumbsUp className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Thank you for your feedback!</h3>
        <p className="text-muted-foreground">
          Your input helps us improve the visualization experience for all pilots.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Submit More Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Visualization Feedback</h3>
        <p className="text-muted-foreground">
          Help us improve by rating each visualization type and sharing your preferences
        </p>
      </div>

      {/* Individual Visualization Ratings */}
      <div className="space-y-4">
        <h4 className="font-medium">Rate Each Visualization</h4>
        {ratings.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-muted rounded-lg">
                  {item.icon}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{item.name}</h5>
                    <StarRating
                      rating={item.rating}
                      onRatingChange={(rating) => updateRating(item.id, rating)}
                    />
                  </div>

                  <textarea
                    placeholder="Optional comments about this visualization..."
                    value={item.comments}
                    onChange={(e) => updateComments(item.id, e.target.value)}
                    className="w-full p-2 border border-input rounded-md text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Preferences */}
      <div className="space-y-4">
        <h4 className="font-medium">Your Preferences</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Visualization</label>
            <Select value={preferredVisualization} onValueChange={setPreferredVisualization}>
              <SelectTrigger>
                <SelectValue placeholder="Which visualization do you prefer?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="envelope">CG Envelope Chart</SelectItem>
                <SelectItem value="sideview">Aircraft Side View</SelectItem>
                <SelectItem value="animated">Loading Animation</SelectItem>
                <SelectItem value="balance">Balance Beam</SelectItem>
                <SelectItem value="combination">Combination of multiple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level</label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Your aviation experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student Pilot</SelectItem>
                <SelectItem value="private">Private Pilot</SelectItem>
                <SelectItem value="commercial">Commercial Pilot</SelectItem>
                <SelectItem value="instructor">Flight Instructor</SelectItem>
                <SelectItem value="professional">Professional/Airline Pilot</SelectItem>
                <SelectItem value="other">Other Aviation Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Overall Feedback</label>
        <textarea
          placeholder="What features would you like to see? How could we improve the visualizations? Any other suggestions?"
          value={overallFeedback}
          onChange={(e) => setOverallFeedback(e.target.value)}
          className="w-full p-3 border border-input rounded-md resize-none"
          rows={4}
        />
      </div>

      {/* Current Session Info */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Current Session Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Aircraft</div>
              <div className="text-muted-foreground">{aircraft.registration}</div>
            </div>
            <div>
              <div className="font-medium">Total Weight</div>
              <div className="text-muted-foreground">
                {Math.round(calculations.totalWeight)} lbs
              </div>
            </div>
            <div>
              <div className="font-medium">CG Position</div>
              <div className="text-muted-foreground">
                {calculations.cgPosition.toFixed(1)}"
              </div>
            </div>
            <div>
              <div className="font-medium">Balance Status</div>
              <div className={cn(
                "font-medium",
                calculations.withinEnvelope ? "text-green-600" : "text-red-600"
              )}>
                {calculations.withinEnvelope ? "BALANCED" : "OUT OF BALANCE"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="flex items-center space-x-2"
          disabled={ratings.every(r => r.rating === 0)}
        >
          <Send className="h-4 w-4" />
          <span>Submit Feedback</span>
        </Button>
      </div>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
        Your feedback is anonymous and helps improve the application for all users.
        No personal information or flight data is transmitted.
      </p>
    </div>
  );
};

export default FeedbackCollector;