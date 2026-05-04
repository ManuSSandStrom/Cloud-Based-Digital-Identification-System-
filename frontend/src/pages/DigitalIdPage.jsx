import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../components/common/Button.jsx';
import DigitalIdCard from '../components/common/DigitalIdCard.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import { userService } from '../services/userService.js';
import { showToast } from '../features/ui/uiSlice.js';

export default function DigitalIdPage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const pdfBlob = await userService.downloadId();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.uniqueID}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Failed to generate or download Digital ID PDF.',
        }),
      );
      console.error('PDF download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Digital ID Card"
        subtitle="Your QR-enabled digital identity card can be downloaded as a PDF anytime."
        action={
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        }
      >
        <DigitalIdCard user={user} />
      </SectionCard>
    </div>
  );
}
