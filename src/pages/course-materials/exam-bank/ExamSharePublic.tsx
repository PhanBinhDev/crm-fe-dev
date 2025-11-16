import { useEffect, useMemo } from 'react';

const ExamSharePublic = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const fileName = useMemo(() => params.get('examName'), [params]);

  const fileType = useMemo(() => {
    return fileName?.split('.').pop()?.toLowerCase();
  }, [fileName]);

  //để tạm, sau cho về biến môi trường
  const cloudinaryUrl = useMemo(() => {
    if (!fileName) return '';

    if (fileType === 'pdf') {
      return 'http://res.cloudinary.com/delkz1vi9/image/upload/v1763217160/documents/' + fileName;
    }

    // Office viewer cho doc/docx
    const rawUrl =
      'http://res.cloudinary.com/delkz1vi9/raw/upload/v1763217160/documents/' + fileName;

    return 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(rawUrl);
  }, [fileName, fileType]);

  const expire = useMemo(() => params.get('expires'), [params]);

  const isExpired = useMemo(() => {
    if (!expire) return false;

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return now > new Date(expire);
  }, [expire]);

  //chưa ngăn chặn được việc chuột phải lưu đề về
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 's' || e.key === 'p')) || e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', blockKeys);
    return () => window.removeEventListener('keydown', blockKeys);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentExpire = new URLSearchParams(window.location.search).get('expires');
      const isCurrentExpired =
        currentExpire &&
        new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })) >
          new Date(currentExpire);

      if (isCurrentExpired) {
        window.location.reload();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [params]);

  if (isExpired) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Liên kết chia sẻ đã hết hạn</h2>
        <p>Vui lòng liên hệ người chia sẻ để lấy liên kết mới.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh' }} onContextMenu={e => e.preventDefault()}>
      <iframe
        src={`${cloudinaryUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title="PDF Viewer"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default ExamSharePublic;
