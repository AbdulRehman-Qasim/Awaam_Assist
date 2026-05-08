import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ChevronLeft,
  Play,
  Pause,
  Info,
  Download,
  Calendar,
  Clock,
  Briefcase,
  Star,
  Share2,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize
} from 'lucide-react';

const Duplications = (transcript) => {
  if (!transcript || transcript.length === 0) return [];
  
  const questionAnswerMap = new Map();
  
  transcript.forEach((item, index) => {
    if (item.question && 
        item.question.trim() && 
        !item.question.includes("Interview ended") &&
        !item.question.includes("Interview completed") &&
        !item.question.includes("time limit reached") &&
        !item.question.includes("interview time has been completed") &&
        item.question !== "Welcome question") {
      
      const key = `${item.question.trim()}-${(item.answer || '').trim()}`;
      
      if (!questionAnswerMap.has(key)) {
        questionAnswerMap.set(key, []);
      }
      
      questionAnswerMap.get(key).push({
        ...item,
        originalIndex: index
      });
    }
  });
  
  const filteredQuestions = [];
  
  questionAnswerMap.forEach((duplicates) => {
    if (duplicates.length === 1) {
     
      filteredQuestions.push(duplicates[0]);
    } else {
      const bestQuestion = duplicates.reduce((best, current) => {
        const currentScore = current.score || 0;
        const bestScore = best.score || 0;
        return currentScore > bestScore ? current : best;
      });
      filteredQuestions.push(bestQuestion);
    }
  });
  
  return filteredQuestions.sort((a, b) => a.originalIndex - b.originalIndex);
};

const InterviewDetailsPage = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProcessingComplete, setVideoProcessingComplete] = useState(false);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${id}`);
        const data = await res.json();
        console.log("data", data);
      
        if (data.transcript && data.transcript.length > 0) {
          const filteredTranscript = Duplications(data.transcript);
          
          const isIntroQuestion = (question?: string) => {
            if (!question || typeof question !== 'string') return false;
            const qLower = question.toLowerCase();
            return qLower.includes('introduce yourself');
          };
          
          data.transcript = filteredTranscript;
          
          const nonIntro = filteredTranscript.filter((q) => !isIntroQuestion(q.question));
          const scores = nonIntro.map((q, index, arr) => 
           (q.score || 0)
          );
          
          const totalScore = scores.reduce((sum, score) => sum + score, 0);
          const averageScore = scores.length > 0 ? totalScore / scores.length : 0;
          data.overallScore = averageScore;
        }
        
        setInterview(data);
        
        if (data.recordingLink) {
          setProcessedVideoUrl(data.recordingLink);
          setVideoProcessingComplete(true);
        }
      } catch (error) {
        console.error('Error fetching interview details:', error);
      }
    };

    fetchInterview();
  }, [id]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (processedVideoUrl && processedVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  // Reload video when processing is complete
  useEffect(() => {
    if (videoProcessingComplete && videoRef.current) {
      console.log('Video processing complete, reloading video element');
      // Force video reload by setting currentTime to 0 and loading
      videoRef.current.load();
      // Reset video state
      setCurrentTime(0);
      setDuration(0);
      setIsVideoLoaded(false);
      
      // Ensure video is ready to play after processing
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Video ready after processing - ensuring proper state');
          // Reset video state
          videoRef.current.currentTime = 0;
          setIsPlaying(false);
          setCurrentTime(0);
          
          // Force video to load metadata
          videoRef.current.load();
          
          // Wait a bit more for metadata to load
          setTimeout(() => {
            if (videoRef.current) {
              console.log('Video metadata loaded, ready to play');
              
            }
          }, 200);
        }
      }, 500);
    }
  }, [videoProcessingComplete]);


  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        try {
          await videoRef.current.play();
          // Force duration check after play starts
          setTimeout(() => {
            if (videoRef.current && videoRef.current.duration > 0) {
              setDuration(videoRef.current.duration);
              console.log('Forced duration update:', videoRef.current.duration);
            }
          }, 100);
        } catch (error) {
          console.error('Play failed:', error);
        }
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showControlsTemporary = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    showControlsTemporary();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const getFilteredQuestions = () => {
    if (!interview || !interview.transcript) return [];
    return interview.transcript; 
  };

  if (!interview) return <div>Loading interview...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/company/interviews">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Interviews
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Interview Results</h1>
            <Badge className="bg-green-500 capitalize">{"Completed"}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <Link to={`/company/jobs/${interview.jobId}`} className="hover:underline">
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="summary">
            <Card>
              <CardHeader className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={interview.candidateAvatar} alt={interview.candidate.name} />
                      <AvatarFallback>{interview.candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-medium">{interview.candidate.name}</h2>
                      <p className="text-sm text-gray-500">{interview.candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {Number(interview.overallScore).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <TabsList className="mt-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="summary">
                <CardContent className="pt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Summary</CardTitle>
                      <CardDescription>
                        A detailed analysis of the candidate's performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {interview.summary ? (
                        <div 
                          className="prose max-w-none"
                          style={{
                            lineHeight: '1.7',
                            fontSize: '15px'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: interview.summary
                              .replace(/<h2>/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">')
                              .replace(/<h3>/g, '<h3 style="font-size: 1.1rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #374151;">')
                              .replace(/<p>/g, '<p style="margin-bottom: 1rem; line-height: 1.7; color: #4b5563;">')
                              .replace(/<ul>/g, '<ul style="margin-bottom: 1.5rem; margin-top: 0.5rem; padding-left: 1.5rem; list-style-type: disc;">')
                              .replace(/<li>/g, '<li style="margin-bottom: 0.5rem; line-height: 1.6; color: #4b5563;">')
                              .replace(/<strong>/g, '<strong style="font-weight: 600; color: #1f2937;">')
                          }}
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No summary available yet.</p>
                          <p className="text-sm mt-2">The summary will be generated after the interview is completed.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </TabsContent>

              <TabsContent value="questions">
                <CardContent className="pt-6 space-y-4">
                  {getFilteredQuestions().map((q, i, arr) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="py-3 bg-gray-50 flex flex-row items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Q{i + 1}:</span>
                          <span className="text-sm">{q.question}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-gray-700">{q.answer}</p>
                        {!(typeof q.question === 'string' && q.question.toLowerCase().includes('introduce yourself')) && (
                          <div className="flex justify-between items-center mt-4 border-t pt-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Info className="h-4 w-4 text-gray-500 mr-1" />
                              </div>
                              <div className="flex items-center ml-4">
                                <Star className={`h-4 w-4 mr-1 ${q.score !== null && q.score !== undefined ? 'text-yellow-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${q.score !== null && q.score !== undefined ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {(q.score !== null && q.score !== undefined ? q.score : 'Not Scored')}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </TabsContent>

              <TabsContent value="recording">
                <CardContent className="pt-6 space-y-6">
                  <div
                    className="relative aspect-video bg-black rounded-md overflow-hidden group"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => setShowControls(true)}
                  >
                    {interview?.recordingLink ? (
                      <>
                        {isProcessingVideo ? (
                          // Show only loading screen during processing
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p>Processing video...</p>
                            </div>
                          </div>
                        ) : (
                        
                          <video
                            ref={videoRef}
                            src={processedVideoUrl || interview.recordingLink}
                            className="w-full h-full"
                            key={processedVideoUrl || interview.recordingLink}
                            preload="metadata"
                            playsInline
                          onPlay={() => {
                            console.log('Video started playing');
                            setIsPlaying(true);

                            // Try to get duration when play starts
                            setTimeout(() => {
                              if (videoRef.current) {
                                const videoDuration = videoRef.current.duration;
                                if (videoDuration && videoDuration > 0 && videoDuration !== Infinity) {
                                  console.log('Duration on play:', videoDuration);
                                  setDuration(videoDuration);
                                  setIsVideoLoaded(true);
                                }
                              }
                            }, 200);

                            // Keep trying for a few seconds
                            const interval = setInterval(() => {
                              if (videoRef.current && (!duration || duration === 0)) {
                                const videoDuration = videoRef.current.duration;
                                if (videoDuration && videoDuration > 0 && videoDuration !== Infinity) {
                                  console.log('Duration found in interval:', videoDuration);
                                  setDuration(videoDuration);
                                  setIsVideoLoaded(true);
                                  clearInterval(interval);
                                }
                              } else {
                                clearInterval(interval);
                              }
                            }, 500);

                            // Clear interval after 10 seconds
                            setTimeout(() => clearInterval(interval), 10000);
                          }}
                          onPause={() => {
                            console.log('Video paused');
                            setIsPlaying(false);
                          }}
                          onTimeUpdate={(e) => {
                            const current = e.currentTarget.currentTime;
                            const total = e.currentTarget.duration;

                            setCurrentTime(current);

                           
                            if (total && total > 0 && (!duration || duration === 0)) {
                              console.log('Got duration from timeupdate:', total);
                              setDuration(total);
                              setIsVideoLoaded(true);
                            }

                            // Also try to get duration directly from video element
                            if ((!duration || duration === 0) && videoRef.current) {
                              const videoDuration = videoRef.current.duration;
                              if (videoDuration && videoDuration > 0 && videoDuration !== Infinity) {
                                console.log('Got duration from video element:', videoDuration);
                                setDuration(videoDuration);
                                setIsVideoLoaded(true);
                              }
                            }
                          }}
                          onLoadedMetadata={(e) => {
                            const videoDuration = e.currentTarget.duration;
                            console.log('Loaded metadata - Duration:', videoDuration);
                            if (videoDuration && videoDuration > 0) {
                              setDuration(videoDuration);
                              setIsVideoLoaded(true);
                            }
                          }}
                          onLoadedData={(e) => {
                            const videoDuration = e.currentTarget.duration;
                            console.log('Loaded data - Duration:', videoDuration);
                            if (videoDuration && videoDuration > 0) {
                              setDuration(videoDuration);
                              setIsVideoLoaded(true);
                            }
                          }}
                          onCanPlay={() => {
                            console.log('Video can play');
                            if (videoRef.current) {
                              const videoDuration = videoRef.current.duration;
                              if (videoDuration && videoDuration > 0 && videoDuration !== Infinity) {
                                console.log('Duration from canplay:', videoDuration);
                                setDuration(videoDuration);
                                setIsVideoLoaded(true);
                              }
                            }
                          }}
                          onDurationChange={(e) => {
                            const videoDuration = e.currentTarget.duration;
                            console.log('Duration changed:', videoDuration);
                            if (videoDuration && videoDuration > 0) {
                              setDuration(videoDuration);
                            }
                          }}
                          onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
                          onError={(e) => {
                            console.error('Video error:', e);
                          }}
                          controls={false}
                        />
                        )}

                        {/* Custom Video Controls Overlay - only show when not processing */}
                        {!isProcessingVideo && (
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                            }`}>

                          {/* Center Play/Pause Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-6">
                              <Button
                                variant="ghost"
                                size="lg"
                                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 w-12 h-12 p-0"
                                onClick={skipBackward}
                              >
                                <SkipBack className="h-6 w-6" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="lg"
                                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 w-16 h-16 p-0"
                                onClick={togglePlayPause}
                              >
                                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="lg"
                                className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 w-12 h-12 p-0"
                                onClick={skipForward}
                              >
                                <SkipForward className="h-6 w-6" />
                              </Button>
                            </div>
                          </div>

                          {/* Bottom Controls */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div
                                className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-1.5 transition-all duration-200 relative"
                                onClick={handleProgressClick}
                              >
                                {/* Background track */}
                                <div className="absolute inset-0 bg-white/20 rounded-full"></div>

                                {/* Progress fill - RED moving line */}
                                <div
                                  className="bg-red-600 h-full rounded-full relative transition-all duration-75 shadow-lg"
                                  style={{
                                    width: `${duration > 0 && currentTime >= 0 ? Math.min((currentTime / duration) * 100, 100) : 0}%`,
                                    minWidth: currentTime > 0 ? '2px' : '0px'
                                  }}
                                >
                                  {/* Moving dot indicator */}
                                  {currentTime > 0 && (
                                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-lg transition-all duration-75 border-2 border-white"></div>
                                  )}
                                </div>

                                {/* Hover indicator */}
                                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="w-full h-full bg-red-500/10 rounded-full"></div>
                                </div>
                              </div>
                            </div>

                            {/* Time Display and Controls */}
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20 border-0 p-2"
                                  onClick={togglePlayPause}
                                  disabled={isProcessingVideo}
                                >
                                  {isProcessingVideo ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  ) : (
                                    isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />
                                  )}
                                </Button>

                                <span className="text-sm font-medium min-w-[100px]">
                                  {isProcessingVideo ? '00:00 / 00:00' : `${formatTime(currentTime)} / ${duration > 0 ? formatTime(duration) : (isVideoLoaded ? 'Live' : 'Loading...')}`}
                                </span>

                                {/* Debug info - remove this in production */}
                                <span className="text-xs text-gray-300 ml-2">
                                  {duration > 0 && `(${Math.round((currentTime / duration) * 100)}%)`}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20 border-0 p-2"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/20 border-0 p-2"
                                  onClick={() => {
                                    if (videoRef.current) {
                                      if (document.fullscreenElement) {
                                        document.exitFullscreen();
                                      } else {
                                        videoRef.current.requestFullscreen();
                                      }
                                    }
                                  }}
                                >
                                  <Maximize className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <p className="text-white text-center">
                          No recording available for this interview.<br />
                          <span className="text-gray-400 text-sm">The recording may still be processing or was not captured.</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </TabsContent>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Score</CardTitle>
              <CardDescription>Overall performance assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pt-1">
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* SVG Circle for score representation */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#e6e6e6"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke={interview.overallScore >= 90 ? '#22c55e' : interview.overallScore >= 75 ? '#3b82f6' : '#f59e0b'}
                        strokeWidth="10"
                        strokeDasharray="282.7"
                        strokeDashoffset={282.7 - (282.7 * interview.overallScore / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {Number(interview.overallScore).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>AI-generated assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="font-semibold mb-1">
                    {interview.overallScore >= 90 ? 'Strong Hire'
                      : interview.overallScore >= 75 ? 'Recommended'
                        : interview.overallScore >= 60 ? 'Consider'
                          : 'Not Recommended'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {interview.overallScore >= 90 ? 'This candidate is an excellent match for the role.'
                      : interview.overallScore >= 75 ? 'This candidate meets the key requirements for the role.'
                        : interview.overallScore >= 60 ? 'This candidate meets some requirements but has gaps.'
                          : 'This candidate does not meet the key requirements.'}
                  </p>
                </div>

                <div className="pt-4 border-t mt-4">
                  <Button className="w-full">
                    Request Second Interview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar Candidates</CardTitle>
              <CardDescription>Others interviewing for this role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Michael Chen" />
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">Michael Chen</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-0.5" />
                    <span className="font-medium">88%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" alt="Lisa Wang" />
                      <AvatarFallback>LW</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">Lisa Wang</div>
                      <div className="text-xs text-gray-500">Product Manager</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-0.5" />
                    <span className="font-medium">94%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default InterviewDetailsPage;