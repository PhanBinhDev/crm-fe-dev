import FileAttachments from './FileAttachments';

interface FormAddReminderProps {
  openUploader: boolean;
}

const FormAddReminder = ({ openUploader }: FormAddReminderProps) => {
  return <>{openUploader && <FileAttachments view="internal" />}</>;
};

export default FormAddReminder;
