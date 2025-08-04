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
  const bars = Array.from({ length: 30 }, (_, i) => i);
  
  return (
    <div className="flex items-end justify-center space-x-1 h-20 p-4 bg-gradient-to-t from-brand/20 to-transparent rounded-lg">
      {bars.map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-1.5 rounded-full transition-all duration-150",
            isRecording 
              ? "bg-gradient-to-t from-brand to-brand-light animate-pulse-brand" 
              : "bg-muted"
          )}
          style={{
            height: isRecording 
              ? `${Math.max(8, Math.random() * audioLevel + 12)}px`
              : '8px',
            animationDelay: `${bar * 30}ms`
          }}
        />
      ))}
    </div>
  );
};

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
}

const Timer = ({ timeLeft, totalTime, isActive }: TimerProps) => {
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;
  const isRunningOut = timeLeft <= 30;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 shadow-lg transition-all duration-300",
      isRunningOut && isActive && "border-destructive bg-destructive/5 animate-timer-pulse"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className={cn(
            "w-4 h-4",
            isRunningOut && isActive ? "text-destructive" : "text-brand"
          )} />
          <span className="text-sm font-medium text-foreground">Time Remaining</span>
        </div>
        <div className={cn(
          "text-2xl font-bold tabular-nums",
          isRunningOut && isActive ? "text-destructive" : "text-brand"
        )}>
          {formatTime(timeLeft)}
        </div>
      </div>
      <div className="space-y-2">
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isRunningOut && isActive && "bg-destructive/20"
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>
    </div>
  );
};

interface CameraFeedProps {
  isActive: boolean;
  candidateName: string;
  position: string;
}

const CameraFeed = ({ isActive, candidateName, position }: CameraFeedProps) => {
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
      
      {/* Recording Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">LIVE</span>
        </div>
      </div>

      {/* Candidate Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate">{candidateName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Briefcase className="w-4 h-4 text-white/70" />
                <p className="text-white/90 text-sm truncate">{position}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    if (currentQuestion.type === 'typed') {
      return typedAnswer.trim().length > 0;
    }
    return !timerActive; // For vocal questions, can proceed when timer is not active
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Enhanced Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b shadow-lg">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={skillhuntLogo} 
                  alt="SkillHunt" 
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                    SkillHunt Interview
                  </h1>
                  <p className="text-sm text-muted-foreground">Automated Interview Platform</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xl font-bold text-foreground">{interviewData.candidateName}</p>
              <p className="text-sm text-muted-foreground">{interviewData.position}</p>
              <Badge variant="outline" className="bg-gradient-to-r from-brand/10 to-brand-light/10 border-brand/30">
                Automated Interview
              </Badge>
            </div>
          </div>
          
          {/* Enhanced Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground">Interview Progress</span>
                <Badge className="bg-gradient-to-r from-brand to-brand-light text-white">
                  {currentQuestion.category}
                </Badge>
              </div>
              <span className="text-lg font-bold text-brand">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-3 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Camera Feed */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-card to-card/50">
            <div className="p-6 bg-gradient-to-r from-brand/5 to-brand-light/5 border-b border-brand/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Candidate Video Feed</h2>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    <Camera className="w-3 h-3 mr-1" />
                    Live Recording
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[450px] w-full">
                <CameraFeed 
                  isActive={true} 
                  candidateName={interviewData.candidateName}
                  position={interviewData.position}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Question Panel */}
        <div className="space-y-6">
          {/* Timer */}
          <div className="animate-fade-in">
            <Timer 
              timeLeft={timeLeft}
              totalTime={currentQuestion.timeLimit}
              isActive={timerActive}
            />
          </div>

          {/* Enhanced Current Question */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <div className="p-6 bg-gradient-to-r from-brand/10 to-brand-light/5 border-b border-brand/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Current Question</h2>
                <div className="flex items-center space-x-2">
                  {currentQuestion.type === 'vocal' ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600">
                      <Mic className="w-3 h-3 mr-1" />
                      Vocal Answer
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600">
                      <Type className="w-3 h-3 mr-1" />
                      Typed Answer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-brand/10">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-brand/10 text-brand border-brand/20">
                    {currentQuestion.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.ceil(currentQuestion.timeLimit / 60)} min limit
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed text-sm">
                    {currentQuestion.text}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Narration Control */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakQuestion(currentQuestion.text)}
                disabled={isNarrating || timerActive}
                className="w-full h-12 bg-gradient-to-r from-background to-muted/50 border-brand/30 hover:border-brand/50 hover:bg-gradient-to-r hover:from-brand/5 hover:to-brand-light/5"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isNarrating ? 'Speaking Question...' : 'Repeat Question'}
              </Button>
            </div>
          </Card>

          {/* Enhanced Answer Interface */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <div className="p-6 bg-gradient-to-r from-brand/5 to-brand-light/5 border-b border-brand/10">
              <h3 className="text-xl font-bold text-foreground">Your Answer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentQuestion.type === 'vocal' 
                  ? 'Speak your answer when the timer starts' 
                  : 'Type your detailed answer below'
                }
              </p>
            </div>
            
            <div className="p-6">
              {currentQuestion.type === 'vocal' ? (
                <div className="space-y-6">
                  <AudioVisualizer isRecording={isRecording} audioLevel={audioLevel} />
                  <div className="text-center space-y-2">
                    {isRecording ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-600">Recording in progress...</span>
                      </div>
                    ) : timerActive ? (
                      <span className="text-sm text-muted-foreground">Ready to record</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Waiting for narration to complete</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your detailed answer here. Be comprehensive and include examples where relevant..."
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    className="min-h-[200px] resize-none text-sm leading-relaxed bg-gradient-to-br from-background to-muted/30 border-brand/20 focus:border-brand/40 focus:ring-brand/20"
                    disabled={isNarrating}
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{typedAnswer.length} characters</span>
                    <span>{typedAnswer.split(/\s+/).filter(word => word.length > 0).length} words</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Enhanced Navigation */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <div className="p-6">
              <Button
                onClick={handleNextQuestion}
                disabled={!canProceed() || currentQuestionIndex >= totalQuestions - 1}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-brand to-brand-light hover:from-brand-dark hover:to-brand shadow-brand hover:shadow-intense transition-all duration-300 transform hover:scale-[1.02]"
              >
                <SkipForward className="w-5 h-5 mr-3" />
                {currentQuestionIndex >= totalQuestions - 1 ? 'Complete Interview' : 'Next Question'}
              </Button>
              
              {isNarrating && (
                <p className="text-xs text-muted-foreground text-center mt-3 animate-pulse">
                  Please wait for the question to finish...
                </p>
              )}
              
              {timerActive && currentQuestion.type === 'vocal' && (
                <p className="text-xs text-green-600 text-center mt-3 animate-bounce-subtle">
                  Recording automatically started - speak your answer now
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}