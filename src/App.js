import React, { useState, useEffect } from 'react';
import { config } from './config.js';

function App() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [email, setEmail] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    resumesPerRole: '',
    jobRolesPerMonth: '',
    painLevel: '',
    frustration: ''
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced fullscreen functionality with automatic screen rotation
  const toggleFullscreen = async () => {
    const video = document.getElementById('resume-screener-video');
    const videoContainer = video?.parentElement;
    
    if (!video || !videoContainer) return;
    
    try {
      if (!isFullscreen) {
        // Store current scroll position and video position before entering fullscreen
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const videoRect = videoContainer.getBoundingClientRect();
        
        // Store data in sessionStorage for restoration
        sessionStorage.setItem('preFullscreenScrollPosition', scrollPosition.toString());
        sessionStorage.setItem('preFullscreenVideoTop', videoRect.top.toString());
        
        // For mobile devices, automatically rotate to landscape and enter fullscreen
        if (isMobile) {
          // First, try to lock orientation to landscape
          if (window.screen.orientation && window.screen.orientation.lock) {
            try {
              await window.screen.orientation.lock('landscape');
              setIsLandscape(true);
              console.log('Screen automatically rotated to landscape');
              
              // Small delay to ensure orientation change is applied
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (orientationError) {
              console.log('Could not lock orientation with API:', orientationError);
              // Fallback: Apply CSS rotation for immediate visual feedback
              videoContainer.style.transform = 'rotate(90deg)';
              videoContainer.style.width = '100vh';
              videoContainer.style.height = '100vw';
              videoContainer.style.position = 'fixed';
              videoContainer.style.top = '0';
              videoContainer.style.left = '0';
              videoContainer.style.zIndex = '9999';
              setIsLandscape(true);
              console.log('Applied CSS rotation fallback');
            }
          } else {
            // No Screen Orientation API support, use CSS rotation
            videoContainer.style.transform = 'rotate(90deg)';
            videoContainer.style.width = '100vh';
            videoContainer.style.height = '100vw';
            videoContainer.style.position = 'fixed';
            videoContainer.style.top = '0';
            videoContainer.style.left = '0';
            videoContainer.style.zIndex = '9999';
            setIsLandscape(true);
            console.log('Applied CSS rotation (no API support)');
          }
          
          // Small delay to ensure rotation is applied before fullscreen
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Enter fullscreen
        if (videoContainer.requestFullscreen) {
          await videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
          await videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
          await videoContainer.msRequestFullscreen();
        }
        
        // If we're on mobile and couldn't enter fullscreen, ensure video fills the screen
        if (isMobile && !document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
          // Apply fullscreen-like styling
          videoContainer.style.position = 'fixed';
          videoContainer.style.top = '0';
          videoContainer.style.left = '0';
          videoContainer.style.width = '100vw';
          videoContainer.style.height = '100vh';
          videoContainer.style.zIndex = '9999';
          videoContainer.style.backgroundColor = 'black';
          console.log('Applied mobile fullscreen fallback');
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        
        // Reset orientation and CSS
        if (isMobile) {
          if (window.screen.orientation && window.screen.orientation.unlock) {
            try {
              window.screen.orientation.unlock();
              console.log('Screen orientation unlocked');
            } catch (orientationError) {
              console.log('Could not unlock orientation:', orientationError);
            }
          }
          
          // Reset CSS rotation and fullscreen styling
          if (isLandscape) {
            videoContainer.style.transform = '';
            videoContainer.style.width = '';
            videoContainer.style.height = '';
            videoContainer.style.position = '';
            videoContainer.style.top = '';
            videoContainer.style.left = '';
            videoContainer.style.zIndex = '';
            videoContainer.style.backgroundColor = '';
            setIsLandscape(false);
            console.log('Reset CSS rotation and fullscreen styling');
          }
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // If fullscreen fails, still try to apply mobile-friendly styling
      if (isMobile && !isFullscreen) {
        const videoContainer = document.getElementById('resume-screener-video')?.parentElement;
        if (videoContainer) {
          videoContainer.style.position = 'fixed';
          videoContainer.style.top = '0';
          videoContainer.style.left = '0';
          videoContainer.style.width = '100vw';
          videoContainer.style.height = '100vh';
          videoContainer.style.zIndex = '9999';
          videoContainer.style.backgroundColor = 'black';
          console.log('Applied error fallback styling');
        }
      }
    }
  };

  // Listen for fullscreen changes and handle automatic rotation
  useEffect(() => {
    const handleFullscreenChange = () => {
      const wasFullscreen = isFullscreen;
      const isNowFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement;
      
      setIsFullscreen(isNowFullscreen);
      
      // If we just exited fullscreen and we're on mobile, reset everything
      if (wasFullscreen && !isNowFullscreen && isMobile) {
        // Try to unlock orientation
        if (window.screen.orientation && window.screen.orientation.unlock) {
          try {
            window.screen.orientation.unlock();
            console.log('Screen orientation unlocked on fullscreen exit');
          } catch (orientationError) {
            console.log('Could not unlock orientation on fullscreen exit:', orientationError);
          }
        }
        
        // Reset all CSS styling
        const video = document.getElementById('resume-screener-video');
        const videoContainer = video?.parentElement;
        if (videoContainer) {
          videoContainer.style.transform = '';
          videoContainer.style.width = '';
          videoContainer.style.height = '';
          videoContainer.style.position = '';
          videoContainer.style.top = '';
          videoContainer.style.left = '';
          videoContainer.style.zIndex = '';
          videoContainer.style.backgroundColor = '';
          setIsLandscape(false);
          console.log('Reset all styling on fullscreen exit');
        }
        
        // Restore scroll position with multiple attempts for better reliability
        const restoreScrollPosition = () => {
          const savedScrollPosition = sessionStorage.getItem('preFullscreenScrollPosition');
          const savedVideoTop = sessionStorage.getItem('preFullscreenVideoTop');
          
          if (savedScrollPosition) {
            const scrollPosition = parseInt(savedScrollPosition, 10);
            
            // Method 1: Direct scroll to position
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
            
            // Method 2: If video position was saved, scroll to make video visible
            if (savedVideoTop) {
              const videoTop = parseInt(savedVideoTop, 10);
              const currentVideoRect = videoContainer?.getBoundingClientRect();
              
              if (currentVideoRect && currentVideoRect.top < 0) {
                // Video is above viewport, scroll to bring it into view
                const newScrollPosition = scrollPosition + currentVideoRect.top - 20; // 20px offset
                window.scrollTo({
                  top: newScrollPosition,
                  behavior: 'instant'
                });
              }
            }
            
            // Clean up stored data
            sessionStorage.removeItem('preFullscreenScrollPosition');
            sessionStorage.removeItem('preFullscreenVideoTop');
            
            console.log('Restored scroll position to:', scrollPosition);
          }
        };
        
        // Try to restore scroll position multiple times with delays
        // This handles cases where the DOM takes time to update
        restoreScrollPosition();
        
        // Additional attempts with delays
        setTimeout(restoreScrollPosition, 50);
        setTimeout(restoreScrollPosition, 200);
        setTimeout(restoreScrollPosition, 500);
      }
      
      // If we just entered fullscreen on mobile, ensure proper orientation
      if (!wasFullscreen && isNowFullscreen && isMobile) {
        // Double-check orientation is locked to landscape
        if (window.screen.orientation && window.screen.orientation.lock) {
          setTimeout(async () => {
            try {
              await window.screen.orientation.lock('landscape');
              console.log('Orientation locked to landscape after fullscreen entry');
            } catch (error) {
              console.log('Could not lock orientation after fullscreen entry:', error);
            }
          }, 100);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, isMobile, isLandscape]);

  // Video player functionality
  useEffect(() => {
    const video = document.getElementById('resume-screener-video');
    const overlay = document.getElementById('play-button-overlay');
    
    if (video && overlay) {
      // Mobile-specific video setup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile, ensure video is muted and ready to play
        video.muted = true;
        video.playsInline = true;
        
        // Set video attributes for mobile compatibility
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('x5-playsinline', 'true');
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', 'false');
        
        // Load video metadata
        video.load();
        
        // Preload video for better mobile performance
        video.preload = 'metadata';
      }
      
      const handleVideoEnd = () => {
        overlay.style.display = 'flex';
      };
      
      const handleVideoPlay = () => {
        overlay.style.display = 'none';
        console.log('Video started playing successfully');
      };
      
      const handleVideoLoadedData = () => {
        console.log('Video data loaded successfully');
      };
      
      const handleVideoPause = () => {
        overlay.style.display = 'flex';
      };
      
      const handleVideoError = (e) => {
        console.error('Video error:', e);
        console.log('Video error details:', {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState,
          src: video.currentSrc
        });
        // Show fallback message or image
        overlay.innerHTML = '<div class="text-white text-center"><p>Video unavailable on this device</p><p class="text-sm">Please try on desktop</p></div>';
      };
      
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('play', handleVideoPlay);
      video.addEventListener('pause', handleVideoPause);
      video.addEventListener('error', handleVideoError);
      video.addEventListener('loadeddata', handleVideoLoadedData);
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('play', handleVideoPlay);
        video.removeEventListener('pause', handleVideoPause);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('loadeddata', handleVideoLoadedData);
      };
    }
  }, []);

  const questions = [
    {
      id: 'resumesPerRole',
      question: 'How many resumes do you typically check per job role?',
      options: ['Less than 100', '100–500', '500–1,000', '1,000+']
    },
    {
      id: 'jobRolesPerMonth',
      question: 'On average, how many job roles do you handle per month?',
      options: ['1–5', '6–20', '21–50', '50+']
    },
    {
      id: 'painLevel',
      question: 'How painful or time-consuming is resume screening for you?',
      options: ['1 (Not painful)', '2', '3', '4', '5 (Extremely painful)']
    }
  ];

  const handleJoinClick = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        // Show loading state immediately
        setShowEmailModal(false);
        setShowLoadingMessage(true);
        
        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          setShowLoadingMessage(false);
          setShowEmailModal(true);
          alert('Request timed out. Please try again.');
        }, 15000); // 15 second timeout
        
        // Prepare the data
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('resumesPerRole', '');
        formData.append('jobRolesPerMonth', '');
        formData.append('painLevel', '');
        formData.append('frustration', '');

        // Wait for the save to complete
        const response = await fetch(config.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        });

        // Clear timeout since we got a response
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          console.log('Email saved successfully:', result);
          
          // Only show success after confirming data was saved
          setShowLoadingMessage(false);
          setShowThankYouMessage(true);
          
          // Show questionnaire after thank you message
          setTimeout(() => {
            setShowThankYouMessage(false);
            setShowQuestionnaireModal(true);
          }, 1500);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error saving email:', error);
        
        // Show error state and allow retry
        setShowLoadingMessage(false);
        setShowEmailModal(true);
        
        // You could add a toast notification here for better UX
        alert('Failed to save your email. Please try again.');
      }
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to frustration question
      setCurrentQuestion(questions.length);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to frustration question
      setCurrentQuestion(questions.length);
    }
  };

  const handleQuestionnaireComplete = async () => {
    // Capture the data before resetting state
    const signupData = {
      email: email,
      resumesPerRole: answers.resumesPerRole,
      jobRolesPerMonth: answers.jobRolesPerMonth,
      painLevel: answers.painLevel,
      frustration: answers.frustration
    };

    try {
      // Show loading state
      setShowQuestionnaireModal(false);
      setShowLoadingMessage(true);
      
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setShowLoadingMessage(false);
        setShowQuestionnaireModal(true);
        alert('Request timed out. Please try again.');
      }, 15000); // 15 second timeout
      
      // Prepare the data to send to Google Sheets
      console.log('Sending data to Google Sheets:', signupData);

      // Use the working Form Data method directly (since JSON has CORS issues)
      const formData = new URLSearchParams();
      formData.append('email', signupData.email);
      formData.append('resumesPerRole', signupData.resumesPerRole);
      formData.append('jobRolesPerMonth', signupData.jobRolesPerMonth);
      formData.append('painLevel', signupData.painLevel);
      formData.append('frustration', signupData.frustration);

      const response = await fetch(config.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log('Data saved to Google Sheets successfully:', result);
        
        // Only show success after confirming data was saved
        setShowLoadingMessage(false);
        setShowSuccessModal(true);
        
        // Reset state after successful save
        setCurrentQuestion(0);
        setAnswers({
          resumesPerRole: '',
          jobRolesPerMonth: '',
          painLevel: '',
          frustration: ''
        });
        setEmail('');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      
      // Show error state and allow retry
      setShowLoadingMessage(false);
      setShowQuestionnaireModal(true);
      
      // You could add a toast notification here for better UX
      alert('Failed to save your responses. Please try again.');
    }
  };

  const handleFrustrationChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      frustration: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join the Waitlist</h3>
            <p className="text-gray-600 mb-6">Enter your email to get early access and 50% off your first 3 months.</p>
            
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Message Modal */}
      {showLoadingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6">
              {/* Loading Spinner Animation */}
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {showQuestionnaireModal ? 'Saving Your Responses' : 'Saving Your Information'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showQuestionnaireModal 
                ? 'Please wait while we securely save your questionnaire responses...'
                : 'Please wait while we securely save your email to our waitlist...'
              }
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Message Modal */}
      {showThankYouMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thanks for joining!</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To help shape the product, could you answer 4 quick questions?
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">🎁 Early Access Bonus Secured</p>
              <p className="text-blue-700 text-sm mt-1">You're guaranteed 50% off your first 3 months</p>
            </div>
          </div>
        </div>
      )}

      {/* Questionnaire Modal */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                         <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900">Quick Questions</h3>
                               <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-lg">
                  {currentQuestion + 1} of {questions.length + 1}
                </div>
             </div>

            {currentQuestion < questions.length ? (
              <>
                <h4 className="text-lg font-semibold text-gray-800 mb-6">
                  {questions[currentQuestion].question}
                </h4>
                
                <div className="space-y-3 mb-6">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        answers[questions[currentQuestion].id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                                 <div className="flex flex-col space-y-3">
                   <button
                     onClick={handleNextQuestion}
                     disabled={!answers[questions[currentQuestion].id]}
                     className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                   >
                     {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
                   </button>
                   <button
                     onClick={handleSkipQuestion}
                     className="text-gray-500 text-sm hover:text-gray-700 transition-colors underline"
                   >
                     Skip this question
                   </button>
                 </div>
              </>
            ) : (
              <>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  [Optional] What's your biggest frustration with resume screening?
                </h4>
                <textarea
                  value={answers.frustration}
                  onChange={handleFrustrationChange}
                  placeholder="Tell us about your biggest pain point..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 h-24 resize-none"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleQuestionnaireComplete}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Waitlist!</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for joining our early access waitlist. We’ll reach out as soon as we launch and share your 50% discount code.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold">🎁 Early Access Bonus Secured</p>
              <p className="text-blue-700 text-sm mt-1">You're guaranteed 50% off your first 3 months</p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Stop Wasting Hours 
            <span className="block text-blue-600">Screening Resumes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Upload 1,000+ resumes. Get your top candidates ranked in minutes — not days.
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Fast. Accurate. Actually Affordable.
          </p>

          <div className="flex flex-col items-center space-y-6">
            <button 
              onClick={handleJoinClick}
              className="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Join the Early Access Waitlist
            </button>
                         <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-6 py-4 text-center">
               <div className="flex items-center justify-center space-x-2 mb-1">
                 <span className="text-2xl">🎁</span>
                 <span className="text-lg font-semibold text-purple-800">Early Access Bonus</span>
               </div>
               <p className="text-purple-700 font-medium">Get 50% Off Your First 3 Months</p>
               <p className="text-sm text-purple-600 mt-1">As a thank-you for helping shape the product.</p>
               <p className="text-sm text-red-600 mt-2 font-bold bg-red-50 px-3 py-1 rounded-full inline-block border border-red-200">Limited to the first 100 signups</p>
             </div>
          </div>
        </div>
      </section>

       {/* Video Demo Section */}
       <section className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto text-center">
           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
             See How It Works — In Under 20 Seconds
           </h2>
           <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
             A quick demo of AI-powered resume screening.
           </p>
           
           {/* Video Player */}
           <div className="w-full max-w-6xl mx-auto">
             <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
               <video
                 id="resume-screener-video"
                 className="w-full h-auto aspect-video object-cover mobile-video-fix"
                 preload="metadata"
                 poster="/Screenshot 2025-08-29 172452.png"
                 controls={false}
                 muted
                 playsInline
                 webkit-playsinline="true"
                 x5-playsinline="true"
                 x5-video-player-type="h5"
                 x5-video-player-fullscreen="false"
               >
                 <source src="/video/Resume Screener — Low Res — High Compression.webm" type="video/webm" />
                 Your browser does not support the video tag.
               </video>
               
               {/* Fullscreen Button - Mobile Only */}
               {isMobile && (
                 <button
                   onClick={toggleFullscreen}
                   className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-lg transition-all duration-200 flex items-center space-x-2"
                   title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen & Rotate"}
                 >
                   {isFullscreen ? (
                     <>
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                       </svg>
                       <span className="text-xs font-medium">Exit</span>
                     </>
                   ) : (
                     <>
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                       </svg>
                       <span className="text-xs font-medium">Full</span>
                     </>
                   )}
                 </button>
               )}
               
               {/* Custom Play Button Overlay */}
               <div 
                 id="play-button-overlay"
                 className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer transition-all duration-300 hover:bg-opacity-20"
                 onClick={async () => {
                   const video = document.getElementById('resume-screener-video');
                   const overlay = document.getElementById('play-button-overlay');
                   
                   try {
                     if (video.paused) {
                       // For mobile, ensure video is muted before playing
                       video.muted = true;
                       await video.play();
                     } else {
                       video.pause();
                     }
                   } catch (error) {
                     console.error('Video play error:', error);
                     // Show fallback for mobile devices that can't play video
                     overlay.innerHTML = '<div class="text-white text-center"><p>Video unavailable on this device</p><p class="text-sm">Please try on desktop</p></div>';
                   }
                 }}
               >
                 <div 
                   id="play-button"
                   className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                 >
                   <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z"/>
                   </svg>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Still Screening Resumes 
              <span className="block text-red-600">by Hand?</span>
            </h2>
            
            
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hours Wasted</h3>
              <p className="text-gray-600 leading-relaxed">Reading irrelevant applications that don't match your requirements</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Talent Buried</h3>
              <p className="text-gray-600 leading-relaxed">Great candidates hidden under piles of unqualified applications</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Manual Filtering</h3>
              <p className="text-gray-600 leading-relaxed">Human error leads to missed matches and overlooked talent</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bloated Tools</h3>
              <p className="text-gray-600 leading-relaxed">Most HR tools are overpriced and packed with unnecessary features</p>
            </div>
          </div>
          
                     <p className="text-center mt-16 text-xl font-semibold text-gray-800 bg-white px-8 py-4 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
             You don't have time to waste 
           </p>
         </div>
       </section>

       {/* Solution Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fast. Accurate. Actually Affordable.
              <span className="block text-blue-600">Resume Screening That Delivers</span>
            </h2>

            <p className="text-lg text-gray-600 bg-gray-50 px-6 py-3 rounded-lg inline-block">
              Upload your resumes → Set your criteria → Get an AI-ranked shortlist in minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload 100s or 1000s</h3>
              <p className="text-gray-600 leading-relaxed">Bulk upload resumes at once with our streamlined interface</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Ranking</h3>
              <p className="text-gray-600 leading-relaxed">Advanced AI ranks candidates with human-level precision</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-3xl">📤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Shortlist</h3>
              <p className="text-gray-600 leading-relaxed">Get your ranked candidate list instantly, ready for interviews</p>
            </div>
            
                         <div className="text-center group">
               <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-200 transition-colors duration-200">
                 <span className="text-3xl">💸</span>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget-Friendly</h3>
               <p className="text-gray-600 leading-relaxed">Pay only for what you need, not enterprise fluff.</p>
             </div>
          </div>
          
          <p className="text-center mt-16 text-lg text-gray-600">
            Hire faster — without sacrificing accuracy or your budget.
          </p>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Who It's For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Built for teams that care about speed, accuracy, and saving money</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Founders</h3>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recruiters</h3>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">👔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">HR Managers</h3>
            </div>
            
                         <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                 <span className="text-2xl">👨‍💼</span>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-4">Hiring Managers</h3>
             </div>
           </div>
           
           <p className="text-center mt-12 text-lg text-gray-600 font-medium">
             If hiring matters to you — this was built for you.
           </p>
         </div>
       </section>

      {/* Why It Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Proven technology that delivers results</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Human-Level Precision</h3>
              <p className="text-gray-600 leading-relaxed">AI ranks and filters with accuracy that matches human judgment</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">You Define Criteria</h3>
              <p className="text-gray-600 leading-relaxed">You define what "qualified" looks like — the AI does the rest</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Learning Curve</h3>
              <p className="text-gray-600 leading-relaxed">No clutter, no complexity — just results when you need them</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed">Simple, affordable pricing built for lean hiring teams</p>
            </div>
          </div>
          
                     <div className="text-center mt-16 bg-blue-600 p-12 rounded-lg">
             <h3 className="text-2xl font-bold text-white mb-2">Already trusted by 20+ recruiters and hiring teams</h3>
           </div>
           
           <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
             <div className="flex items-center justify-center mb-4">
               <span className="text-2xl">⭐</span>
               <span className="text-2xl">⭐</span>
               <span className="text-2xl">⭐</span>
               <span className="text-2xl">⭐</span>
               <span className="text-2xl">⭐</span>
             </div>
             <blockquote className="text-lg text-gray-700 italic mb-4">
               "This saved me hours. The rankings were surprisingly accurate."
             </blockquote>
             <p className="text-sm text-gray-500 font-medium">– Startup recruiter from closed beta</p>
           </div>
         </div>
       </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            Accurate, Affordable Resume Screening — Without the Overhead
          </h2>
          <p className="text-xl mb-10 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Be first to screen resumes 10x faster — and actually affordably.
          </p>
          <button 
            onClick={handleJoinClick}
            className="bg-white text-gray-900 px-12 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Join the Early Access Waitlist
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 text-center border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">&copy; 2024 AI Resume Screening. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
