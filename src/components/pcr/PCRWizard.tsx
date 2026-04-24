'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, MessageSquare, CheckCircle, ChevronRight,
  ChevronLeft, Download, Loader2, AlertCircle, Send, X, Plus, Trash2, Mic, MicOff
} from 'lucide-react';
import { PCRWizardState, PCRStructuredData, PCRResource, PCRChangeType, PCRNarrative } from '@/types/pcr';
import { parseNarrativeResponse } from '@/lib/pcrPrompts';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

const STEPS = [
  { number: 1, label: 'Engagement Setup' },
  { number: 2, label: 'Describe Changes' },
  { number: 3, label: 'Confirm Details' },
  { number: 4, label: 'Review & Export' },
];

const CHANGE_TYPE_LABELS: Record<PCRChangeType, string> = {
  scope: 'Scope / Solution Approach',
  resources: 'Resources',
  timeline: 'Timeline / Schedule',
  assumptions: 'Assumptions',
  pricing: 'Pricing',
};

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step.number < currentStep
                ? 'bg-green-500 text-white'
                : step.number === currentStep
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {step.number < currentStep ? <CheckCircle className="w-4 h-4" /> : step.number}
            </div>
            <span className={`mt-1 text-xs font-medium whitespace-nowrap ${
              step.number === currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
            }`}>{step.label}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${step.number < currentStep ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Engagement Setup ─────────────────────────────────────────────────
function Step1({
  state,
  onSowUpload,
  onSpwUpload,
  onBasicsChange,
  onNext,
}: {
  state: PCRWizardState;
  onSowUpload: (text: string, fileName: string, metadata?: Partial<PCRStructuredData>) => void;
  onSpwUpload: (fileName: string, resources: PCRResource[], isZeroCost: boolean) => void;
  onBasicsChange: (data: Partial<PCRStructuredData>) => void;
  onNext: () => void;
}) {
  const sowFileRef = useRef<HTMLInputElement>(null);
  const spwFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSowName, setUploadedSowName] = useState('');
  const [uploadingSpw, setUploadingSpw] = useState(false);
  const [uploadedSpwName, setUploadedSpwName] = useState('');
  const [spwWarnings, setSpwWarnings] = useState<string[]>([]);
  const basics = state.structuredData ?? {};

  const handleSowFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/pcr/parse-sow', { method: 'POST', body: formData });
      if (res.ok) {
        const payload = await res.json() as { text: string; metadata?: Partial<PCRStructuredData> };
        onSowUpload(payload.text, file.name, payload.metadata);
      } else {
        onSowUpload('', file.name);
      }
      setUploadedSowName(file.name);
    } finally {
      setUploading(false);
    }
  };

  const handleSpwFile = async (file: File) => {
    setUploadingSpw(true);
    setSpwWarnings([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/pcr/parse-spw', { method: 'POST', body: formData });
      if (res.ok) {
        const payload = await res.json() as {
          resources: PCRResource[];
          isZeroCost: boolean;
          warnings: string[];
        };
        console.log('[SPW upload] resources:', payload.resources.length, '| warnings:', payload.warnings, '| isZeroCost:', payload.isZeroCost);
        onSpwUpload(file.name, payload.resources, payload.isZeroCost);
        if (payload.warnings?.length) setSpwWarnings(payload.warnings);
        setUploadedSpwName(file.name);
      } else {
        setSpwWarnings(['SPW could not be parsed. You can add resources manually in the next step.']);
      }
    } finally {
      setUploadingSpw(false);
    }
  };

  const canProceed = basics.projectName && basics.clientName && basics.sowDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Engagement Setup</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload the SOW and SPW to auto-populate the engagement details and resource table.
        </p>
      </div>

      {/* Upload row: SOW + SPW side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SOW Upload */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
          <input ref={sowFileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleSowFile(e.target.files[0])} />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Statement of Work (PDF)</p>
          {uploadedSowName ? (
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium truncate max-w-[160px]">{uploadedSowName}</span>
              <button onClick={() => { setUploadedSowName(''); onSowUpload('', ''); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => sowFileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Reading...' : 'Choose PDF'}
              </button>
              <p className="mt-2 text-xs text-gray-400">Auto-fills project details</p>
            </>
          )}
        </div>

        {/* SPW Upload */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
          <input ref={spwFileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && handleSpwFile(e.target.files[0])} />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Services Pricing Workbook (Excel)</p>
          {uploadedSpwName ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate max-w-[160px]">{uploadedSpwName}</span>
                <button onClick={() => { setUploadedSpwName(''); onSpwUpload('', [], true); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {(state.structuredData?.resources ?? []).length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {state.structuredData!.resources!.length} resource{state.structuredData!.resources!.length !== 1 ? 's' : ''} loaded
                </span>
              )}
              {(state.structuredData?.resources ?? []).length === 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">0 resources parsed — check sheet name or format</span>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => spwFileRef.current?.click()}
                disabled={uploadingSpw}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {uploadingSpw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingSpw ? 'Reading...' : 'Choose Excel'}
              </button>
              <p className="mt-2 text-xs text-gray-400">Auto-fills resource table</p>
            </>
          )}
        </div>
      </div>

      {spwWarnings.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{spwWarnings.join(' ')}</span>
        </div>
      )}

      {/* Engagement basics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Project Name *</label>
          <input
            type="text"
            value={basics.projectName ?? ''}
            onChange={(e) => onBasicsChange({ projectName: e.target.value })}
            placeholder="e.g. Acme Corp Cloud Migration Phase 2"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Client Name *</label>
          <input
            type="text"
            value={basics.clientName ?? ''}
            onChange={(e) => onBasicsChange({ clientName: e.target.value })}
            placeholder="e.g. Acme Corporation"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SOW Execution Date *</label>
          <input
            type="text"
            value={basics.sowDate ?? ''}
            onChange={(e) => onBasicsChange({ sowDate: e.target.value })}
            placeholder="e.g. January 15, 2025"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SOW ID</label>
          <input
            type="text"
            value={basics.sowId ?? ''}
            onChange={(e) => onBasicsChange({ sowId: e.target.value })}
            placeholder="e.g. SOW-2024-001"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Number of Prior PCRs
            <span className="ml-1 font-normal text-gray-400">(leave blank if this is the first)</span>
          </label>
          <input
            type="number"
            min={0}
            value={basics.priorPcrCount != null ? basics.priorPcrCount : ''}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = raw === '' ? undefined : parseInt(raw);
              onBasicsChange({ priorPcrCount: parsed as number, priorPcrDates: [] });
            }}
            placeholder="0"
            className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {(basics.priorPcrCount ?? 0) > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Prior PCR Execution Dates</label>
          <div className="space-y-2">
            {Array.from({ length: basics.priorPcrCount ?? 0 }).map((_, i) => (
              <input
                key={i}
                type="text"
                value={basics.priorPcrDates?.[i] ?? ''}
                onChange={(e) => {
                  const dates = [...(basics.priorPcrDates ?? [])];
                  dates[i] = e.target.value;
                  onBasicsChange({ priorPcrDates: dates });
                }}
                placeholder={`PCR${i + 1} execution date`}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${canProceed ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Speech recognition hook (Web Speech API — no external dependencies) ──────
function useSpeechRecognition(onTranscript: (text: string, isFinal: boolean) => void) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check support client-side only
  useState(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        (window as typeof window & { SpeechRecognition?: BrowserSpeechRecognitionConstructor; webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).SpeechRecognition ??
        (window as typeof window & { webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognitionAPI);
    }
  });

  const start = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionAPI =
      (window as typeof window & { SpeechRecognition?: BrowserSpeechRecognitionConstructor; webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).SpeechRecognition ??
      (window as typeof window & { webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) onTranscript(final, true);
      else if (interim) onTranscript(interim, false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, isSupported, toggle };
}

// ─── Step 2: Describe Changes (chat interface) ────────────────────────────────
function Step2({
  state,
  onMessage,
  onNext,
  onBack,
}: {
  state: PCRWizardState;
  onMessage: (content: string, mode: 'extract' | 'converse') => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [input, setInput] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState('');
  const [interimText, setInterimText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstMessage = state.conversationHistory.length === 0;

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setInput((prev) => {
        const joined = prev ? prev.trimEnd() + ' ' + text : text;
        return joined;
      });
      setInterimText('');
    } else {
      setInterimText(text);
    }
  }, []);

  const { isListening, isSupported, toggle } = useSpeechRecognition(handleTranscript);

  const handleSend = async () => {
    if (!input.trim() || state.isGenerating) return;
    // Stop mic if still listening when user hits send
    if (isListening) toggle();
    const text = input.trim();
    setInput('');
    setInterimText('');
    await onMessage(text, isFirstMessage ? 'extract' : 'converse');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDocUpload = async (file: File) => {
    const text = await file.text();
    setUploadedDoc(file.name);
    await onMessage(`[Document uploaded: ${file.name}]\n\n${text.slice(0, 4000)}`, 'extract');
  };

  // Display value: committed text + live interim in italics styling via placeholder
  const displayValue = input;
  const placeholder = isListening
    ? (interimText ? interimText : 'Listening...')
    : isFirstMessage
    ? 'Speak or type to describe what needs to change...'
    : 'Speak or type to continue the conversation...';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Describe the Changes</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Speak or type what needs to change. I&apos;ll extract the key details and confirm them with you before drafting anything.
        </p>
      </div>

      {/* Chat history */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 h-72 overflow-y-auto space-y-3">
        {state.conversationHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-sm text-gray-400 gap-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Describe what&apos;s changing</p>
              <p className="text-xs mt-1">e.g. &quot;I need to add a Senior Engineer and extend the timeline by 60 days&quot;</p>
            </div>
          </div>
        ) : (
          state.conversationHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {state.isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live interim transcript banner */}
      {isListening && interimText && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 italic">
          {interimText}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0])} />

        {/* Document upload */}
        <button
          onClick={() => fileRef.current?.click()}
          title="Upload document"
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Microphone */}
        {isSupported && (
          <button
            onClick={toggle}
            title={isListening ? 'Stop recording' : 'Start voice input'}
            className={`relative p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                {/* Pulse ring while recording */}
                <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-30" />
              </>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={placeholder}
          disabled={state.isGenerating}
          className={`flex-1 px-3 py-2 rounded-xl border text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
            isListening
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/10'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || state.isGenerating}
          className={`p-2.5 rounded-xl transition-colors ${
            input.trim() && !state.isGenerating
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Recording status */}
      {isListening && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          Recording — speak naturally, then hit Send or tap the mic to stop
        </p>
      )}

      {uploadedDoc && (
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Using: {uploadedDoc}
        </p>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} disabled={state.conversationHistory.length < 2} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${state.conversationHistory.length >= 2 ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          Confirm Details <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm Structured Data ─────────────────────────────────────────
function Step3({
  state,
  onDataChange,
  onGenerateNarrative,
  onBack,
}: {
  state: PCRWizardState;
  onDataChange: (data: Partial<PCRStructuredData>) => void;
  onGenerateNarrative: () => Promise<void>;
  onBack: () => void;
}) {
  const data = state.structuredData ?? {};

  const updateResource = (index: number, update: Partial<PCRResource>) => {
    const resources = [...(data.resources ?? [])];
    resources[index] = { ...resources[index], ...update };
    onDataChange({ resources });
  };

  const addResource = () => {
    onDataChange({ resources: [...(data.resources ?? []), { role: '', originalAllocation: '', newAllocation: '', action: 'added' }] });
  };

  const removeResource = (index: number) => {
    onDataChange({ resources: (data.resources ?? []).filter((_, i) => i !== index) });
  };

  const toggleChangeType = (type: PCRChangeType) => {
    const current = data.changeTypes ?? [];
    onDataChange({ changeTypes: current.includes(type) ? current.filter((t) => t !== type) : [...current, type] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Change Details</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and correct the details extracted from your description. These will be used to generate the PCR.
        </p>
      </div>

      {/* Change types */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Change Types</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CHANGE_TYPE_LABELS) as PCRChangeType[]).map((type) => (
            <button
              key={type}
              onClick={() => toggleChangeType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                (data.changeTypes ?? []).includes(type)
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {CHANGE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Resources — always show when changeType is selected OR when resources already exist */}
      {((data.changeTypes ?? []).includes('resources') || (data.resources ?? []).length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Resources</label>
            <button onClick={addResource} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 mb-1">
            {['Role', 'Original Allocation', 'New Allocation', 'Rate', 'Action', ''].map((h) => (
              <span key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="space-y-2">
            {(data.resources ?? []).map((r, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <div>
                  <input value={r.role} onChange={(e) => updateResource(i, { role: e.target.value })} placeholder="Role (Level / Theatre)" className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500" />
                  {r.discipline && (
                    <span className="text-[10px] text-gray-400 pl-1">{r.discipline}</span>
                  )}
                </div>
                <input value={r.originalAllocation} onChange={(e) => updateResource(i, { originalAllocation: e.target.value })} placeholder="e.g. 160 hrs/mo" className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-1 focus:ring-primary-500" />
                <input value={r.newAllocation} onChange={(e) => updateResource(i, { newAllocation: e.target.value })} placeholder="e.g. 160 hrs/mo × 9 months" className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-1 focus:ring-primary-500" />
                <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  {r.discountedRate != null && r.discountedRate > 0
                    ? <span className="font-medium text-gray-700 dark:text-gray-300">${r.discountedRate}/hr</span>
                    : r.listRate
                    ? <span className="line-through text-gray-400">${r.listRate}/hr</span>
                    : <span className="text-gray-400">—</span>
                  }
                </div>
                <select value={r.action} onChange={(e) => updateResource(i, { action: e.target.value as PCRResource['action'] })} className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none">
                  <option value="added">Added</option>
                  <option value="removed">Removed</option>
                  <option value="changed">Changed</option>
                </select>
                <button onClick={() => removeResource(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {(data.resources ?? []).length === 0 && (
              <p className="text-xs text-gray-400 italic">No resources added yet. Upload an SPW in Step 1 or click "Add row".</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {(data.changeTypes ?? []).includes('timeline') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Extension (days)</label>
            <input type="number" value={data.timelineExtensionDays ?? ''} onChange={(e) => onDataChange({ timelineExtensionDays: parseInt(e.target.value) || undefined })} placeholder="e.g. 60" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New End Date</label>
            <input type="text" value={data.newEndDate ?? ''} onChange={(e) => onDataChange({ newEndDate: e.target.value })} placeholder="e.g. December 31, 2025" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      )}

      {/* Pricing */}
      {(data.changeTypes ?? []).includes('pricing') && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pricing</label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={data.pricingChange?.isZeroCost ?? false} onChange={(e) => onDataChange({ pricingChange: { ...(data.pricingChange ?? { isZeroCost: false }), isZeroCost: e.target.checked } })} className="rounded" />
            Zero-cost change
          </label>
          {!data.pricingChange?.isZeroCost && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Original Total</label>
                <input type="text" value={data.pricingChange?.originalTotal ?? ''} onChange={(e) => onDataChange({ pricingChange: { ...(data.pricingChange ?? { isZeroCost: false }), originalTotal: e.target.value } })} placeholder="e.g. $500,000" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Total</label>
                <input type="text" value={data.pricingChange?.newTotal ?? ''} onChange={(e) => onDataChange({ pricingChange: { ...(data.pricingChange ?? { isZeroCost: false }), newTotal: e.target.value } })} placeholder="e.g. $680,000" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          )}
        </div>
      )}

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {state.error}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onGenerateNarrative} disabled={state.isGenerating} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${!state.isGenerating ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          {state.isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting PCR...</> : <>Generate PCR Draft <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Review & Export ──────────────────────────────────────────────────
function Step4({
  state,
  onNarrativeEdit,
  onExport,
  onBack,
}: {
  state: PCRWizardState;
  onNarrativeEdit: (update: Partial<PCRNarrative>) => void;
  onExport: () => Promise<void>;
  onBack: () => void;
}) {
  const narrative = state.narrative;
  const data = state.confirmedData ?? state.structuredData;

  if (!narrative || !data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review & Export</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review the generated PCR narrative. Edit any section directly before downloading.
        </p>
      </div>

      {/* Engagement summary */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p><span className="font-medium">Project:</span> {data.projectName}</p>
        <p><span className="font-medium">Client:</span> {data.clientName}</p>
        <p><span className="font-medium">SOW Date:</span> {data.sowDate}</p>
        <p><span className="font-medium">Changes:</span> {(data.changeTypes ?? []).map((t) => CHANGE_TYPE_LABELS[t]).join(', ')}</p>
      </div>

      {/* Section 1: Change Summary */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Section 1 — Change Summary</label>
        <textarea
          value={narrative.changeSummary}
          onChange={(e) => onNarrativeEdit({ changeSummary: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
        />
      </div>

      {/* Section 2: Proposed Changes */}
      {narrative.solutionApproachChanges && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Section 1.2 — Solution Approach</label>
          <textarea value={narrative.solutionApproachChanges} onChange={(e) => onNarrativeEdit({ solutionApproachChanges: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
        </div>
      )}

      {narrative.scopeChanges && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Section 2.1 — Scope / Schedule Changes</label>
          <textarea value={narrative.scopeChanges} onChange={(e) => onNarrativeEdit({ scopeChanges: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
        </div>
      )}

      {narrative.resourceRationale && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Section 3.1 — Resource Rationale</label>
          <textarea value={narrative.resourceRationale} onChange={(e) => onNarrativeEdit({ resourceRationale: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
        </div>
      )}

      {narrative.assumptionChanges && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Section 6.0 — Assumption Changes</label>
          <textarea value={narrative.assumptionChanges} onChange={(e) => onNarrativeEdit({ assumptionChanges: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
        </div>
      )}

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {state.error}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onExport} disabled={state.isGenerating} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${!state.isGenerating ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          {state.isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Download PCR</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Wizard Controller ───────────────────────────────────────────────────
export default function PCRWizard() {
  const [state, setState] = useState<PCRWizardState>({
    currentStep: 1,
    conversationHistory: [],
    isGenerating: false,
  });

  const updateState = useCallback((update: Partial<PCRWizardState>) => {
    setState((prev) => ({ ...prev, ...update }));
  }, []);

  const handleSowUpload = useCallback((text: string, _fileName: string, metadata?: Partial<PCRStructuredData>) => {
    setState((prev) => ({
      ...prev,
      sowText: text,
      structuredData: {
        ...metadata,
        ...prev.structuredData,
        // Only fill fields the user hasn't already typed
        projectName: prev.structuredData?.projectName || metadata?.projectName,
        clientName: prev.structuredData?.clientName || metadata?.clientName,
        sowDate: prev.structuredData?.sowDate || metadata?.sowDate,
        sowId: prev.structuredData?.sowId || metadata?.sowId,
      } as Partial<PCRStructuredData>,
    }));
  }, []);

  const handleSpwUpload = useCallback((_fileName: string, resources: PCRResource[], isZeroCost: boolean) => {
    setState((prev) => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        resources,
        changeTypes: resources.length > 0
          ? Array.from(new Set([...((prev.structuredData?.changeTypes) ?? []), 'resources' as const]))
          : prev.structuredData?.changeTypes ?? [],
        pricingChange: {
          isZeroCost,
          originalTotal: prev.structuredData?.pricingChange?.originalTotal,
          newTotal: prev.structuredData?.pricingChange?.newTotal,
          notes: prev.structuredData?.pricingChange?.notes,
        },
      } as Partial<PCRStructuredData>,
    }));
  }, []);

  const handleBasicsChange = useCallback((data: Partial<PCRStructuredData>) => {
    setState((prev) => ({
      ...prev,
      structuredData: { ...prev.structuredData, ...data } as Partial<PCRStructuredData>,
    }));
  }, []);

  const handleMessage = useCallback(async (content: string, mode: 'extract' | 'converse') => {
    const userMessage = { role: 'user' as const, content };
    setState((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, userMessage],
      isGenerating: true,
      error: undefined,
    }));

    try {
      const response = await fetch('/api/pcr/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...state.conversationHistory, userMessage],
          sowText: state.sowText,
          mode,
          latestUserInput: content,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let assistantContent = '';
      const decoder = new TextDecoder();

      setState((prev) => ({
        ...prev,
        conversationHistory: [...prev.conversationHistory, { role: 'assistant', content: '' }],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const json = JSON.parse(line.slice(6)) as { delta?: string; error?: string };
            if (json.error) throw new Error(json.error);
            if (json.delta) {
              assistantContent += json.delta;
              setState((prev) => {
                const history = [...prev.conversationHistory];
                history[history.length - 1] = { role: 'assistant', content: assistantContent };
                return { ...prev, conversationHistory: history };
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setState((prev) => ({ ...prev, error: message }));
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state.conversationHistory, state.sowText]);

  const handleDataChange = useCallback((data: Partial<PCRStructuredData>) => {
    setState((prev) => ({
      ...prev,
      structuredData: { ...prev.structuredData, ...data } as Partial<PCRStructuredData>,
    }));
  }, []);

  const handleGenerateNarrative = useCallback(async () => {
    // Read the current state snapshot at call time via setState to avoid stale closure.
    // This ensures resources from a recently-uploaded SPW are always included.
    let currentData: PCRStructuredData | undefined;
    let currentMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let currentSowText: string | undefined;
    setState((prev) => {
      currentData = prev.structuredData as PCRStructuredData;
      currentMessages = prev.conversationHistory;
      currentSowText = prev.sowText;
      return { ...prev, isGenerating: true, error: undefined };
    });

    // Wait one tick for setState to flush, then read the captured values
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const data = currentData;
    if (!data) return;

    console.log('[PCR generate] resources at narrate time:', data.resources?.length ?? 0);

    try {
      const response = await fetch('/api/pcr/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          sowText: currentSowText,
          mode: 'narrate',
          confirmedData: data,
        }),
      });

      if (!response.ok) throw new Error('Narrative generation failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const json = JSON.parse(line.slice(6)) as { delta?: string };
            if (json.delta) fullResponse += json.delta;
          } catch { /* skip */ }
        }
      }

      const parsed = parseNarrativeResponse(fullResponse);
      setState((prev) => ({
        ...prev,
        narrative: {
          changeSummary: parsed.changeSummary ?? '',
          solutionApproachChanges: parsed.solutionApproachChanges,
          scopeChanges: parsed.scopeChanges,
          resourceRationale: parsed.resourceRationale,
          assumptionChanges: parsed.assumptionChanges,
        },
        confirmedData: data,
        currentStep: 4,
        isGenerating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Narrative generation failed';
      updateState({ error: message, isGenerating: false });
    }
  }, [setState, updateState]);

  const handleNarrativeEdit = useCallback((update: Partial<PCRNarrative>) => {
    setState((prev) => ({ ...prev, narrative: { ...prev.narrative!, ...update } }));
  }, []);

  const handleExport = useCallback(async () => {
    // Capture fresh state at call time to avoid stale closure issues.
    let mergedData: PCRStructuredData | undefined;
    let narrative: PCRNarrative | undefined;
    setState((prev) => {
      const base = prev.confirmedData ?? prev.structuredData as PCRStructuredData;
      // Always pull resources from the most current structuredData.
      mergedData = {
        ...base,
        resources: (base?.resources?.length ?? 0) > 0
          ? base.resources
          : (prev.structuredData?.resources ?? []),
        changeTypes: base?.changeTypes ?? prev.structuredData?.changeTypes ?? [],
        pricingChange: base?.pricingChange ?? prev.structuredData?.pricingChange ?? { isZeroCost: true },
      };
      narrative = prev.narrative ?? undefined;
      return { ...prev, isGenerating: true, error: undefined };
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    if (!mergedData || !narrative) {
      updateState({ isGenerating: false });
      return;
    }

    console.log('[PCR export] resources:', mergedData.resources?.length, 'changeTypes:', mergedData.changeTypes);

    try {
      const response = await fetch('/api/pcr/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            structuredData: mergedData,
            narrative,
            generatedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Document generation failed' })) as { error?: string };
        throw new Error(err.error ?? 'Document generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeProject = (mergedData.projectName ?? 'PCR').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '');
      a.download = `PCR-${safeProject}-${new Date().toISOString().slice(0, 10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      updateState({ error: message });
    } finally {
      updateState({ isGenerating: false });
    }
  }, [setState, updateState]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PCR Writer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Draft a Project Change Request with AI-assisted narrative generation.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <StepIndicator currentStep={state.currentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {state.currentStep === 1 && (
              <Step1
                state={state}
                onSowUpload={handleSowUpload}
                onSpwUpload={handleSpwUpload}
                onBasicsChange={handleBasicsChange}
                onNext={() => updateState({ currentStep: 2 })}
              />
            )}
            {state.currentStep === 2 && (
              <Step2
                state={state}
                onMessage={handleMessage}
                onNext={() => updateState({ currentStep: 3 })}
                onBack={() => updateState({ currentStep: 1 })}
              />
            )}
            {state.currentStep === 3 && (
              <Step3
                state={state}
                onDataChange={handleDataChange}
                onGenerateNarrative={handleGenerateNarrative}
                onBack={() => updateState({ currentStep: 2 })}
              />
            )}
            {state.currentStep === 4 && (
              <Step4
                state={state}
                onNarrativeEdit={handleNarrativeEdit}
                onExport={handleExport}
                onBack={() => updateState({ currentStep: 3 })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
