'use client';

import { useState, useActionState } from 'react';
import { createQuestion, deleteQuestion } from '@/app/actions/admin-exam.actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Add Question'}
    </button>
  );
}

export default function QuestionListClient({ initialQuestions, examId, courseId }: { initialQuestions: any[], examId: string, courseId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  
  const createQuestionWithIds = createQuestion.bind(null, examId, courseId);
  const [state, formAction] = useActionState(createQuestionWithIds, null);

  const handleDelete = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion(questionId, examId);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-md hover:bg-gray-800 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Question</span>
        </button>
      </div>

      <div className="space-y-4">
        {initialQuestions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
            <button 
              onClick={() => handleDelete(q.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                {q.question_type}
              </span>
              <span className="text-sm text-gray-500 font-medium">Marks: {q.marks}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{index + 1}. {q.question_text}</h3>
            
            {q.question_type === 'mcq' && (
              <ul className="space-y-2">
                {q.question_options?.map((opt: any, i: number) => (
                  <li key={opt.id} className={`p-3 rounded-lg border ${opt.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} flex items-center`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${opt.is_correct ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={opt.is_correct ? 'text-green-900 font-medium' : 'text-gray-700'}>{opt.option_text}</span>
                  </li>
                ))}
              </ul>
            )}

            {q.question_type === 'written' && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                <span className="block text-xs font-bold text-yellow-800 uppercase mb-2">Model Answer</span>
                <p className="text-sm text-yellow-900 whitespace-pre-wrap">{q.model_answer}</p>
              </div>
            )}
            
            {q.explanation && (
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-800">Explanation:</span> {q.explanation}
              </div>
            )}
          </div>
        ))}

        {initialQuestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
            No questions added to this exam yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Question</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form action={async (formData) => {
              await formAction(formData);
              setIsModalOpen(false);
            }} className="space-y-6">
              {state?.error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{state.error}</div>
              )}

              <div className="flex space-x-4 mb-6">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="question_type" value="mcq" checked={questionType === 'mcq'} onChange={() => setQuestionType('mcq')} className="text-blue-600 focus:ring-blue-500" />
                  <span className="font-medium text-gray-700">Multiple Choice (MCQ)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="question_type" value="written" checked={questionType === 'written'} onChange={() => setQuestionType('written')} className="text-blue-600 focus:ring-blue-500" />
                  <span className="font-medium text-gray-700">Written Q&A</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea name="question_text" required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Type your question here..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input name="marks" type="number" defaultValue={1} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {questionType === 'mcq' && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 text-sm mb-2">Options (Fill at least 2, check the correct one)</h4>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex items-center space-x-3">
                      <input type="radio" name={`is_correct_${num}`} value="true" className="text-green-500 focus:ring-green-500 w-5 h-5" title="Mark as correct answer" />
                      <input type="text" name={`option_${num}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder={`Option ${num}`} />
                    </div>
                  ))}
                </div>
              )}

              {questionType === 'written' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Answer (For evaluators)</label>
                  <textarea name="model_answer" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Type the expected answer here..."></textarea>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                <textarea name="explanation" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Explain the correct answer..."></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
