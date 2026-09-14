import React from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowRight, Check, Delete, Mic, Phone, PhoneCall, RotateCcw, ShieldCheck, Square, Upload, Volume2 } from 'lucide-react'
import './styles.css'

const scenarios = {
  serious: {
    en: { transcript: 'I have had a dry cough for three weeks, chest tightness and difficulty breathing.', reply: 'I understand. A cough lasting more than two weeks with chest tightness needs urgent assessment. I will help connect you to the nearest health clinic.', title: 'RED FLAG · Klinik Kesihatan required', detail: 'Respiratory warning pattern detected. Please seek same-day clinical assessment.', metrics: ['Voice jitter elevated', 'Breath pattern irregular', 'Persistent cough markers'] },
    bm: { transcript: 'Saya batuk kering sudah tiga minggu, dada rasa ketat dan susah bernafas.', reply: 'Baik, saya faham. Batuk lebih dua minggu dengan dada ketat perlu diperiksa segera. Saya akan bantu sambungkan ke Klinik Kesihatan terdekat.', title: 'RED FLAG · Klinik Kesihatan diperlukan', detail: 'Respiratory warning pattern detected. Please seek same-day clinical assessment.', metrics: ['Voice jitter elevated', 'Breath pattern irregular', 'Persistent cough markers'] },
    tone: 'danger',
  },
  mild: {
    en: { transcript: 'It is just a normal fever and a little runny nose. I am not having trouble breathing.', reply: 'Understood. Your symptoms sound mild for now. Drink water, rest and monitor how you feel. I will send home-care advice by SMS.', title: 'GREEN · Home care guidance', detail: 'No immediate respiratory warning detected. Call again if symptoms worsen.', metrics: ['Voice jitter within range', 'Breath pattern normal', 'Low cough frequency'] },
    bm: { transcript: 'Demam biasa sahaja, selesema sedikit. Saya tidak susah bernafas.', reply: 'Faham. Buat masa ini bunyinya ringan. Minum air, rehat secukupnya dan pantau gejala. Saya hantar nasihat melalui SMS.', title: 'GREEN · Nasihat penjagaan di rumah', detail: 'No immediate respiratory warning detected. Call again if symptoms worsen.', metrics: ['Voice jitter within range', 'Breath pattern normal', 'Low cough frequency'] },
    tone: 'success',
  },
}

function getVoicesAsync() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length) return resolve(voices)
    const handle = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handle)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', handle)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handle)
      resolve(window.speechSynthesis.getVoices())
    }, 1200)
  })
}

function pickVoiceFromList(voices, lang) {
  const lc = lang.toLowerCase()
  if (lc === 'ms-my') {
    return (
      voices.find((v) => v.lang.toLowerCase() === 'ms-my') ||
      voices.find((v) => v.lang.toLowerCase() === 'ms') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('ms')) ||
      voices.find((v) => /melayu/i.test(v.name)) ||
      voices.find((v) => /malay.*malaysia|malaysia.*malay/i.test(v.name)) ||
      voices.find((v) => /malay/i.test(v.name)) ||
      voices.find((v) => /malaysia/i.test(v.name)) ||
      null
    )
  }
  return voices.find((v) => v.lang.toLowerCase() === lc) || voices.find((v) => v.lang.toLowerCase().startsWith(lc.split('-')[0])) || null
}

let networkAudio = null

async function speakWithNativeVoice(text, lang) {
  window.speechSynthesis.cancel()
  if (networkAudio) {
    networkAudio.pause()
    networkAudio = null
  }
  const voices = await getVoicesAsync()
  const lc = lang.toLowerCase()

  if (lc === 'ms-my') {
    let voice = pickVoiceFromList(voices, 'ms-MY')
    if (!voice) {
      voice = pickVoiceFromList(voices, 'id-ID') || voices.find((v) => v.lang.toLowerCase().startsWith('id'))
    }
    if (voice) {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = voice.lang
      utter.voice = voice
      utter.rate = 0.9
      window.speechSynthesis.speak(utter)
      return
    }
    try {
      const encoded = encodeURIComponent(text)
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ms&q=${encoded}`
      networkAudio = new Audio(url)
      networkAudio.crossOrigin = 'anonymous'
      await networkAudio.play()
      return
    } catch {
      console.warn('Malay voice unavailable: no native ms-MY/id-ID voice and network TTS blocked. Install Malay pack: Windows Settings > Time & Language > Add Malay (Malaysia) > Text-to-speech.')
      return
    }
  }

  const voice = pickVoiceFromList(voices, lang)
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = 0.9
  if (voice) utter.voice = voice
  window.speechSynthesis.speak(utter)
}

function App() {
  const [stage, setStage] = React.useState('start')
  const [recording, setRecording] = React.useState(false)
  const [audioUrl, setAudioUrl] = React.useState('')
  const [audioName, setAudioName] = React.useState('')
  const [selectedScenario, setSelectedScenario] = React.useState(null)
  const [result, setResult] = React.useState(null)
  const [recordSeconds, setRecordSeconds] = React.useState(0)
  const [callerNumber, setCallerNumber] = React.useState('')
  const [language, setLanguage] = React.useState('en')
  const mediaRecorder = React.useRef(null)
  const stream = React.useRef(null)
  const chunks = React.useRef([])
  const timer = React.useRef(null)
  const fileInput = React.useRef(null)

  const progress = { start: 0, connected: 25, recording: 50, analyzing: 75, result: 100 }[stage]

  React.useEffect(() => () => {
    clearInterval(timer.current)
    stream.current?.getTracks().forEach((track) => track.stop())
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  React.useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      const warm = () => window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener('voiceschanged', warm)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', warm)
    }
  }, [])

  function connectCall() {
    setStage('connected')
    setSelectedScenario(null)
    setResult(null)
    if ('speechSynthesis' in window) {
      const promptText = language === 'en' ? 'What is troubling you? Please tell me. I am listening.' : 'Apa masalah anda? Ceritakan kepada saya. Saya sedang mendengar.'
      const targetLang = language === 'en' ? 'en-US' : 'ms-MY'
      speakWithNativeVoice(promptText, targetLang)
    }
  }

  function handleNumberKey(value) {
    setCallerNumber((current) => `${current}${value}`.slice(0, 15))
  }

  async function startRecording() {
    if (recording) {
      mediaRecorder.current?.stop()
      return
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert('Recording is not available in this browser. Please use the upload option or Chrome/Edge.')
      return
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      mediaRecorder.current = new MediaRecorder(stream.current)
      mediaRecorder.current.ondataavailable = (event) => event.data.size && chunks.current.push(event.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.current.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioName('Recorded voice message')
        stream.current?.getTracks().forEach((track) => track.stop())
        setRecording(false)
        clearInterval(timer.current)
        setStage('recording')
      }
      mediaRecorder.current.start()
      setRecording(true)
      setStage('recording')
      setRecordSeconds(0)
      timer.current = setInterval(() => setRecordSeconds((seconds) => seconds + 1), 1000)
    } catch {
      alert('Microphone access was not granted. You can upload an audio file instead.')
    }
  }

  function attachFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(file))
    setAudioName(file.name)
    setStage('recording')
  }

  function analyzeVoice(scenario = selectedScenario || 'mild') {
    const data = { ...scenarios[scenario][language], tone: scenarios[scenario].tone }
    setSelectedScenario(scenario)
    setStage('analyzing')
    setTimeout(() => {
      setResult(data)
      setStage('result')
    }, 1400)
  }

  function reset() {
    clearInterval(timer.current)
    mediaRecorder.current?.stop()
    stream.current?.getTracks().forEach((track) => track.stop())
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (networkAudio) {
      networkAudio.pause()
      networkAudio = null
    }
    setStage('start')
    setRecording(false)
    setAudioUrl('')
    setAudioName('')
    setSelectedScenario(null)
    setResult(null)
    setRecordSeconds(0)
    setCallerNumber('')
    window.speechSynthesis?.cancel()
  }

  const stageLabel = stage === 'result' ? 'Analysis complete' : stage === 'analyzing' ? 'AI is analyzing' : stage === 'recording' ? 'Voice message ready' : stage === 'connected' ? 'Hotline connected' : 'Ready to call'

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/" aria-label="MySihat AI home"><span className="brand-mark"><Activity size={19} /></span><span><strong>MySihat AI</strong><small>Voice-first care</small></span></a>
        <button className="reset-btn" onClick={reset}><RotateCcw size={15} /> Reset</button>
      </header>

      <section className="hero">
        <h1>Call. Speak. Get care guidance.</h1>
        <p>Try the rural hotline exactly as a patient would. No login, no form, no medical jargon.</p>
        <div className="trust-row"><span><ShieldCheck size={15} /> Private demo</span><span><Volume2 size={15} /> Bahasa Melayu ready</span><span><Phone size={15} /> 1-800-88-SIHAT</span></div>
      </section>

      <section className="journey" aria-label="Call journey progress">
        <div className="journey-top"><span>YOUR TEST JOURNEY</span><strong>{progress}%</strong></div>
        <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
        <div className="steps"><span className={progress >= 25 ? 'done' : ''}>1 Call</span><span className={progress >= 50 ? 'done' : ''}>2 Speak</span><span className={progress >= 75 ? 'done' : ''}>3 Analyze</span><span className={progress === 100 ? 'done' : ''}>4 Guidance</span></div>
      </section>

      <section className="call-card">
        <div className="call-card-head"><div><span className="section-number">01</span><div><p className="card-eyebrow">NafasCheck voice triage</p><h2>{stageLabel}</h2></div></div><span className={`status ${stage === 'result' ? 'complete' : ''}`}><span />{stageLabel}</span></div>
        <div className="call-body">
          <div className="phone-summary"><div className="phone-icon"><Phone size={21} /></div><div><strong>MySihat AI hotline</strong><span>1-800-88-SIHAT · Toll-free</span></div><div className={`connection ${stage !== 'start' ? 'on' : ''}`}><span />{stage === 'start' ? 'Offline' : 'Connected'}</div></div>
          {stage === 'start' && <div className="dialer-block"><div className="language-picker" aria-label="Choose call language"><span>CALL LANGUAGE</span><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button><button className={language === 'bm' ? 'active' : ''} onClick={() => setLanguage('bm')}>Bahasa Melayu</button></div><div className="dialer-screen"><span>{language === 'en' ? 'CALLING FROM' : 'PANGGILAN DARIPADA'}</span><strong>{callerNumber || (language === 'en' ? 'Enter your number' : 'Masukkan nombor')}</strong><small>MySihat AI hotline</small></div><div className="number-pad">{['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => <button key={key} onClick={() => handleNumberKey(key)}>{key}</button>)}</div><div className="dialer-actions"><button className="delete-key" onClick={() => setCallerNumber((current) => current.slice(0, -1))} aria-label="Delete last digit"><Delete size={17} /></button><button className="call-key" onClick={() => callerNumber && connectCall()} disabled={!callerNumber} aria-label="Call MySihat AI"><PhoneCall size={20} /></button><span /></div><p className="dialer-note">{language === 'en' ? 'Enter your number, then tap the green call button' : 'Masukkan nombor, kemudian tekan butang panggilan hijau'}</p></div>}
          {stage !== 'start' && !result && <div className="voice-block"><div className="ai-callout"><Volume2 size={16} /><span><strong>{language === 'en' ? 'AI agent says' : 'Ejen AI berkata'}</strong>{language === 'en' ? '“What is troubling you? Please tell me. I am listening.”' : '“Apa masalah anda? Ceritakan kepada saya. Saya sedang mendengar.”'}</span></div><div className="voice-prompt"><span className="pulse-icon"><Mic size={22} /></span><div><strong>{recording ? (language === 'en' ? 'Listening to you...' : 'Sedang mendengar...') : (language === 'en' ? 'Tell the AI what you feel' : 'Ceritakan apa yang anda rasa')}</strong><p>{recording ? `Recording 00:${String(recordSeconds).padStart(2, '0')}` : (language === 'en' ? 'Speak naturally in English or Bahasa Melayu.' : 'Cakap secara semula jadi dalam Bahasa Melayu atau English.')}</p></div></div><button className={`record-btn ${recording ? 'recording' : ''}`} onClick={startRecording}>{recording ? <><Square size={16} /> {language === 'en' ? 'Stop recording' : 'Henti rakaman'}</> : <><Mic size={17} /> {language === 'en' ? 'Record voice message' : 'Rakam mesej suara'}</>}</button><div className="or-line"><span>{language === 'en' ? 'or test with a sample voice case' : 'atau cuba kes suara contoh'}</span></div><div className="sample-row"><button className={selectedScenario === 'serious' ? 'sample selected' : 'sample'} onClick={() => { setSelectedScenario('serious'); setAudioName('Sample: serious respiratory concern'); setStage('recording') }}><strong>{language === 'en' ? 'Serious' : 'Serius'}</strong><span>{language === 'en' ? 'Cough 3 weeks + chest tightness' : 'Batuk 3 minggu + dada ketat'}</span></button><button className={selectedScenario === 'mild' ? 'sample selected' : 'sample'} onClick={() => { setSelectedScenario('mild'); setAudioName('Sample: mild symptoms'); setStage('recording') }}><strong>{language === 'en' ? 'Mild' : 'Ringan'}</strong><span>{language === 'en' ? 'Fever + a little runny nose' : 'Demam + selesema sedikit'}</span></button></div>{audioName && <div className="attached"><Check size={14} /> {audioName} {audioUrl && <audio src={audioUrl} controls />}</div>}<button className={`analyze-btn ${stage === 'recording' ? 'ready' : ''}`} disabled={stage !== 'recording'} onClick={() => analyzeVoice()}><Activity size={17} /> {language === 'en' ? 'Analyze this voice message' : 'Analisis mesej suara'}</button><button className="upload-link" onClick={() => fileInput.current?.click()}><Upload size={14} /> {language === 'en' ? 'Upload an audio file instead' : 'Muat naik fail audio'}</button><a className="real-call-link" href="tel:18008874428"><Phone size={13} /> {language === 'en' ? 'Use the real phone dialer instead' : 'Guna pendail telefon sebenar'}</a><input ref={fileInput} type="file" accept="audio/*" hidden onChange={attachFile} /></div>}
          {stage === 'analyzing' && <div className="analyzing"><div className="analysis-orbit"><Activity size={28} /></div><h3>AI is listening for respiratory signals</h3><p>Checking voice jitter, breath pattern and cough markers...</p><div className="signal-bars">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 45}ms` }} />)}</div></div>}
          {result && <div className="result-block"><div className={`result-banner ${result.tone}`}><div className="result-symbol">{result.tone === 'danger' ? '!' : '✓'}</div><div><span>PRELIMINARY TRIAGE RESULT</span><h3>{result.title}</h3><p>{result.detail}</p></div></div><div className="result-grid"><div><span>What we heard</span><p>“{result.transcript}”</p></div><div><span>AI voice reply</span><p>{result.reply}</p></div></div><div className="metrics">{result.metrics.map((metric) => <span key={metric}><Check size={13} /> {metric}</span>)}</div><div className="next-step"><strong>{result.tone === 'danger' ? 'Next step: seek care today' : 'Next step: monitor at home'}</strong><span>{result.tone === 'danger' ? 'Location support and Klinik Kesihatan directions would be sent by SMS.' : 'Home care advice would be sent by SMS. Call again if breathing worsens.'}</span></div><button className="again-btn" onClick={reset}>Try another voice message <ArrowRight size={16} /></button></div>}
        </div>
      </section>
      <footer><span>Buildability demo · Not a medical diagnosis</span><span>Designed for low-bandwidth access</span></footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
