const ExamSharePublic = () => {
  const fileName = window.location.pathname.split('/').pop();
  const fileType = fileName?.split('.').pop()?.toLowerCase();
  const cloudinaryUrl =
    fileType === 'pdf'
      ? 'http://res.cloudinary.com/delkz1vi9/image/upload/v1763217160/documents/' + fileName
      : 'https://view.officeapps.live.com/op/embed.aspx?src=' +
        encodeURIComponent(
          'http://res.cloudinary.com/delkz1vi9/raw/upload/v1763217160/documents/' + fileName,
        );
  const expire = new URLSearchParams(window.location.search).get('expires');

  const isExpired = expire && new Date() > new Date(expire);

  if (isExpired) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Liên kết chia sẻ đã hết hạn</h2>
        <p>Vui lòng liên hệ người chia sẻ để lấy liên kết mới.</p>
      </div>
    );
  }

  return (
    <div>
      <iframe
        src={cloudinaryUrl}
        title="PDF Viewer"
        width="100%"
        height="90%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default ExamSharePublic;
