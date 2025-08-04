import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Camera, Volume2, SkipForward, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import skillhuntLogo from '@/assets/skillhunt-logo.png';

interface Question {
  id: number;
  text: string;
  type: 'vocal' | 'typed';
  category: string;
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
    <div className="flex items-end justify-center space-x-1 h-16">
      {bars.map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-2 bg-brand rounded-t-sm transition-all duration-100",
            isRecording ? "animate-pulse-brand" : "bg-muted"
          )}
          style={{
            height: isRecording 
              ? `${Math.random() * audioLevel + 8}px`
              : '8px',
            animationDelay: `${bar * 50}ms`
          }}
        />
      ))}
    </div>
  );
};

interface CameraFeedProps {
  isActive: boolean;
}

const CameraFeed = ({ isActive }: CameraFeedProps) => {
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
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Camera not available</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2">
        <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white">REC</span>
        </div>
      </div>
    </div>
  );
};

export default function InterviewInterface() {
  // Mock interview data
  const [interviewData] = useState<InterviewData>({
    candidateName: "Sarah Johnson",
    position: "Senior Software Engineer",
    questions: [
      {
        id: 1,
        text: "Tell me about yourself and your background in software engineering.",
        type: 'vocal',
        category: 'Introduction'
      },
      {
        id: 2,
        text: "What is the time complexity of a binary search algorithm?",
        type: 'typed',
        category: 'Technical'
      },
      {
        id: 3,
        text: "Describe a challenging project you've worked on and how you overcame obstacles.",
        type: 'vocal',
        category: 'Experience'
      },
      {
        id: 4,
        text: "Solve this problem: Write a function to find the longest palindromic substring.",
        type: 'typed',
        category: 'Coding'
      },
      {
        id: 5,
        text: "Where do you see yourself in 5 years?",
        type: 'vocal',
        category: 'Goals'
      }
    ]
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentQuestion = interviewData.questions[currentQuestionIndex];
  const totalQuestions = interviewData.questions.length;

  // Text-to-speech for question narration
  const speakQuestion = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsNarrating(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsNarrating(false);
      };
      
      utterance.onerror = () => {
        setIsNarrating(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Voice recording simulation
  const toggleRecording = useCallback(() => {
    if (currentQuestion.type === 'vocal') {
      setIsRecording(!isRecording);
      if (!isRecording) {
        // Simulate audio level changes
        const interval = setInterval(() => {
          setAudioLevel(Math.random() * 60 + 20);
        }, 100);
        
        setTimeout(() => {
          clearInterval(interval);
          setAudioLevel(0);
        }, 5000);
      }
    }
  }, [isRecording, currentQuestion.type]);

  // Progress calculation
  useEffect(() => {
    setProgress((currentQuestionIndex / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  // Auto-narrate question when it changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 500);
    }
  }, [currentQuestion, speakQuestion]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTypedAnswer('');
      setIsRecording(false);
      speechSynthesis.cancel(); // Stop any ongoing narration
    }
  };

  const canProceed = () => {
    if (isNarrating) return false;
    if (currentQuestion.type === 'typed') {
      return typedAnswer.trim().length > 0;
    }
    return true; // For vocal questions, assume answer is given
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img 
              src={skillhuntLogo} 
              alt="SkillHunt" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">SkillHunt Interview</h1>
              <p className="text-sm text-muted-foreground">Automated Interview Platform</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{interviewData.candidateName}</p>
            <p className="text-sm text-muted-foreground">{interviewData.position}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Interview Progress</span>
            <span className="text-brand font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed - Takes substantial space */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Candidate Video Feed</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Camera className="w-4 h-4" />
                <span>Live</span>
              </div>
            </div>
            <CameraFeed isActive={true} />
          </Card>
        </div>

        {/* Question Panel */}
        <div className="space-y-6">
          {/* Current Question */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Question</h2>
              <div className="flex items-center space-x-2">
                {currentQuestion.type === 'vocal' ? (
                  <Mic className="w-4 h-4 text-brand" />
                ) : (
                  <Type className="w-4 h-4 text-brand" />
                )}
                <span className="text-sm text-muted-foreground capitalize">
                  {currentQuestion.type} Answer
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-brand mb-2">
                  {currentQuestion.category}
                </p>
                <p className="text-foreground">{currentQuestion.text}</p>
              </div>
              
              {/* Narration Control */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakQuestion(currentQuestion.text)}
                disabled={isNarrating}
                className="w-full"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isNarrating ? 'Speaking...' : 'Repeat Question'}
              </Button>
            </div>
          </Card>

          {/* Answer Interface */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            
            {currentQuestion.type === 'vocal' ? (
              <div className="space-y-4">
                <AudioVisualizer isRecording={isRecording} audioLevel={audioLevel} />
                <Button
                  onClick={toggleRecording}
                  className={cn(
                    "w-full",
                    isRecording 
                      ? "bg-destructive hover:bg-destructive/90 animate-recording" 
                      : "bg-brand hover:bg-brand-dark"
                  )}
                  disabled={isNarrating}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your answer here..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isNarrating}
                />
                <p className="text-xs text-muted-foreground">
                  {typedAnswer.length} characters
                </p>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <Card className="p-6">
            <Button
              onClick={handleNextQuestion}
              disabled={!canProceed() || currentQuestionIndex >= totalQuestions - 1}
              className="w-full bg-brand hover:bg-brand-dark"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              {currentQuestionIndex >= totalQuestions - 1 ? 'Complete Interview' : 'Next Question'}
            </Button>
            
            {isNarrating && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Please wait for the question to finish...
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}