import { useEffect, useMemo, useState } from 'react';

const ExamSharePublic = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const fileName = useMemo(() => params.get('examName'), [params]);

  const fileType = useMemo(() => {
    return fileName?.split('.').pop()?.toLowerCase();
  }, [fileName]);

  const cloudinaryUrl = useMemo(() => {
    if (!fileName) return '';

    if (fileType === 'pdf') {
      return 'http://res.cloudinary.com/delkz1vi9/image/upload/v1763217160/documents/' + fileName;
    }

    const rawUrl =
      'http://res.cloudinary.com/delkz1vi9/raw/upload/v1763217160/documents/' + fileName;

    return 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(rawUrl);
  }, [fileName, fileType]);

  const expire = useMemo(() => params.get('expires'), [params]);

  const isExpired = useMemo(() => {
    if (!expire) return false;
    const now = new Date();
    return now > new Date(expire);
  }, [expire]);

  const initialDuration = 3600;
  const storageKey = 'exam_end_time_public';

  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isTimeInitialized, setIsTimeInitialized] = useState(false);

  useEffect(() => {
    const storedEndTime = sessionStorage.getItem(storageKey);
    const now = Date.now();
    let endTime;

    if (storedEndTime) {
      endTime = parseInt(storedEndTime, 10);
    } else {
      endTime = now + initialDuration * 1000;
      sessionStorage.setItem(storageKey, endTime.toString());
    }

    const initialTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeLeft(initialTimeLeft);
    setIsTimeInitialized(true);
  }, []);

  useEffect(() => {
    if (!isTimeInitialized) return;

    const interval = setInterval(() => {
      const storedEndTime = sessionStorage.getItem(storageKey);
      if (!storedEndTime) {
        clearInterval(interval);
        return;
      }

      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const newTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        clearInterval(interval);
        sessionStorage.removeItem(storageKey);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimeInitialized]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentExpire = new URLSearchParams(window.location.search).get('expires');
      const isCurrentExpired = currentExpire && new Date() > new Date(currentExpire);

      if (isCurrentExpired) {
        window.location.reload();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const block = (e: any) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('dragstart', block);

    const blockKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || ['F12', 'PrtScreen', 'F11'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('selectstart', block);
      document.removeEventListener('dragstart', block);
      window.removeEventListener('keydown', blockKeys);
    };
  }, []);

  useEffect(() => {
    const detect = setInterval(() => {
      if (
        window.outerWidth - window.innerWidth > 200 ||
        window.outerHeight - window.innerHeight > 200
      ) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(detect);
  }, []);

  if (isExpired) {
    return (
      <div style={{ padding: 20, textAlign: 'center', margin: '200px auto' }}>
        <h1>Bạn đã hết thời gian làm bài !</h1>
      </div>
    );
  }

  const isWarning = timeLeft <= 5 * 60 && timeLeft > 0;
  const isCritical = timeLeft <= 60 && timeLeft > 0;

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
      }}
      onContextMenu={e => e.preventDefault()}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.15)',
        }}
      />

      <iframe
        src={`${cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title="PDF Viewer"
        width="100%"
        height="100%"
        style={{
          border: 'none',
          pointerEvents: 'auto',
          userSelect: 'none',
          overflow: 'auto',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 20,
          background: isCritical ? 'red' : isWarning ? 'orange' : 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '12px',
          fontSize: '20px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          backdropFilter: 'blur(3px)',
        }}
      >
        {timeLeft > 0 ? formatTime(timeLeft) : 'HẾT GIỜ'}
      </div>
    </div>
  );
};

export default ExamSharePublic;
