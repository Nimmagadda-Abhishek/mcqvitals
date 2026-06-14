import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, Send, ChevronLeft, ChevronRight, Bookmark, Grid, ShieldAlert, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Shimmer from '../components/common/Shimmer';
import Proctoring from '../components/Proctoring';
import useScreenCapturePrevention from '../hooks/useScreenCapturePrevention';

const MAX_ATTEMPTS = 2;

const TestInterface = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [attemptBlocked, setAttemptBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Enable screen capture prevention for test-taking
  const handleStartTest = () => {
    // Attempt fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen failed:', err));
    }
    // Trap back button
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
    setHasStarted(true);
  };

  useScreenCapturePrevention(
    (reason) => {
      console.warn('Screen capture attempt detected during test:', reason);
      // Violations are logged via Proctoring component, this is just for logging
    },
    !isSubmitted && user?.role !== 'admin'
  );

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  // Proctoring logic has been extracted to the Proctoring component

  const handleMalpractice = async (reason) => {
    if (isSubmitted) return;

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    try {
      await api.results.reportMalpractice({
        testId,
        reason,
        timeTaken,
        totalQuestions: questions.length
      });
      setIsSubmitted(true);
      alert("Final Warning: Session terminated due to repeated proctoring violations.");
    } catch (error) {
      console.error('Malpractice report failed', error);
      handleSubmit(0);
    }
  };

  const fetchTestData = async () => {
    try {
      // Check existing attempts before loading the test
      const myResults = await api.results.getMyResults().catch(() => []);
      const attemptCount = myResults.filter(r => {
        const tid = r.testId?._id || r.testId;
        return tid === testId;
      }).length;

      if (attemptCount >= MAX_ATTEMPTS) {
        setAttemptBlocked(true);
        setLoading(false);
        return;
      }

      const testData = await api.tests.getById(testId);
      setTestInfo(testData);
      setTimeLeft(testData.duration * 60);

      const qData = await api.tests.getQuestions(testId);
      setQuestions(qData);
    } catch (error) {
      console.error('Failed to fetch test data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted && !loading) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, loading]);

  const handleSelectOption = (questionId, optionIndex, value = null) => {
    const q = questions.find(q => q._id === questionId);
    const qType = q?.questionType || 'single';

    if (qType === 'multiple_choice') {
      const current = answers[questionId] || [];
      const newAnswers = current.includes(optionIndex)
        ? current.filter(idx => idx !== optionIndex)
        : [...current, optionIndex];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else if (qType === 'true_false_matrix') {
      const current = answers[questionId] || {};
      setAnswers({ ...answers, [questionId]: { ...current, [optionIndex]: value } });
    } else {
      setAnswers({ ...answers, [questionId]: optionIndex });
    }
  };

  const handleSubmit = async (finalWarnings = 0) => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const submissionAnswers = questions.map(q => {
      const qType = q.questionType || 'single';
      let isCorrect = false;
      const selected = answers[q._id];

      if (qType === 'multiple_choice') {
        const correctAnswers = q.multipleCorrectAnswers || [];
        const userAnswers = selected || [];
        if (correctAnswers.length === userAnswers.length && correctAnswers.every(v => userAnswers.includes(v))) {
          isCorrect = true;
        }
      } else if (qType === 'true_false_matrix') {
        const correctAnswers = q.trueFalseAnswers || [];
        const userAnswers = selected || {};
        let allMatch = true;
        for (let i = 0; i < q.options.length; i++) {
          if (userAnswers[i] !== correctAnswers[i]) {
            allMatch = false;
            break;
          }
        }
        if (Object.keys(userAnswers).length === q.options.length && allMatch) {
          isCorrect = true;
        }
      } else {
        isCorrect = selected === q.correctAnswer;
      }

      return {
        questionId: q._id,
        selectedOption: selected !== undefined ? selected : null,
        isCorrect
      };
    });

    const correctCount = submissionAnswers.filter(a => a.isCorrect).length;
    const incorrectCount = submissionAnswers.filter(a => !a.isCorrect && a.selectedOption !== null && (!Array.isArray(a.selectedOption) || a.selectedOption.length > 0) && (typeof a.selectedOption !== 'object' || Object.keys(a.selectedOption).length > 0)).length;
    const score = correctCount * 4 - incorrectCount * 1;

    const payload = {
      testId,
      score,
      totalQuestions: questions.length,
      timeTaken,
      answers: submissionAnswers,
      warnings: finalWarnings
    };

    try {
      await api.results.submit(payload);
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Submission error', error);
      if (error.message?.toLowerCase().includes('max 2 attempts') || error.message?.toLowerCase().includes('not allowed')) {
        alert('You have already used all your attempts for this test.');
        navigate('/test');
      } else {
        alert(error.message || 'Submission failed');
      }
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '800px', margin: '6rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div className="section-tonal padding-responsive">
          <div className="primary-gradient" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Send size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Test Submitted Successfully</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', marginBottom: '3rem' }}>
            Your session has been recorded. Performance analysis for Identity {user?._id?.slice(-5).toUpperCase()} is being generated.
          </p>
          <Link to="/results" className="primary-gradient" style={{
            display: 'inline-block',
            padding: '1.2rem 3rem',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            View Performance HUD
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{
          height: '100px',
          background: 'var(--on-surface)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '3rem'
        }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
          <aside><Shimmer width="100%" height="400px" borderRadius="16px" /></aside>
          <main><Shimmer width="100%" height="600px" borderRadius="16px" /></main>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Shimmer width="100%" height="150px" borderRadius="16px" />
            <Shimmer width="100%" height="150px" borderRadius="16px" />
          </aside>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  if (!hasStarted) {
    return (
      <div style={{ maxWidth: '800px', margin: '6rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div className="section-tonal padding-responsive">
          <div className="primary-gradient" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <ShieldAlert size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Secure Test Environment</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', marginBottom: '3rem' }}>
            This assessment will enter fullscreen mode. Navigation buttons will be restricted. Please ensure you have a stable connection and do not exit the browser.
          </p>
          <button onClick={handleStartTest} className="primary-gradient" style={{
            padding: '1.2rem 3rem',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            Enter Fullscreen & Begin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', userSelect: 'none', position: 'relative' }}>
      {/* Proctoring Component */}
      <Proctoring
        testId={testId}
        userId={user?._id}
        isAdmin={user?.role === 'admin'}
        isSubmitted={isSubmitted}
        onTerminate={(reason) => handleMalpractice(reason)}
      />

      {/* Dynamic Watermark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        opacity: 0.08,
        transform: 'rotate(-25deg) scale(1.5)',
        userSelect: 'none'
      }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{
            fontSize: '1.1rem',
            fontWeight: 900,
            color: 'var(--on-surface)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user?.name} | {user?._id?.slice(-8).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Exam Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        padding: '1.5rem 2rem',
        background: 'var(--on-surface)',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{testInfo?.title}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '0.05em' }}>SESSION ID: {testId?.slice(-8).toUpperCase()}-{user?._id?.slice(-5).toUpperCase()}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.2rem', textTransform: 'uppercase' }}>Time Remaining</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatTime(timeLeft)}</div>
          </div>
          <button
            onClick={() => handleSubmit()}
            style={{
              background: 'var(--error)',
              color: 'white',
              padding: '0.8rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800
            }}
          >
            End Session
          </button>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '2rem'
      }}>
        {/* Left Sidebar: Question Palette */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className="card-tonal">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Grid size={18} color="var(--primary)" /> Question Palette
            </h3>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1rem', textTransform: 'uppercase' }}>Assessment Questions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {questions.map((q, idx) => {
                  let isAnswered = false;
                  const ans = answers[q._id];
                  if (ans !== undefined) {
                    if (Array.isArray(ans)) {
                      isAnswered = ans.length > 0;
                    } else if (typeof ans === 'object' && ans !== null) {
                      isAnswered = Object.keys(ans).length > 0;
                    } else {
                      isAnswered = true;
                    }
                  }

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestion(idx)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: idx === currentQuestion ? 'var(--primary)' : (isAnswered ? 'var(--primary-container)' : 'var(--surface-low)'),
                        color: idx === currentQuestion ? 'white' : 'var(--on-surface)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>


          </div>
        </aside>

        {/* Center: Question Content */}
        <main>
          <div className="section-tonal" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Question {currentQuestion < 9 ? `0${currentQuestion + 1}` : currentQuestion + 1}</h2>
              <button style={{ color: 'var(--on-surface-variant)', background: 'none' }}><Bookmark size={24} /></button>
            </div>

            <div style={{ flex: 1 }}>
              {currentQ?.questionType === 'multiple_choice' && (
                <div style={{
                  display: 'inline-block',
                  background: 'var(--primary-container)',
                  color: 'var(--primary)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Multiple Choice (Select one or more)
                </div>
              )}
              {currentQ?.questionType === 'true_false_matrix' && (
                <div style={{
                  display: 'inline-block',
                  background: 'var(--primary-container)',
                  color: 'var(--primary)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  True/False Matrix (Select True or False for each)
                </div>
              )}
              <p style={{ fontSize: '1.4rem', lineHeight: 1.6, color: 'var(--on-surface)', marginBottom: (currentQ?.images && currentQ.images.length > 0) ? '2rem' : '3rem' }}>
                {currentQ?.text}
              </p>


              {currentQ?.images && currentQ.images.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                  {currentQ.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Question"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '16px',
                        background: 'white',
                        border: '1px solid var(--outline-variant)',
                        padding: '8px'
                      }}
                    />
                  ))}
                </div>
              )}


              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentQ?.options?.map((option, index) => {
                  const qType = currentQ.questionType || 'single';
                  let isSelected = false;
                  let matrixValue = null;

                  if (qType === 'multiple_choice') {
                    isSelected = (answers[currentQ._id] || []).includes(index);
                  } else if (qType === 'true_false_matrix') {
                    matrixValue = (answers[currentQ._id] || {})[index];
                    isSelected = matrixValue !== undefined;
                  } else {
                    isSelected = answers[currentQ._id] === index;
                  }

                  return (
                    <div
                      key={index}
                      className={`card-tonal ${isSelected && qType !== 'true_false_matrix' ? 'active' : ''}`}
                      onClick={() => {
                        if (qType !== 'true_false_matrix') handleSelectOption(currentQ._id, index);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        padding: '1.5rem 2rem',
                        width: '100%',
                        textAlign: 'left',
                        border: isSelected && qType !== 'true_false_matrix' ? '2px solid var(--primary)' : '1px solid var(--surface-high)',
                        background: isSelected && qType !== 'true_false_matrix' ? 'var(--primary-container)' : 'var(--surface-lowest)',
                        borderRadius: '16px',
                        cursor: qType === 'true_false_matrix' ? 'default' : 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isSelected && qType !== 'true_false_matrix' ? 'var(--primary)' : 'var(--surface-high)',
                        color: isSelected && qType !== 'true_false_matrix' ? 'white' : 'var(--on-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--on-surface)', marginBottom: (option.images && option.images.length > 0) ? '1rem' : 0 }}>
                          {option.text}
                        </div>

                        {option.images && option.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {option.images.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`Option ${index}`}
                                style={{
                                  width: '100%',
                                  maxHeight: '200px',
                                  objectFit: 'contain',
                                  borderRadius: '8px',
                                  background: 'white',
                                  padding: '4px'
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {qType === 'true_false_matrix' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectOption(currentQ._id, index, true)}
                            style={{
                              padding: '0.6rem 1.2rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              border: matrixValue === true ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                              background: matrixValue === true ? 'var(--primary-container)' : 'var(--surface)',
                              color: matrixValue === true ? 'var(--primary)' : 'var(--on-surface-variant)',
                              cursor: 'pointer'
                            }}
                          >
                            True
                          </button>
                          <button
                            onClick={() => handleSelectOption(currentQ._id, index, false)}
                            style={{
                              padding: '0.6rem 1.2rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              border: matrixValue === false ? '2px solid var(--error)' : '1px solid var(--outline-variant)',
                              background: matrixValue === false ? 'var(--error-container)' : 'var(--surface)',
                              color: matrixValue === false ? 'var(--error)' : 'var(--on-surface-variant)',
                              cursor: 'pointer'
                            }}
                          >
                            False
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--outline-variant)', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', background: 'none' }}
              >
                <ChevronLeft size={20} /> Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="primary-gradient"
                style={{ padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: 800 }}
              >
                {currentQuestion === questions.length - 1 ? 'Submit' : 'Save and Next'}
              </button>
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', background: 'none' }}
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Exam Stats & Rules */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-tonal" style={{ background: 'var(--primary-container)', color: 'var(--primary)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 800 }}>EXAM STATS</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>+15%</div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              You are performing 15% faster than the class average for this module. Keep this pace for optimal results.
            </p>
          </div>

          <div className="card-tonal" style={{ background: '#fff1f1', color: 'var(--error)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} /> Proctored Session
            </h3>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
              Tab switching or browser resizing is strictly prohibited. Your session will be terminated after 3 warnings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TestInterface;
