import React from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowRight, Check, Clock3, Delete, Globe2, Mic, Phone, PhoneCall, RotateCcw, ShieldCheck, Sparkles, Square, Upload, Volume2 } from 'lucide-react'
import './styles.css'

const scenarios = {
  serious: {
    en: { transcript: 'I have had a dry cough for three weeks, chest tightness and difficulty breathing.', reply: 'I understand. A cough lasting more than two weeks with chest tightness needs urgent assessment. I will help connect you to the nearest health clinic.', title: 'RED FLAG · Klinik Kesihatan required', detail: 'Respiratory warning pattern detected. Please seek same-day clinical assessment.', metrics: ['Voice jitter elevated', 'Breath pattern irregular', 'Persistent cough markers'] },
    bm: { transcript: 'Saya batuk kering sudah tiga minggu, dada rasa ketat dan susah bernafas.', reply: 'Baik, saya faham. Batuk lebih dua minggu dengan dada ketat perlu diperiksa segera. Saya akan bantu sambungkan ke Klinik Kesihatan terdekat.', title: 'RED FLAG · Klinik Kesihatan diperlukan', detail: 'Respiratory warning pattern detected. Please seek same-day clinical assessment.', metrics: ['Voice jitter elevated', 'Breath pattern irregular', 'Persistent cough markers'] },
    zh: { transcript: '我已经干咳三周，胸口发闷，呼吸困难。', reply: '明白。咳嗽超过两周并伴有胸闷需要当天就医。我来帮您联系最近的政府诊所。', title: 'RED FLAG · 需到政府诊所就诊', detail: '检测到呼吸道警示模式，请当天就医。', metrics: ['声音抖动偏高', '呼吸模式不规律', '持续咳嗽特征'] },
    tone: 'danger',
  },
  mild: {
    en: { transcript: 'It is just a normal fever and a little runny nose. I am not having trouble breathing.', reply: 'Understood. Your symptoms sound mild for now. Drink water, rest and monitor how you feel. I will send home-care advice by SMS.', title: 'GREEN · Home care guidance', detail: 'No immediate respiratory warning detected. Call again if symptoms worsen.', metrics: ['Voice jitter within range', 'Breath pattern normal', 'Low cough frequency'] },
    bm: { transcript: 'Demam biasa sahaja, selesema sedikit. Saya tidak susah bernafas.', reply: 'Faham. Buat masa ini bunyinya ringan. Minum air, rehat secukupnya dan pantau gejala. Saya hantar nasihat melalui SMS.', title: 'GREEN · Nasihat penjagaan di rumah', detail: 'No immediate respiratory warning detected. Call again if symptoms worsen.', metrics: ['Voice jitter within range', 'Breath pattern normal', 'Low cough frequency'] },
    zh: { transcript: '只是普通发烧，有点流鼻涕，呼吸正常。', reply: '了解。目前症状较轻，请多喝水、多休息并观察变化。我会通过短信发送居家护理建议。', title: 'GREEN · 居家护理建议', detail: '未检测到呼吸道警示，请留意症状变化。', metrics: ['声音抖动正常', '呼吸模式正常', '咳嗽频率低'] },
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
function normalizeLang(lang) { return lang.replace('_', '-').toLowerCase() }
function pickVoiceFromList(voices, lang) {
  const lc = normalizeLang(lang)
  if (lc === 'ms-my') {
    return (
      voices.find((v) => normalizeLang(v.lang) === 'ms-my') ||
      voices.find((v) => normalizeLang(v.lang) === 'ms') ||
      voices.find((v) => normalizeLang(v.lang).startsWith('ms')) ||
      voices.find((v) => /melayu/i.test(v.name)) ||
      voices.find((v) => /malay.*malaysia|malaysia.*malay/i.test(v.name)) ||
      voices.find((v) => /malay/i.test(v.name)) ||
      voices.find((v) => /malaysia/i.test(v.name)) ||
      null
    )
  }
  if (lc === 'zh-cn' || lc === 'zh') {
    return (
      voices.find((v) => normalizeLang(v.lang) === 'zh-cn' || normalizeLang(v.lang) === 'cmn-hans-cn' || normalizeLang(v.lang) === 'cmn-hans-cn-f00') ||
      voices.find((v) => normalizeLang(v.lang).startsWith('zh-cn')) ||
      voices.find((v) => normalizeLang(v.lang).includes('cmn-hans')) ||
      voices.find((v) => normalizeLang(v.lang) === 'zh') ||
      voices.find((v) => normalizeLang(v.lang).startsWith('zh')) ||
      voices.find((v) => /yue|hk|hong kong|guangdong|cantonese/i.test(v.name) && /chinese/i.test(v.name)) ||
      null
    )
  }
  return voices.find((v) => normalizeLang(v.lang) === lc) || voices.find((v) => normalizeLang(v.lang).startsWith(lc.split('-')[0])) || null
}
let networkAudio = null
async function speakWithNativeVoice(text, lang) {
  window.speechSynthesis.cancel()
  if (networkAudio) { networkAudio.pause(); networkAudio = null }
  const voices = await getVoicesAsync()
  const lc = lang.toLowerCase()
  if (lc === 'ms-my') {
    let voice = pickVoiceFromList(voices, 'ms-MY')
    if (!voice) voice = pickVoiceFromList(voices, 'id-ID') || voices.find((v) => normalizeLang(v.lang).startsWith('id'))
    if (voice) {
      const utter = new SpeechSynthesisUtterance(text); utter.lang = voice.lang; utter.voice = voice; utter.rate = 0.9; window.speechSynthesis.speak(utter); return
    }
    try { const encoded = encodeURIComponent(text); const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ms&q=${encoded}`; networkAudio = new Audio(url); networkAudio.crossOrigin = 'anonymous'; await networkAudio.play(); return } catch { console.warn('Malay voice unavailable'); return }
  }
  if (lc === 'zh-cn' || lc === 'zh') {
    let voice = pickVoiceFromList(voices, 'zh-CN')
    if (!voice) voice = voices.find((v) => normalizeLang(v.lang).startsWith('zh')) || voices.find((v) => /chinese/i.test(v.name))
    if (voice) { const utter = new SpeechSynthesisUtterance(text); utter.lang = voice.lang; utter.voice = voice; utter.rate = 0.9; window.speechSynthesis.speak(utter); return }
    try { const encoded = encodeURIComponent(text); const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=zh-CN&q=${encoded}`; networkAudio = new Audio(url); networkAudio.crossOrigin = 'anonymous'; await networkAudio.play(); return } catch { console.warn('Chinese voice unavailable'); return }
  }
  const voice = pickVoiceFromList(voices, lang)
  const utter = new SpeechSynthesisUtterance(text); utter.lang = lang; utter.rate = 0.9; if (voice) utter.voice = voice; window.speechSynthesis.speak(utter)
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
  const [scrolled, setScrolled] = React.useState(false)
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
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      const promptMap = { en: 'What is troubling you? Please tell me. I am listening.', bm: 'Apa masalah anda? Ceritakan kepada saya. Saya sedang mendengar.', zh: '您哪里不舒服？请告诉我，我在听。' }
      const langMap = { en: 'en-US', bm: 'ms-MY', zh: 'zh-CN' }
      speakWithNativeVoice(promptMap[language], langMap[language])
    }
  }
  function handleNumberKey(value) { setCallerNumber((c) => `${c}${value}`.slice(0, 15)) }
  async function startRecording() {
    if (recording) { mediaRecorder.current?.stop(); return }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert(language === 'zh' ? '此浏览器不支持录音，请使用上传功能或使用 Chrome/Edge。' : language === 'bm' ? 'Rakaman tidak tersedia di pelayar ini. Sila gunakan muat naik atau Chrome/Edge.' : 'Recording is not available in this browser. Please use the upload option or Chrome/Edge.')
      return
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      mediaRecorder.current = new MediaRecorder(stream.current)
      mediaRecorder.current.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.current.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url); setAudioName('Recorded voice message')
        stream.current?.getTracks().forEach((t) => t.stop()); setRecording(false); clearInterval(timer.current); setStage('recording')
      }
      mediaRecorder.current.start(); setRecording(true); setStage('recording'); setRecordSeconds(0)
      timer.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      alert(language === 'zh' ? '未获得麦克风权限，您可以改为上传音频文件。' : language === 'bm' ? 'Akses mikrofon tidak dibenarkan. Anda boleh memuat naik fail audio.' : 'Microphone access was not granted. You can upload an audio file instead.')
    }
  }
  function attachFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(file)); setAudioName(file.name); setStage('recording')
  }
  function analyzeVoice(scenario = selectedScenario || 'mild') {
    const data = { ...scenarios[scenario][language], tone: scenarios[scenario].tone }
    setSelectedScenario(scenario); setStage('analyzing')
    setTimeout(() => { setResult(data); setStage('result') }, 1400)
  }
  function reset() {
    clearInterval(timer.current); mediaRecorder.current?.stop(); stream.current?.getTracks().forEach((t) => t.stop())
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (networkAudio) { networkAudio.pause(); networkAudio = null }
    setStage('start'); setRecording(false); setAudioUrl(''); setAudioName(''); setSelectedScenario(null); setResult(null); setRecordSeconds(0); setCallerNumber(''); window.speechSynthesis?.cancel()
  }

  const copy = {
    en: {
      kicker: 'Rural hotline demo — NafasCheck',
      titleA: 'Call.', titleB: 'Speak.', titleC: 'Get', titleAccent: 'care guidance.',
      desc: 'Try the rural toll-free line exactly as a patient would. No login, no form, no medical jargon — just voice.',
      cta: 'Start a call', how: 'How it works',
      trust: ['No data saved', 'Toll-free · 1-800-88-SIHAT', 'EN · BM · 中文'],
      journey: 'Your test journey',
      phoneLive: 'Live demo',
      phoneName: 'MySihat AI — voice triage',
      phoneSub: '1-800-88-SIHAT · Kampung to clinic in 30s',
      previewTitle: 'How the call sounds',
      previewSub: 'Warm, local, unhurried — like a Klinik assistant.',
      noteTitle: 'Why voice?',
      noteSub: 'For low-literacy, low-bandwidth. Works on a basic phone.',
    },
    bm: {
      kicker: 'Demo talian luar bandar — NafasCheck',
      titleA: 'Panggil.', titleB: 'Cerita.', titleC: 'Dapatkan', titleAccent: 'panduan.',
      desc: 'Cuba talian bebas tol seperti pesakit sebenar. Tanpa log masuk, tanpa borang, tanpa jargon.',
      cta: 'Mula panggilan', how: 'Cara ia berfungsi',
      trust: ['Tiada data disimpan', 'Bebas tol · 1-800-88-SIHAT', 'EN · BM · 中文'],
      journey: 'Perjalanan ujian anda',
      phoneLive: 'Demo langsung',
      phoneName: 'MySihat AI — triaj suara',
      phoneSub: '1-800-88-SIHAT · Kampung ke klinik dalam 30s',
      previewTitle: 'Bagaimana panggilan berbunyi',
      previewSub: 'Hangat, tempatan, tidak tergesa — seperti pembantu Klinik.',
      noteTitle: 'Kenapa suara?',
      noteSub: 'Untuk literasi rendah & jalur lebar terhad.',
    },
    zh: {
      kicker: '乡村热线演示 — NafasCheck',
      titleA: '拨打。', titleB: '讲述。', titleC: '获得', titleAccent: '护理指引。',
      desc: '像乡村患者一样体验免费热线。无需登录、无需表格、没有医学术语——只需说话。',
      cta: '开始通话', how: '工作原理',
      trust: ['不保存数据', '免费 · 1-800-88-SIHAT', 'EN · BM · 中文'],
      journey: '您的测试旅程',
      phoneLive: '实时演示',
      phoneName: 'MySihat AI — 语音分诊',
      phoneSub: '1-800-88-SIHAT · 乡村到诊所 30 秒',
      previewTitle: '通话听起来如何',
      previewSub: '温暖、本地、不急促——像诊所助理。',
      noteTitle: '为什么用语音？',
      noteSub: '为低识字率、低带宽设计，普通手机可用。',
    }
  }[language]

  const stageLabels = {
    en: { result: 'Analysis complete', analyzing: 'AI is analyzing', recording: 'Voice message ready', connected: 'Hotline connected', start: 'Ready to call' },
    bm: { result: 'Analisis selesai', analyzing: 'AI sedang menganalisis', recording: 'Mesej suara siap', connected: 'Talian tersambung', start: 'Sedia untuk panggilan' },
    zh: { result: '分析完成', analyzing: 'AI 正在分析', recording: '语音消息已就绪', connected: '热线已接通', start: '准备拨打' },
  }
  const stageLabel = stageLabels[language][stage]

  return (
    <main className="app">
      <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
        <a className="brand" href="/" aria-label="MySihat AI home">
          <span className="brand-mark"><Activity size={18} /></span>
          <span><strong>MySihat AI</strong><small>Voice-first care · NafasCheck</small></span>
        </a>
        <div className="topbar-right">
          <span className="hotline-pill"><i /> <span>1-800-88-SIHAT · Toll-free</span></span>
          <button className="reset-btn" onClick={reset}><RotateCcw size={14} /> Reset</button>
        </div>
      </header>

      <div className="shell hero">
        <div className="hero-copy reveal">
          <span className="kicker"><Sparkles size={12} /> {copy.kicker} <em>— kampung to clinic</em></span>
          <h1>{copy.titleA} <br />{copy.titleB} <br />{copy.titleC} <span>{copy.titleAccent}</span></h1>
          <p className="hero-desc">{copy.desc}</p>
          <div className="hero-actions">
            <a className="btn-primary" href="#call" onClick={(e) => { e.preventDefault(); document.getElementById('call')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
              <PhoneCall size={16} /> {copy.cta} <ArrowRight size={14} />
            </a>
            <span className="btn-ghost"><Clock3 size={14} /> 30s test · {language === 'zh' ? '无需注册' : language === 'bm' ? 'Tanpa daftar' : 'No sign-up'}</span>
          </div>
          <div className="trust-row">
            <span className="trust-chip"><ShieldCheck size={13} /> {copy.trust[0]}</span>
            <span className="trust-chip"><Phone size={13} /> {copy.trust[1]}</span>
            <span className="trust-chip"><Globe2 size={13} /> {copy.trust[2]}</span>
          </div>
        </div>

        <div className="hero-visual reveal-2">
          <div className="dot-grid" aria-hidden />
          <div className="phone-stack">
            <div className="phone-card">
              <div className="phone-top"><small>NafasCheck · voice triage</small><span className="live-badge"><i /> {copy.phoneLive}</span></div>
              <div className="wave-preview">
                <div className="wave-head">
                  <span className="wave-icon"><Volume2 size={16} /></span>
                  <div><strong>{copy.phoneName}</strong><span>{copy.phoneSub}</span></div>
                </div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', opacity: .95 }}>
                  {language === 'zh' ? '“您哪里不舒服？请告诉我，我在听。”' : language === 'bm' ? '“Apa masalah anda? Ceritakan kepada saya. Saya sedang mendengar.”' : '“What is troubling you? Please tell me. I am listening.”'}
                </div>
                <div className="mini-bars">
                  {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ height: `${8 + Math.abs(Math.sin(i * 1.1)) * 18}px`, animationDelay: `${i * 45}ms`, opacity: .9 }} />)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B857F', background: '#F6FBF9', border: '1px solid #E6EDEA', padding: '6px 8px', borderRadius: '999px' }}>Jitter · Breath · Cough</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#0E7A67', background: '#D6F0E9', border: '1px solid #BFE3D6', padding: '6px 8px', borderRadius: '999px' }}>✓ Private demo</span>
              </div>
            </div>
            <div className="floating-note">
              <span style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', background: '#FFF1D6', border: '1px solid #F0D9A8', color: '#8A5A12', flex: '0 0 auto' }}><Clock3 size={16} /></span>
              <div><strong>{copy.noteTitle}</strong><span>{copy.noteSub}</span></div>
            </div>
          </div>
        </div>
      </div>

      <section className="journey reveal-3" aria-label="Call journey progress">
        <div className="journey-top"><span>{copy.journey.toUpperCase()}</span><strong>{progress}%</strong></div>
        <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
        <div className="steps">
          <span className={`step ${progress >= 25 ? 'done' : ''} ${stage === 'connected' ? 'active' : ''}`}><b>1</b> {language === 'zh' ? '拨打' : language === 'bm' ? 'Panggil' : 'Call'}</span>
          <span className={`step ${progress >= 50 ? 'done' : ''} ${stage === 'recording' ? 'active' : ''}`}><b>2</b> {language === 'zh' ? '讲述' : language === 'bm' ? 'Cerita' : 'Speak'}</span>
          <span className={`step ${progress >= 75 ? 'done' : ''} ${stage === 'analyzing' ? 'active' : ''}`}><b>3</b> Analyze</span>
          <span className={`step ${progress === 100 ? 'done' : ''} ${stage === 'result' ? 'active' : ''}`}><b>4</b> {language === 'zh' ? '指引' : language === 'bm' ? 'Panduan' : 'Guidance'}</span>
        </div>
      </section>

      <section id="call" className="call-card reveal-3">
        <div className="call-card-head">
          <div className="head-left"><span className="section-number">01</span><div><p className="card-eyebrow">NafasCheck voice triage</p><h2>{stageLabel}</h2></div></div>
          <span className={`status ${stage !== 'start' ? 'on' : ''}`}><i />{stageLabel}</span>
        </div>
        <div className="call-body">
          <div className="phone-summary">
            <div className="phone-icon"><Phone size={18} /></div>
            <div><strong>MySihat AI hotline</strong><span>1-800-88-SIHAT · Toll-free · {language === 'zh' ? '乡村接入' : language === 'bm' ? 'Akses luar bandar' : 'Rural access'}</span></div>
            <div className={`connection ${stage !== 'start' ? 'on' : ''}`}><i />{stage === 'start' ? 'Offline' : 'Connected'}</div>
          </div>

          {stage === 'start' && (
            <div className="dialer-block">
              <div className="language-picker" aria-label="Choose call language">
                <span>{language === 'zh' ? '通话语言' : language === 'bm' ? 'BAHASA' : 'LANGUAGE'}</span>
                <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
                <button className={language === 'bm' ? 'active' : ''} onClick={() => setLanguage('bm')}>BM</button>
                <button className={language === 'zh' ? 'active' : ''} onClick={() => setLanguage('zh')}>中文</button>
              </div>
              <div className="dialer-screen">
                <span>{language === 'zh' ? '来电号码' : language === 'bm' ? 'PANGGILAN DARIPADA' : 'CALLING FROM'}</span>
                <strong>{callerNumber || (language === 'zh' ? '请输入号码' : language === 'bm' ? 'Masukkan nombor' : 'Enter your number')}</strong>
                <small>{language === 'zh' ? 'MySihat 热线 · 模拟拨号' : language === 'bm' ? 'MySihat hotline · simulasi dail' : 'MySihat hotline · simulated dial'}</small>
              </div>
              <div className="number-pad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => <button key={k} onClick={() => handleNumberKey(k)} aria-label={`Dial ${k}`}>{k}</button>)}
              </div>
              <div className="dialer-actions">
                <button className="delete-key" onClick={() => setCallerNumber((c) => c.slice(0, -1))} aria-label="Delete last digit"><Delete size={18} /></button>
                <button className="call-key" onClick={() => callerNumber && connectCall()} disabled={!callerNumber} aria-label="Call MySihat AI"><PhoneCall size={20} /></button>
                <span />
              </div>
              <p className="dialer-note">{language === 'zh' ? '输入号码后点击绿色拨打' : language === 'bm' ? 'Masukkan nombor, tekan butang hijau' : 'Enter number, then tap green call'}</p>
            </div>
          )}

          {stage !== 'start' && !result && stage !== 'analyzing' && (
            <div className="voice-block" key={language + stage}>
              <div className="ai-callout"><Volume2 size={16} /><span><strong>{language === 'zh' ? 'AI 助手说' : language === 'bm' ? 'Ejen AI berkata' : 'AI agent says'}</strong>{language === 'zh' ? '“您哪里不舒服？请告诉我，我在听。”' : language === 'bm' ? '“Apa masalah anda? Ceritakan kepada saya. Saya sedang mendengar.”' : '“What is troubling you? Please tell me. I am listening.”'}</span></div>
              <div className="voice-prompt">
                <span className="pulse-icon"><Mic size={20} /></span>
                <div>
                  <strong>{recording ? (language === 'zh' ? '正在聆听…' : language === 'bm' ? 'Sedang mendengar…' : 'Listening…') : (language === 'zh' ? '告诉 AI 您的感受' : language === 'bm' ? 'Ceritakan apa yang anda rasa' : 'Tell the AI what you feel')}</strong>
                  <p>{recording ? `● Recording 00:${String(recordSeconds).padStart(2, '0')}` : (language === 'zh' ? '请用中文、马来语或英语自然讲述。' : language === 'bm' ? 'Cakap semula jadi dalam BM atau English.' : 'Speak naturally in English, BM or 中文.')}</p>
                </div>
              </div>
              <button className={`record-btn ${recording ? 'recording' : ''}`} onClick={startRecording}>
                {recording ? <><Square size={16} /> {language === 'zh' ? '停止录音' : language === 'bm' ? 'Henti rakaman' : 'Stop recording'}</> : <><Mic size={16} /> {language === 'zh' ? '录制语音留言' : language === 'bm' ? 'Rakam mesej suara' : 'Record voice message'}</>}
              </button>
              <div className="or-line"><span>{language === 'zh' ? '或试用示例病例' : language === 'bm' ? 'atau cuba kes contoh' : 'or try a sample case'}</span></div>
              <div className="sample-row">
                <button className={selectedScenario === 'serious' ? 'sample selected' : 'sample'} onClick={() => { setSelectedScenario('serious'); setAudioName(language === 'zh' ? '示例：严重呼吸道问题' : language === 'bm' ? 'Contoh: masalah pernafasan serius' : 'Sample: serious concern'); setStage('recording') }}>
                  <strong>{language === 'zh' ? '严重 · 需就医' : language === 'bm' ? 'Serius · Perlu klinik' : 'Serious · Needs clinic'}</strong>
                  <span>{language === 'zh' ? '咳嗽3周 + 胸闷、呼吸困难' : language === 'bm' ? 'Batuk 3 minggu + dada ketat' : '3-week cough + chest tightness'}</span>
                </button>
                <button className={selectedScenario === 'mild' ? 'sample selected' : 'sample'} onClick={() => { setSelectedScenario('mild'); setAudioName(language === 'zh' ? '示例：轻度发烧流涕' : language === 'bm' ? 'Contoh: demam & selesema ringan' : 'Sample: mild fever & cold'); setStage('recording') }}>
                  <strong>{language === 'zh' ? '轻度 · 居家观察' : language === 'bm' ? 'Ringan · Pantau di rumah' : 'Mild · Monitor at home'}</strong>
                  <span>{language === 'zh' ? '普通发烧、流鼻涕，呼吸正常' : language === 'bm' ? 'Demam biasa, selesema sedikit' : 'Low fever, runny nose'}</span>
                </button>
              </div>
              {audioUrl && (
                <div className="attached">
                  <Check size={14} /> {audioName} <audio controls src={audioUrl} />
                </div>
              )}
              <button className={`analyze-btn ${audioUrl || selectedScenario ? 'ready' : ''}`} onClick={() => analyzeVoice()}>
                {language === 'zh' ? '分析语音' : language === 'bm' ? 'Analisis suara' : 'Analyze voice'} <ArrowRight size={16} />
              </button>
              <button className="upload-link" onClick={() => fileInput.current?.click()}><Upload size={13} /> {language === 'zh' ? '或上传音频文件' : language === 'bm' ? 'Atau muat naik audio' : 'Or upload audio file'}</button>
              <input ref={fileInput} type="file" accept="audio/*" hidden onChange={attachFile} />
              <div className="real-call-link">{language === 'zh' ? '真实热线仍为模拟演示' : language === 'bm' ? 'Talian sebenar masih simulasi demo' : 'Real hotline remains a simulated demo'}</div>
            </div>
          )}

          {stage === 'analyzing' && (
            <div className="analyzing">
              <div className="analysis-orbit"><Activity size={26} /></div>
              <h3>{language === 'zh' ? 'AI 正在分析呼吸信号' : language === 'bm' ? 'AI sedang menganalisis isyarat pernafasan' : 'AI is listening for respiratory signals'}</h3>
              <p>{language === 'zh' ? '检测声音抖动、呼吸模式和咳嗽特征…' : language === 'bm' ? 'Memeriksa jitter suara, corak pernafasan…' : 'Checking voice jitter, breath pattern and cough markers…'}</p>
              <div className="signal-bars">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 45}ms`, height: `${10 + (i % 4) * 5}px` }} />)}</div>
            </div>
          )}

          {result && (
            <div className="result-block">
              <div className={`result-banner ${result.tone}`}>
                <div className="result-symbol">{result.tone === 'danger' ? '!' : '✓'}</div>
                <div>
                  <span>{language === 'zh' ? '初步分诊结果' : language === 'bm' ? 'KEPUTUSAN TRIAJ AWAL' : 'PRELIMINARY TRIAGE RESULT'}</span>
                  <h3>{result.title}</h3>
                  <p>{result.detail}</p>
                </div>
              </div>
              <div className="result-grid">
                <div><span>{language === 'zh' ? '我们听到的' : language === 'bm' ? 'Apa yang kami dengar' : 'What we heard'}</span><p>“{result.transcript}”</p></div>
                <div><span>{language === 'zh' ? 'AI 语音回复' : language === 'bm' ? 'Balasan suara AI' : 'AI voice reply'}</span><p>{result.reply}</p></div>
              </div>
              <div className="metrics">{result.metrics.map((m) => <span key={m}><Check size={12} /> {m}</span>)}</div>
              <div className="next-step">
                <strong>{language === 'zh' ? (result.tone === 'danger' ? '下一步：请今天就医' : '下一步：在家观察') : language === 'bm' ? (result.tone === 'danger' ? 'Langkah seterusnya: dapatkan rawatan hari ini' : 'Langkah seterusnya: pantau di rumah') : (result.tone === 'danger' ? 'Next step: seek care today' : 'Next step: monitor at home')}</strong>
                <span>{language === 'zh' ? (result.tone === 'danger' ? '将通过短信发送位置支持和政府诊所路线。' : '将通过短信发送居家护理建议。若呼吸恶化请再次来电。') : language === 'bm' ? (result.tone === 'danger' ? 'Sokongan lokasi & arah Klinik Kesihatan akan dihantar via SMS.' : 'Nasihat penjagaan di rumah via SMS. Hubungi semula jika bertambah buruk.') : (result.tone === 'danger' ? 'Location support and Klinik Kesihatan directions would be sent by SMS.' : 'Home care advice would be sent by SMS. Call again if breathing worsens.')}</span>
              </div>
              <button className="again-btn" onClick={reset}>{language === 'zh' ? '再试一条语音' : language === 'bm' ? 'Cuba mesej lain' : 'Try another voice message'} <ArrowRight size={15} /></button>
            </div>
          )}
        </div>
      </section>

      <footer>
        <span>Buildability demo · Not a medical diagnosis · No data stored</span>
        <span>Designed for low-bandwidth · Works on basic phones · Rural-first</span>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
