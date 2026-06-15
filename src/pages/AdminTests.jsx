import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  FilePlus, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Eye,
  Edit2
} from 'lucide-react';
import api from '../services/api';
import { CardShimmer } from '../components/common/Shimmer';


const MultiImageUploader = ({ images, onChange }) => {
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    let uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.admin.uploadMedia(formData);
        uploadedUrls.push(res.url);
      } catch (err) { alert('Upload failed'); }
    }
    onChange([...(images || []), ...uploadedUrls]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '0.5rem' }}>
      {(images || []).map((img, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {img && <img src={img} style={{ height: '32px', width: '32px', objectFit: 'cover', borderRadius: '6px' }} />}
          <input className="input-premium" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }} value={img} onChange={(e) => {
            const newImages = [...images];
            newImages[i] = e.target.value;
            onChange(newImages);
          }} placeholder="Image URL..." />
          <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} style={{ background: 'var(--error-container)', color: 'var(--error)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={() => onChange([...(images || []), ''])} style={{ padding: '0.6rem 1rem', background: 'var(--surface-high)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', color: 'var(--on-surface)' }}>
          + Add URL
        </button>
        <label style={{ padding: '0.6rem 1rem', background: 'var(--surface-high)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
          <UploadCloud size={16} /> Upload Files
          <input type="file" multiple hidden onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
};

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [detailedTest, setDetailedTest] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: '',
    duration: 60,
    difficulty: 'Beginner',
    rating: 5,
    isFree: true
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    questionType: 'single',
    text: '',
    images: [],
    options: [
      { text: '', images: [] },
      { text: '', images: [] },
      { text: '', images: [] },
      { text: '', images: [] }
    ],
    correctAnswer: 0,
    trueFalseAnswers: [false, false, false, false],
    multipleCorrectAnswers: [],
    explanation: { text: '', images: [] }
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const data = await api.tests.getAll();
      setTests(data);
    } catch (error) {
      console.error('Failed to load tests', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleBulkUpload = async (testId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => {
        // Simple CSV parser handling quotes
        const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\",\r\n]*))(?:,|\r|\n|$)/g;
        let matches = [];
        let match;
        while ((match = regex.exec(row)) && match[0] !== '') {
          matches.push(match[1] ? match[1].replace(/\"\"/g, '\"') : match[2]);
        }
        return matches;
      }).filter(row => row.length >= 6 && row[0].trim() !== '');

      // Skip header if it looks like a header
      let startIndex = 0;
      if (rows[0] && rows[0][0].toLowerCase().includes('question')) {
        startIndex = 1;
      }

      setLoading(true);
      let successCount = 0;
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if(!row[0] || !row[0].trim()) continue;

        const correctAnsLetter = (row[5] || '').toUpperCase().trim();
        const correctAnswer = correctAnsLetter === 'A' ? 0 : correctAnsLetter === 'B' ? 1 : correctAnsLetter === 'C' ? 2 : correctAnsLetter === 'D' ? 3 : 0;

        const newQ = {
          text: row[0].trim(),
          images: [],
          options: [
            { text: (row[1] || '').trim(), images: [] },
            { text: (row[2] || '').trim(), images: [] },
            { text: (row[3] || '').trim(), images: [] },
            { text: (row[4] || '').trim(), images: [] }
          ],
          correctAnswer,
          explanation: { text: (row[6] || '').trim(), images: [] }
        };

        try {
          await api.admin.addQuestion(testId, newQ);
          successCount++;
        } catch (error) {
          console.error('Failed to add question from row ' + i, error);
        }
      }
      setLoading(false);
      alert(`Successfully uploaded ${successCount} questions.`);
      loadTests(); // refresh main view to ensure sync
    };
    reader.readAsText(file);
  };
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createTest(newTest);
      setIsModalOpen(false);
      loadTests();
      setNewTest({ title: '', description: '', category: '', duration: 60, difficulty: 'Beginner', rating: 5 });
    } catch (error) {
      alert('Failed to create test');
    }
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateTest(editingTest._id, editingTest);
      setIsEditModalOpen(false);
      loadTests();
      if (detailedTest && detailedTest._id === editingTest._id) {
        setDetailedTest({ ...detailedTest, ...editingTest });
      }
      alert('Module updated successfully');
    } catch (error) {
      alert('Failed to update module');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.admin.addQuestion(selectedTest._id, newQuestion);
      setIsQuestionModalOpen(false);
      setNewQuestion({ 
        questionType: 'single',
        text: '', 
        images: [], 
        options: [
          { text: '', images: [] },
          { text: '', images: [] },
          { text: '', images: [] },
          { text: '', images: [] }
        ], 
        correctAnswer: 0, 
        trueFalseAnswers: [false, false, false, false],
        multipleCorrectAnswers: [],
        explanation: { text: '', images: [] }
      });
      alert('Question added successfully');
    } catch (error) {
      alert(error.message || 'Failed to add question');
    }
  };

  const handleUpdateQuestion = async (qId) => {
    try {
      await api.admin.updateQuestion(qId, editingData);
      setEditingQuestionId(null);
      // Refresh detailed view
      const updatedDetails = await api.admin.getTestDetails(detailedTest._id);
      setDetailedTest(updatedDetails);
      alert('Question updated successfully');
    } catch (error) {
      alert('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.admin.deleteQuestion(qId);
        // Refresh detailed view
        const updatedDetails = await api.admin.getTestDetails(detailedTest._id);
        setDetailedTest(updatedDetails);
        alert('Question deleted successfully');
      } catch (error) {
        alert('Failed to delete question');
      }
    }
  };

  const handleViewDetails = async (testId) => {
    try {
      const data = await api.admin.getTestDetails(testId);
      setDetailedTest(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      alert('Failed to fetch test details');
    }
  };

  const handleDeleteTest = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment? All associated questions will be removed.')) {
      try {
        await api.admin.deleteTest(id);
        loadTests();
      } catch (error) {
        alert('Deletion failed');
      }
    }
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{ 
        marginBottom: '3.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '2rem',
        marginTop: '1rem'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Content Management
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Assessment Modules</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            Architect, deploy, and manage evaluation environments.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="primary-gradient" 
          style={{ padding: '1rem 2rem', borderRadius: '12px', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem', width: 'fit-content' }}
        >
          <Plus size={20} /> <span className="mobile-hide">Create New Module</span><span className="desktop-hide">Create</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="card-tonal" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1rem 2rem' }}>
        <Search size={20} color="var(--primary)" />
        <input 
          type="text" 
          placeholder="Filter modules by title or discipline..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--on-surface)', outline: 'none' }}
        />
      </div>

      {loading ? (
        <CardShimmer cards={6} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
          {filteredTests.map((test) => (
            <div key={test._id} className="card-tonal" style={{ border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: 'var(--primary-container)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <BookOpen size={22} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => { setEditingTest(test); setIsEditModalOpen(true); }} 
                    style={{ color: 'var(--primary)', padding: '0.5rem', background: 'none', cursor: 'pointer', border: 'none' }}
                    title="Edit Module"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTest(test._id)} 
                    style={{ color: 'var(--error)', padding: '0.5rem', background: 'none', cursor: 'pointer', border: 'none' }}
                    title="Delete Module"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem', fontWeight: 700 }}>{test.title}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {test.description}
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="badge-tonal" style={{ background: 'var(--surface-high)', color: 'var(--on-surface)', fontSize: '0.75rem', fontWeight: 800 }}>
                  <Clock size={14} style={{ marginRight: '0.4rem' }} /> {test.duration}m
                </div>
                <div className="badge-tonal" style={{ background: 'var(--primary-container)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800 }}>
                  {test.difficulty}
                </div>
                <div className="badge-tonal" style={{ background: 'var(--success-container)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 800 }}>
                  ★ {test.rating || 5}/5
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  onClick={() => { setSelectedTest(test); setIsQuestionModalOpen(true); }}
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '10px', 
                    background: 'var(--on-surface)', 
                    color: 'white', 
                    fontWeight: 800, 
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Plus size={16} /> Add
                </button>
                <button 
                  onClick={() => handleViewDetails(test._id)}
                  className="card-tonal"
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    border: '1px solid var(--outline-variant)'
                  }}
                >
                  <Eye size={16} /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Test Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.4)', 
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: 'clamp(1rem, 5vw, 2rem)' 
        }}>
          <div className="card-tonal" style={{ 
            width: '100%', 
            maxWidth: '650px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--surface)', 
            border: '1px solid var(--outline-variant)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            position: 'relative',
            padding: 'clamp(1.5rem, 5vw, 3rem)'
          }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--surface-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={20} color="var(--on-surface)" />
            </button>

            <header style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>New Assessment</div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Initialize Module</h2>
            </header>

            <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>MODULE TITLE</label>
                  <input required className="input-premium" type="text" value={newTest.title} onChange={(e) => setNewTest({...newTest, title: e.target.value})} placeholder="e.g. Quantum Computing Fundamentals" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>DISCIPLINE / CATEGORY</label>
                  <input required className="input-premium" type="text" value={newTest.category} onChange={(e) => setNewTest({...newTest, category: e.target.value})} placeholder="e.g. Physics" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>DURATION (MINUTES)</label>
                  <input required className="input-premium" type="number" value={newTest.duration} onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>RATING (1-5)</label>
                  <input required className="input-premium" type="number" min="1" max="5" value={newTest.rating} onChange={(e) => setNewTest({...newTest, rating: parseInt(e.target.value)})} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <input type="checkbox" checked={newTest.isFree} onChange={(e) => setNewTest({...newTest, isFree: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', cursor: 'pointer' }} onClick={() => setNewTest({...newTest, isFree: !newTest.isFree})}>AVAILABLE FOR FREE (Uncheck for Premium)</label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>LEVEL OF RIGOR</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewTest({...newTest, difficulty: lvl})}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: newTest.difficulty === lvl ? 'var(--primary)' : 'var(--outline-variant)',
                        background: newTest.difficulty === lvl ? 'var(--primary-container)' : 'transparent',
                        color: newTest.difficulty === lvl ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>ACADEMIC ABSTRACT</label>
                <textarea required className="input-premium" style={{ minHeight: '120px', resize: 'none', lineHeight: '1.6' }} value={newTest.description} onChange={(e) => setNewTest({...newTest, description: e.target.value})} placeholder="Describe the learning objectives and scope of this assessment..." />
              </div>

              <button className="primary-gradient" style={{ 
                padding: '1.4rem', 
                borderRadius: '14px', 
                color: 'white', 
                fontWeight: 900, 
                fontSize: '1rem',
                marginTop: '1rem',
                boxShadow: '0 12px 24px rgba(var(--primary-rgb), 0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Deploy Module to Platform
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {isQuestionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 10, 0.4)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'clamp(1rem, 5vw, 2rem)' }}>
          <div className="card-tonal" style={{ width: '100%', maxWidth: '900px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
            <button onClick={() => setIsQuestionModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Add Question</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>To: {selectedTest?.title}</p>
            
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>QUESTION TYPE</label>
                <select className="input-premium" style={{ marginBottom: '1rem' }} value={newQuestion.questionType} onChange={(e) => setNewQuestion({...newQuestion, questionType: e.target.value})}>
                  <option value="single">Single Choice</option>
                  <option value="multiple_choice">Multiple Choice (Select Multiple)</option>
                  <option value="true_false_matrix">True/False Matrix</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>QUESTION TEXT</label>
                <textarea required className="input-premium" style={{ minHeight: '80px', resize: 'none' }} value={newQuestion.text} onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                {newQuestion.options.map((opt, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--on-surface-variant)' }}>OPTION {String.fromCharCode(65+i)}</label>
                      {newQuestion.options.length > 2 && (
                        <button type="button" onClick={() => {
                          const opts = newQuestion.options.filter((_, idx) => idx !== i);
                          const tfs = newQuestion.trueFalseAnswers.filter((_, idx) => idx !== i);
                          setNewQuestion({...newQuestion, options: opts, trueFalseAnswers: tfs, correctAnswer: 0});
                        }} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}><Trash2 size={14}/></button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        className="input-premium" 
                        type="text" 
                        value={opt.text} 
                        onChange={(e) => {
                          const opts = [...newQuestion.options];
                          opts[i].text = e.target.value;
                          setNewQuestion({...newQuestion, options: opts});
                        }} 
                        placeholder={`Option ${String.fromCharCode(65+i)} text...`} 
                      />
                    </div>
                    
                      <MultiImageUploader 
                        images={opt.images} 
                        onChange={(newImages) => {
                          const opts = [...newQuestion.options];
                          opts[i].images = newImages;
                          setNewQuestion({...newQuestion, options: opts});
                        }} 
                      />

                  </div>
                ))}
              </div>
              <button type="button" onClick={() => {
                setNewQuestion({
                  ...newQuestion, 
                  options: [...newQuestion.options, { text: '', images: [] }],
                  trueFalseAnswers: [...newQuestion.trueFalseAnswers, false]
                })
              }} style={{ background: 'var(--surface-high)', padding: '0.8rem', borderRadius: '8px', color: 'var(--on-surface)', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                <Plus size={16} /> Add Option
              </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1.5rem' }}>
                  <div>
                    {newQuestion.questionType === 'single' ? (
                      <>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>CORRECT ANSWER</label>
                        <select className="input-premium" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: parseInt(e.target.value)})}>
                          {newQuestion.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65+i)}</option>)}
                        </select>
                      </>
                    ) : newQuestion.questionType === 'multiple_choice' ? (
                      <>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>CORRECT ANSWERS (SELECT MULTIPLE)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {newQuestion.options.map((_, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={(newQuestion.multipleCorrectAnswers || []).includes(i)} 
                                onChange={(e) => {
                                  let current = newQuestion.multipleCorrectAnswers || [];
                                  if (e.target.checked) current = [...current, i];
                                  else current = current.filter(idx => idx !== i);
                                  setNewQuestion({...newQuestion, multipleCorrectAnswers: current});
                                }}
                                style={{ width: '18px', height: '18px' }}
                              />
                              Option {String.fromCharCode(65+i)}
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>CORRECT ANSWERS (TRUE/FALSE)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {newQuestion.options.map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontWeight: 800, width: '70px', fontSize: '0.9rem' }}>Option {String.fromCharCode(65+i)}</span>
                              <select 
                                className="input-premium" 
                                style={{ width: '100px', padding: '0.4rem 0.8rem' }}
                                value={newQuestion.trueFalseAnswers[i] ? 'true' : 'false'} 
                                onChange={(e) => {
                                  const tf = [...newQuestion.trueFalseAnswers];
                                  tf[i] = e.target.value === 'true';
                                  setNewQuestion({...newQuestion, trueFalseAnswers: tf});
                                }}
                              >
                                <option value="true">True</option>
                                <option value="false">False</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>QUESTION MEDIA (OPTIONAL)</label>
                    
                      <MultiImageUploader 
                        images={newQuestion.images} 
                        onChange={(newImages) => setNewQuestion({...newQuestion, images: newImages})} 
                      />

                  </div>
                </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>EXPLANATION</label>
                <textarea 
                  className="input-premium" 
                  style={{ minHeight: '80px', resize: 'none', marginBottom: '1rem' }} 
                  value={newQuestion.explanation.text} 
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: { ...newQuestion.explanation, text: e.target.value }})} 
                  placeholder="Academic rationale..."
                />
                
                  <MultiImageUploader 
                    images={newQuestion.explanation.images} 
                    onChange={(newImages) => setNewQuestion({...newQuestion, explanation: { ...newQuestion.explanation, images: newImages }})} 
                  />

              </div>

              <button className="primary-gradient" style={{ padding: '1.2rem', borderRadius: '12px', color: 'white', fontWeight: 800, marginTop: '1rem' }}>Commit Question to Test</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Test Modal */}
      {isEditModalOpen && editingTest && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.4)', 
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: 'clamp(1rem, 5vw, 2rem)' 
        }}>
          <div className="card-tonal" style={{ 
            width: '100%', 
            maxWidth: '650px', 
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--surface)', 
            border: '1px solid var(--outline-variant)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            position: 'relative',
            padding: 'clamp(1.5rem, 5vw, 3rem)'
          }}>
            <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--surface-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={20} color="var(--on-surface)" />
            </button>

            <header style={{ marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Edit Settings</div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Update Module</h2>
            </header>

            <form onSubmit={handleUpdateTest} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>MODULE TITLE</label>
                  <input required className="input-premium" type="text" value={editingTest.title} onChange={(e) => setEditingTest({...editingTest, title: e.target.value})} placeholder="e.g. Quantum Computing Fundamentals" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>DISCIPLINE / CATEGORY</label>
                  <input required className="input-premium" type="text" value={editingTest.category} onChange={(e) => setEditingTest({...editingTest, category: e.target.value})} placeholder="e.g. Physics" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>DURATION (MINUTES)</label>
                  <input required className="input-premium" type="number" value={editingTest.duration} onChange={(e) => setEditingTest({...editingTest, duration: parseInt(e.target.value)})} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>RATING (1-5)</label>
                  <input required className="input-premium" type="number" min="1" max="5" value={editingTest.rating || 5} onChange={(e) => setEditingTest({...editingTest, rating: parseInt(e.target.value)})} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <input type="checkbox" checked={editingTest.isFree !== false} onChange={(e) => setEditingTest({...editingTest, isFree: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--on-surface-variant)', cursor: 'pointer' }} onClick={() => setEditingTest({...editingTest, isFree: editingTest.isFree === false ? true : false})}>AVAILABLE FOR FREE (Uncheck for Premium)</label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.2rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>LEVEL OF RIGOR</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEditingTest({...editingTest, difficulty: lvl})}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: editingTest.difficulty === lvl ? 'var(--primary)' : 'var(--outline-variant)',
                        background: editingTest.difficulty === lvl ? 'var(--primary-container)' : 'transparent',
                        color: editingTest.difficulty === lvl ? 'var(--primary)' : 'var(--on-surface)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--on-surface-variant)', letterSpacing: '0.05em' }}>ACADEMIC ABSTRACT / DESCRIPTION</label>
                <textarea 
                  required 
                  className="input-premium" 
                  value={editingTest.description} 
                  onChange={(e) => setEditingTest({...editingTest, description: e.target.value})} 
                  placeholder="Provide a comprehensive overview of the module contents..."
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="primary-gradient" style={{ padding: '1.2rem', borderRadius: '12px', color: 'white', fontWeight: 800, marginTop: '1rem' }}>
                Save Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      {isDetailsModalOpen && detailedTest && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(10, 10, 10, 0.4)', 
          backdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '2rem' 
        }}>
          <div className="card-tonal" style={{ 
            width: '100%', 
            maxWidth: '900px', 
            maxHeight: '85vh',
            overflowY: 'auto',
            background: 'var(--surface)', 
            border: '1px solid var(--outline-variant)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            position: 'relative',
            padding: '3rem'
          }}>
            <button onClick={() => setIsDetailsModalOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--surface-high)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
              <X size={20} color="var(--on-surface)" />
            </button>

            <header style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="badge-tonal" style={{ background: 'var(--primary-container)', color: 'var(--primary)', fontWeight: 800 }}>{detailedTest.category}</div>
                <div className="badge-tonal" style={{ background: 'var(--surface-high)', color: 'var(--on-surface)', fontWeight: 800 }}>{detailedTest.difficulty}</div>
                <div className="badge-tonal" style={{ background: 'var(--surface-high)', color: 'var(--on-surface)', fontWeight: 800 }}>{detailedTest.duration} mins</div>
                <div className="badge-tonal" style={{ background: 'var(--success-container)', color: 'var(--success)', fontWeight: 800 }}>★ {detailedTest.rating || 5}/5</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{detailedTest.title}</h2>
                <button 
                  onClick={() => { setEditingTest(detailedTest); setIsEditModalOpen(true); }}
                  className="card-tonal"
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--outline-variant)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', background: 'var(--surface-high)', color: 'var(--on-surface)' }}
                >
                  Edit Settings
                </button>
              </div>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', lineHeight: 1.6 }}>{detailedTest.description}</p>
            </header>

            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                Curriculum Inventory ({detailedTest.questions?.length || 0} Questions)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {detailedTest.questions?.map((q, idx) => (
                  <div key={q._id} style={{ padding: '2rem', background: 'var(--surface-low)', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.85rem' }}>QUESTION {idx + 1}</span>
                      {editingQuestionId === q._id ? (
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button 
                            onClick={() => handleUpdateQuestion(q._id)}
                            style={{ padding: '0.4rem 1rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={() => setEditingQuestionId(null)}
                            style={{ padding: '0.4rem 1rem', background: 'var(--surface-high)', color: 'var(--on-surface)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => { 
                              setEditingQuestionId(q._id); 
                              setEditingData(JSON.parse(JSON.stringify(q))); 
                            }}
                            style={{ padding: '0.4rem 1rem', background: 'var(--primary-container)', color: 'var(--primary)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Edit Question
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q._id)}
                            style={{ padding: '0.4rem', background: 'var(--error-container)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingQuestionId === q._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>QUESTION TYPE</label>
                          <select className="input-premium" value={editingData.questionType || 'single'} onChange={(e) => setEditingData({...editingData, questionType: e.target.value})}>
                            <option value="single">Single Choice</option>
                            <option value="multiple_choice">Multiple Choice (Select Multiple)</option>
                            <option value="true_false_matrix">True/False Matrix</option>
                          </select>
                        </div>
                        <textarea 
                          className="input-premium" 
                          value={editingData.text} 
                          onChange={(e) => setEditingData({...editingData, text: e.target.value})}
                          style={{ minHeight: '80px', resize: 'none' }}
                        />
                        
                          <MultiImageUploader 
                            images={editingData.images} 
                            onChange={(newImages) => setEditingData({...editingData, images: newImages})} 
                          />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
                          {editingData.options.map((opt, oIdx) => (
                            <div key={oIdx} className="card-tonal" style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, display: 'block' }}>OPTION {String.fromCharCode(65+oIdx)}</label>
                                {editingData.options.length > 2 && (
                                  <button type="button" onClick={() => {
                                    const opts = editingData.options.filter((_, idx) => idx !== oIdx);
                                    const tfs = (editingData.trueFalseAnswers || []).filter((_, idx) => idx !== oIdx);
                                    setEditingData({...editingData, options: opts, trueFalseAnswers: tfs, correctAnswer: 0});
                                  }} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14}/></button>
                                )}
                              </div>
                              <input 
                                className="input-premium" 
                                value={opt.text} 
                                onChange={(e) => {
                                  const newOpts = [...editingData.options];
                                  newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                                  setEditingData({...editingData, options: newOpts});
                                }}
                                style={{ marginBottom: '0.5rem' }}
                              />
                              
                                <MultiImageUploader 
                                  images={opt.images} 
                                  onChange={(newImages) => {
                                    const newOpts = [...editingData.options];
                                    newOpts[oIdx] = { ...newOpts[oIdx], images: newImages };
                                    setEditingData({...editingData, options: newOpts});
                                  }} 
                                />

                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => {
                          setEditingData({
                            ...editingData, 
                            options: [...editingData.options, { text: '', images: [] }],
                            trueFalseAnswers: [...(editingData.trueFalseAnswers || []), false]
                          })
                        }} style={{ background: 'var(--surface-high)', padding: '0.8rem', borderRadius: '8px', color: 'var(--on-surface)', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
                          <Plus size={16} /> Add Option
                        </button>

                        <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', borderLeft: '4px solid var(--primary)', marginBottom: '1rem' }}>
                          {(editingData.questionType || 'single') === 'single' ? (
                            <>
                              <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>CORRECT ANSWER</label>
                              <select className="input-premium" value={editingData.correctAnswer !== undefined ? editingData.correctAnswer : 0} onChange={(e) => setEditingData({...editingData, correctAnswer: parseInt(e.target.value)})}>
                                {editingData.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65+i)}</option>)}
                              </select>
                            </>
                          ) : editingData.questionType === 'multiple_choice' ? (
                            <>
                              <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>CORRECT ANSWERS (SELECT MULTIPLE)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {editingData.options.map((_, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={(editingData.multipleCorrectAnswers || []).includes(i)} 
                                      onChange={(e) => {
                                        let current = editingData.multipleCorrectAnswers || [];
                                        if (e.target.checked) current = [...current, i];
                                        else current = current.filter(idx => idx !== i);
                                        setEditingData({...editingData, multipleCorrectAnswers: current});
                                      }}
                                      style={{ width: '18px', height: '18px' }}
                                    />
                                    Option {String.fromCharCode(65+i)}
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>CORRECT ANSWERS (TRUE/FALSE)</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {editingData.options.map((_, i) => {
                                  const tfArray = editingData.trueFalseAnswers || [];
                                  return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      <span style={{ fontWeight: 800, width: '80px', fontSize: '0.85rem' }}>Option {String.fromCharCode(65+i)}</span>
                                      <select 
                                        className="input-premium" 
                                        style={{ width: '120px' }}
                                        value={tfArray[i] ? 'true' : 'false'} 
                                        onChange={(e) => {
                                          const tf = [...tfArray];
                                          tf[i] = e.target.value === 'true';
                                          setEditingData({...editingData, trueFalseAnswers: tf});
                                        }}
                                      >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>EXPLANATION</label>
                          <textarea 
                            className="input-premium" 
                            value={editingData.explanation?.text || ''} 
                            onChange={(e) => setEditingData({...editingData, explanation: { ...(editingData.explanation || {}), text: e.target.value }})}
                            style={{ minHeight: '60px', resize: 'none', marginBottom: '1rem' }}
                          />
                          
                            <MultiImageUploader 
                              images={editingData.explanation?.images} 
                              onChange={(newImages) => setEditingData({...editingData, explanation: { ...(editingData.explanation || {}), images: newImages }})} 
                            />

                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: q.image ? '1.5rem' : '2rem' }}>{q.text}</p>
                        
                        {q.images && q.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {q.images.map((img, idx) => (
                              <img key={idx} src={img} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', background: 'white', padding: '4px' }} />
                            ))}
                          </div>
                        )}


                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                          {q.options.map((opt, optIdx) => {
                            const qType = q.questionType || 'single';
                            const isSingle = qType === 'single';
                            const isMultiChoice = qType === 'multiple_choice';
                            const isMatrix = qType === 'true_false_matrix';

                            let isCorrect = false;
                            if (isSingle) {
                              isCorrect = optIdx === q.correctAnswer;
                            } else if (isMultiChoice) {
                              isCorrect = (q.multipleCorrectAnswers || []).includes(optIdx);
                            } else if (isMatrix) {
                              isCorrect = q.trueFalseAnswers && q.trueFalseAnswers[optIdx];
                            }
                            
                            const highlightGreen = isCorrect && !isMatrix;

                            return (
                              <div key={optIdx} style={{ 
                                padding: '1.2rem', 
                                background: highlightGreen ? 'var(--success-container)' : 'var(--surface)', 
                                border: `1px solid ${highlightGreen ? 'var(--success)' : 'var(--outline-variant)'}`,
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                              }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: highlightGreen ? 'var(--success)' : 'var(--surface-high)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                                      {String.fromCharCode(65+optIdx)}
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.text}</span>
                                  </div>
                                  {isMatrix && (
                                    <span style={{ 
                                      padding: '0.3rem 0.6rem', 
                                      borderRadius: '4px', 
                                      fontSize: '0.7rem', 
                                      fontWeight: 800,
                                      background: isCorrect ? 'var(--success-container)' : 'var(--error-container)',
                                      color: isCorrect ? 'var(--success)' : 'var(--error)'
                                    }}>
                                      {isCorrect ? 'TRUE' : 'FALSE'}
                                    </span>
                                  )}
                                </div>
                                
                                {opt.images && opt.images.length > 0 && (
                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {opt.images.map((img, i) => <img key={i} src={img} alt="Option" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px', background: 'white' }} />)}
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>

                        <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Academic Rationale</div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: q.explanation?.image ? '1rem' : 0 }}>
                            {q.explanation?.text || ''}
                          </p>
                          
                          {q.explanation?.images && q.explanation.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {q.explanation.images.map((img, idx) => (
                                <img key={idx} src={img} alt="Explanation" style={{ width: '100%', borderRadius: '8px' }} />
                              ))}
                            </div>
                          )}

                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTests;
