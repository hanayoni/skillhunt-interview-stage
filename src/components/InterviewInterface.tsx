import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Camera, Volume2, SkipForward, Type, Clock, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import skillhuntLogo from '@/assets/skillhunt-logo.png';

interface Question {
  id: number;
  text: string;
  type: 'vocal' | 'typed';
  category: string;
  timeLimit: number; // in seconds
}

interface InterviewData {
  candidateName: string;
  position: string;
  questions: Question[];
}

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel: number;
}

const AudioVisualizer = ({ isRecording, audioLevel }: AudioVisualizerProps) => {
  const bars = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="flex items-end justify-center space-x-0.5 h-6 p-1 bg-gradient-to-t from-brand/30 to-transparent rounded">
      {bars.map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-0.5 rounded-full transition-all duration-150",
            isRecording 
              ? "bg-gradient-to-t from-brand to-brand-light animate-pulse-brand" 
              : "bg-muted"
          )}
          style={{
            height: isRecording 
              ? `${Math.max(3, Math.random() * audioLevel + 6)}px`
              : '3px',
            animationDelay: `${bar * 25}ms`
          }}
        />
      ))}
    </div>
  );
};

// Remove the separate Timer component since it's now inline

interface CameraFeedProps {
  isActive: boolean;
  candidateName: string;
  position: string;
  currentQuestion: Question;
  isRecording: boolean;
  isNarrating: boolean;
  typedAnswer: string;
  setTypedAnswer: (value: string) => void;
  audioLevel: number;
  timerActive: boolean;
}

const CameraFeed = ({ 
  isActive, 
  candidateName, 
  position, 
  currentQuestion,
  isRecording,
  isNarrating,
  typedAnswer,
  setTypedAnswer,
  audioLevel,
  timerActive
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    if (isActive) {
      setupCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-intense">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Camera not available</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Please check camera permissions</p>
          </div>
        </div>
      )}
      
      {/* Recording Status Overlay */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">REC</span>
        </div>
      </div>

      {/* Recording Description Overlay */}
      {currentQuestion.type === 'vocal' && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/10 max-w-xs">
            {isRecording ? (
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-white font-medium">Recording in progress...</span>
              </div>
            ) : timerActive ? (
              <span className="text-xs text-white font-medium">Recording automatically started - speak your answer now</span>
            ) : (
              <span className="text-xs text-white/80 font-medium">Waiting for narration</span>
            )}
          </div>
        </div>
      )}


      {/* Decorative Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-brand/20 pointer-events-none" />
    </div>
  );
};

export default function InterviewInterface() {
  // Mock interview data with longer questions
  const [interviewData] = useState<InterviewData>({
    candidateName: "Sarah Johnson",
    position: "Senior Software Engineer",
    questions: [
      {
        id: 1,
        text: "Tell me about yourself, your educational background, and your journey in software engineering. What initially drew you to this field, and how have your experiences shaped your approach to problem-solving and team collaboration?",
        type: 'vocal',
        category: 'Introduction & Background',
        timeLimit: 180
      },
      {
        id: 2,
        text: "Explain the time and space complexity of a binary search algorithm. Additionally, describe a scenario where you might choose a different search algorithm and justify your choice with specific examples from real-world applications.",
        type: 'typed',
        category: 'Data Structures & Algorithms',
        timeLimit: 300
      },
      {
        id: 3,
        text: "Describe the most challenging technical project you've worked on in the past two years. What made it challenging, what technologies did you use, how did you overcome obstacles, and what would you do differently if you had to approach the same problem today?",
        type: 'vocal',
        category: 'Project Experience & Problem Solving',
        timeLimit: 240
      },
      {
        id: 4,
        text: "Write a function in your preferred programming language that finds the longest palindromic substring in a given string. Explain your approach, analyze the time complexity, and discuss how you would optimize it for very large strings. Please include error handling and edge cases in your solution.",
        type: 'typed',
        category: 'Coding & Implementation',
        timeLimit: 600
      },
      {
        id: 5,
        text: "Where do you see yourself professionally in the next 5 years? How does this role align with your career goals, and what specific skills or technologies are you most excited to learn and master in this position?",
        type: 'vocal',
        category: 'Career Goals & Vision',
        timeLimit: 120
      }
    ]
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const currentQuestion = interviewData.questions[currentQuestionIndex];
  const totalQuestions = interviewData.questions.length;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setIsRecording(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Auto-record for vocal questions when timer starts
  useEffect(() => {
    if (timerActive && currentQuestion.type === 'vocal' && !isRecording) {
      setIsRecording(true);
      // Simulate audio level changes
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 80 + 20);
      }, 150);
      
      // Clean up when recording stops or timer ends
      return () => {
        clearInterval(interval);
        setAudioLevel(0);
      };
    }
  }, [timerActive, currentQuestion.type, isRecording]);

  // Text-to-speech for question narration
  const speakQuestion = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsNarrating(true);
      setTimerActive(false);
      setIsRecording(false);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsNarrating(false);
        // Start timer and auto-record after narration
        setTimeLeft(currentQuestion.timeLimit);
        setTimerActive(true);
      };
      
      utterance.onerror = () => {
        setIsNarrating(false);
        setTimeLeft(currentQuestion.timeLimit);
        setTimerActive(true);
      };
      
      speechSynthesis.speak(utterance);
    }
  }, [currentQuestion.timeLimit]);

  // Progress calculation
  useEffect(() => {
    setProgress((currentQuestionIndex / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  // Auto-narrate question when it changes
  useEffect(() => {
    if (currentQuestion) {
      setTypedAnswer('');
      setIsRecording(false);
      setTimerActive(false);
      speechSynthesis.cancel();
      
      setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 800);
    }
  }, [currentQuestion, speakQuestion]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimerActive(false);
      setIsRecording(false);
      speechSynthesis.cancel();
    }
  };

  const canProceed = () => {
    if (isNarrating) return false;
    return true; // Allow proceeding after narration, no answer required
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/10 to-brand/5 overflow-hidden flex flex-col">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-card/95 to-muted/95 backdrop-blur-md border-b border-brand/20 shadow-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={skillhuntLogo} 
                alt="SkillHunt" 
                className="h-6 w-auto"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                SkillHunt
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-gradient-to-r from-brand/20 to-brand-light/15 border-brand/40 text-xs font-medium">
                {currentQuestion.category}
              </Badge>
              <span className="text-sm font-bold text-brand">
                {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>
          
          {/* Enhanced Progress */}
          <div className="mt-2 relative">
            <div className="h-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand via-brand-light to-brand transition-all duration-500 ease-out rounded-full shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute -top-1 transition-all duration-500 ease-out" style={{ left: `${progress}%` }}>
              <div className="w-4 h-4 bg-gradient-to-br from-brand to-brand-light rounded-full shadow-lg border-2 border-background transform -translate-x-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex gap-6 min-h-0 overflow-hidden">
        {/* Left Side - Question (Prominent Display) */}
        <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 shadow-xl border border-brand/15 bg-gradient-to-br from-card/95 to-muted/50 backdrop-blur-sm flex flex-col min-h-0">
            <div className="px-6 py-4 bg-gradient-to-r from-brand/15 to-brand-light/10 border-b border-brand/20 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Current Question</h2>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-gradient-to-r from-brand/20 to-brand-light/15 text-brand border-brand/30 text-sm font-medium">
                    {currentQuestion.category}
                  </Badge>
                  {currentQuestion.type === 'vocal' ? (
                    <Badge className="bg-gradient-to-r from-green-500/90 to-green-600/90 text-white text-sm shadow-sm">
                      <Mic className="w-3 h-3 mr-1" />
                      Vocal Answer
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white text-sm shadow-sm">
                      <Type className="w-3 h-3 mr-1" />
                      Typed Answer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6 flex flex-col gap-6 h-full">
                {/* Question Text */}
                <div className="flex-shrink-0 p-6 bg-gradient-to-br from-background/80 to-muted/40 rounded-xl border border-brand/15">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-foreground leading-relaxed text-lg font-medium">
                      {currentQuestion.text}
                    </p>
                  </div>
                </div>
                
                {/* Answer Section for Typed Questions */}
                {currentQuestion.type === 'typed' && (
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-background/60 to-muted/30 rounded-xl border border-brand/10 p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Your Answer</h3>
                      <Textarea
                        placeholder="Type your detailed answer here..."
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        className="min-h-32 max-h-48 resize-none text-base bg-background/80 border-brand/20 focus:border-brand/40 focus:ring-brand/20"
                        disabled={isNarrating}
                      />
                      <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                        <span>{typedAnswer.length} characters</span>
                        <span>{typedAnswer.split(/\s+/).filter(word => word.length > 0).length} words</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {/* Fixed Bottom Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 bg-gradient-to-r from-card/90 to-muted/50 border border-brand/15 rounded-xl shadow-lg">
            <Button
              variant="outline"
              onClick={() => speakQuestion(currentQuestion.text)}
              disabled={isNarrating || timerActive}
              className="h-11 px-6 bg-gradient-to-r from-background/90 to-muted/60 border-brand/40 hover:border-brand/60 hover:bg-gradient-to-r hover:from-brand/5 hover:to-brand-light/5"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isNarrating ? 'Speaking Question...' : 'Repeat Question'}
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={!canProceed() || currentQuestionIndex >= totalQuestions - 1}
              className="flex-1 h-11 text-base font-bold bg-gradient-to-r from-brand via-brand-light to-brand hover:from-brand-dark hover:via-brand hover:to-brand-light shadow-lg hover:shadow-xl transition-all duration-300 border border-brand/20"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              {currentQuestionIndex >= totalQuestions - 1 ? 'Complete Interview' : 'Next Question'}
            </Button>
          </div>
        </div>

        {/* Right Side - Timer and Video Feed */}
        <div className="w-96 flex flex-col gap-6">
          {/* Timer Section */}
          <div className="flex-shrink-0">
            <div className={cn(
              "bg-gradient-to-br from-card/80 to-muted/40 border border-brand/20 rounded-xl p-4 shadow-lg transition-all duration-300",
              timeLeft <= 30 && timerActive && "border-destructive/60 bg-gradient-to-br from-destructive/10 to-destructive/5 animate-timer-pulse"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className={cn(
                    "w-5 h-5",
                    timeLeft <= 30 && timerActive ? "text-destructive" : "text-brand"
                  )} />
                  <span className="text-base font-semibold text-foreground">Time Left</span>
                </div>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  timeLeft <= 30 && timerActive ? "text-destructive" : "text-brand"
                )}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-muted/60 to-muted/40 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out rounded-full",
                      timeLeft <= 30 && timerActive 
                        ? "bg-gradient-to-r from-destructive via-destructive/80 to-destructive animate-pulse" 
                        : "bg-gradient-to-r from-brand via-brand-light to-brand"
                    )}
                    style={{ width: `${((currentQuestion.timeLimit - timeLeft) / currentQuestion.timeLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Video Feed */}
          <div className="flex-1 min-h-0">
            <Card className="h-full overflow-hidden shadow-xl border border-brand/10 bg-gradient-to-br from-card/90 to-muted/30 flex flex-col">
              <div className="px-3 py-2 bg-gradient-to-r from-brand/10 to-brand-light/8 border-b border-brand/15 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Video Feed</h3>
                  <Badge variant="outline" className="bg-gradient-to-r from-green-500/20 to-green-400/15 border-green-500/40 text-green-700 text-xs">
                    <Camera className="w-2 h-2 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
              <div className="flex-1 p-3 min-h-0">
                <div className="h-full rounded-lg overflow-hidden">
                  <CameraFeed 
                    isActive={true} 
                    candidateName={interviewData.candidateName}
                    position={interviewData.position}
                    currentQuestion={currentQuestion}
                    isRecording={isRecording}
                    isNarrating={isNarrating}
                    typedAnswer={typedAnswer}
                    setTypedAnswer={setTypedAnswer}
                    audioLevel={audioLevel}
                    timerActive={timerActive}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}